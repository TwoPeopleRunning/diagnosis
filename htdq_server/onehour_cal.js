/**
 * Dependencies
 */
var express = require('express');
var db = require('./db/index');
var config = require('./config');
var debug = require('debug')('htdq');

var ONEHOUR = db.ONEHOUR;
var MDSTATUS = db.MDC_MDSTATUS;
var TOOLS = db.MDC_MACHINETOOLS;
/**
 * Connect to database first
 */
db.connect(config.db.uri, config.db.options);
db.connection.on('error', function (err) {
    debug('Connect to DB failed!');
    debug(err);
    process.exit(1);
});
db.connection.on('open', function () {
    debug('Connect to DB successful!');
});

//数据库里已有的算好的最后一条数据
ONEHOUR.find({}).sort({ 'LABEL': -1 }).limit(1).exec(function (err, data) {
    var end;
    if (err) {
        console.log(err);
        return;
    }
    if ((!data && config.defaultEndtime) || config.UseEnd) {
        end = config.defaultEndtime;
    } else {
        end = Number(data[0].LABEL) * 600000;
    }
    start = config.defaultStarttime;
    onceCal(start, end)
})


function onceCal(start, end) {
    console.log("onceCal" + end)
    if (start.getTime() > end) {
        console.log('caculate finish')
        return;
    }
    Caculate(end, function (callback) {
        if (callback) {
            newEnd = end - 600000;
            // console.log(new Date(newEnd));
            onceCal(start, newEnd)
        }
    })
    return;
}




//生成标签
function Genlabel(now) {
    time = now.getTime()
    label = String(Math.floor(time / 600000))
    return label
}


//统计计算
function Caculate(now, callback) {
    console.log('Caculate' + now)
    time = new Date(now);
    ENDTIME = new Date(now - now % 600000);
    BEGINTIME = new Date(now - now % 600000 - 600000);
    label = Genlabel(time)
    Gettools(label, new Date(BEGINTIME), new Date(ENDTIME), function (callback2) {
        if (callback2) {
            callback(true);
        }
    })
}

//获取机床列表,并计算
function Gettools(label, BEGINTIME, ENDTIME, callback) {
    var timeTemp = convertTime(ENDTIME) - convertTime(BEGINTIME);
    var Result = [];
    var Temp = new Array(100);
    var nodataNodes = [];
    var checkedNodes = [];
    var count = 0;
    TOOLS.find({}).sort({ 'ID': 1 }).exec(function (err, Mtools) {
        console.log("mtools" + err)
        if (err) {
            return;
        }
        Mtools.forEach(function (tool, index) {
            var condition = {
                "$or": [{
                    "BEGINTIME": { "$gt": BEGINTIME },
                    "ENDTIME": { "$lt": ENDTIME },
                    "MTID": tool.ID
                }, {
                    "BEGINTIME": { "$lt": BEGINTIME },
                    "ENDTIME": { "$gt": BEGINTIME },
                    "MTID": tool.ID
                }, {
                    "BEGINTIME": { "$lt": ENDTIME },
                    "ENDTIME": { "$gt": ENDTIME },
                    "MTID": tool.ID
                }
                ]
            };
            MDSTATUS.find(condition).exec(function (err, MDSTATUSs) {
                // console.log("MDSTATUS " + tool.ID + " " + err)
                if (err) {
                    return;
                }
                if (MDSTATUSs.length != 0) {
                    Obj = new Array(8)
                    result = Static(MDSTATUSs, timeTemp, BEGINTIME, ENDTIME);
                    // Obj.MTID = result.MTID; //设备编号
                    // Obj.MTNAME = tool.MATOLNAME; //设备名称
                    Obj[0] = result.RunTime; //运行时间
                    Obj[1] = result.OnTime; //在线时间
                    Obj[2] = result.OnlineTime; //空闲时间
                    Obj[3] = result.AlarmTime; //报警时间
                    Obj[4] = result.OfflineTime; //关机时间
                    Obj[5] = result.WholeTime; //自然时间
                    Obj[6] = result.AlarmNum; //报警次数
                    Obj[7] = result.RunNum; //运行次数
                    Temp[result.MTID] = Obj;
                    count += 1;
                    // checkedNodes.push({ "id": Mtool[0].ID, "name": Mtool[0].MATOLNAME });
                } else {
                    nodataNodes.push(tool.MATOLNAME);
                }
                if (count == Mtools.length - nodataNodes.length) {

                    ONEHOUR.nameIsUni(label, function (err) {
                        if (err) {
                            console.log('save failed')
                            callback(true);
                            return;
                        }
                        ONEHOUR.getNextID(function (err, ID) {
                            var data = {
                                ID: ID,
                                LABEL: label,
                                RESULT: Temp
                            };
                            (new ONEHOUR(data)).save(function (err, data) {
                                if (err) {
                                    console.log('save failed')
                                    callback(true);
                                    return;
                                }
                                console.log('save success')
                                callback(true);
                            });
                        });

                    })
                }
            });
        });
    });
}

//统计计算
function Static(mtdata, timeTemp, BEGINTIME, ENDTIME) {
    length = mtdata.length;
    Runtime = 0;
    Onlinetime = 0;
    Alarmtime = 0;
    Offlinetime = 0;
    AlarmNum = 0;
    RunNum = 0;
    Wholetime = timeTemp;
    mtdata.forEach(function (onedata, index) {
        if (mtdata[index].STATUS == "RUNNING") {
            mtdata[index]["DURATION"] = Jugetime(mtdata[index], BEGINTIME, ENDTIME);
            Runtime += mtdata[index]["DURATION"];
            RunNum += 1;
        };
        if (mtdata[index].STATUS == "ALARM") {
            mtdata[index]["DURATION"] = Jugetime(mtdata[index], BEGINTIME, ENDTIME);
            Alarmtime += mtdata[index]["DURATION"];
            AlarmNum += 1;
        };
        if (mtdata[index].STATUS == "ONLINE") {
            mtdata[index]["DURATION"] = Jugetime(mtdata[index], BEGINTIME, ENDTIME);
            Onlinetime += mtdata[index]["DURATION"]
        };
        if (mtdata[index].STATUS == "OFFLINE") {
            mtdata[index]["DURATION"] = Jugetime(mtdata[index], BEGINTIME, ENDTIME);
            Offlinetime += mtdata[index]["DURATION"]
        };
    });
    Ontime = Runtime + Onlinetime + Alarmtime;
    return {
        "MTID": mtdata[0].MTID,
        "RunTime": Runtime,
        "OnTime": Ontime,
        "OnlineTime": Onlinetime,
        "AlarmTime": Alarmtime,
        "OfflineTime": Offlinetime,
        "WholeTime": Wholetime,
        "AlarmNum": AlarmNum,
        "RunNum": RunNum
    };
};

function convertTime(date) {
    var timestamp = Date.parse(date);
    return timestamp / 1000;
};


//校正DURATION
function Jugetime(data, BEGINTIME, ENDTIME) {
    if (data.BEGINTIME < BEGINTIME & BEGINTIME < data.ENDTIME & data.ENDTIME < ENDTIME) {
        data.DURATION = convertTime(data.ENDTIME) - convertTime(BEGINTIME);
    }
    if (data.BEGINTIME < ENDTIME & ENDTIME < data.ENDTIME & data.BEGINTIME > BEGINTIME) {
        data.DURATION = convertTime(ENDTIME) - convertTime(data.BEGINTIME);
    }
    if (data.BEGINTIME < BEGINTIME & data.ENDTIME > ENDTIME) {
        data.DURATION = convertTime(ENDTIME) - convertTime(BEGINTIME)
    }
    return data.DURATION
}

