

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


now = new Date();
// end = new Date('2017-12-26 11:13:23').getTime()
//周期性计算
setInterval(function () {
    now = new Date();
    for (let index = 0; index < 60; index++) {
        Caculate(new Date(now.getTime() - 600000 * index))
    }
}, 36000000)
// console.log("come in")


//生成标签
function Genlabel(now) {
    time = now.getTime()
    label = String(Math.floor(time / 600000))
    return label
}


//统计计算
function Caculate(now) {
    time = now.getTime()
    ENDTIME = new Date(time - time % 600000)
    BEGINTIME = new Date(time - time % 600000 - 600000)
    // ENDTIME = String(year) + '-' + String(month) + '-' + String(day) + ' ' + String(hour + 8) + ':00:00'
    // BEGINTIME = String(year) + '-' + String(month) + '-' + String(day) + ' ' + String(hour + 7) + ':00:00'
    label = Genlabel(now)
    Gettools(label, new Date(BEGINTIME), new Date(ENDTIME))
}

//获取机床列表,并计算
function Gettools(label, BEGINTIME, ENDTIME) {
    var timeTemp = convertTime(ENDTIME) - convertTime(BEGINTIME);
    var Result = [];
    var Temp = new Array(100);
    var nodataNodes = [];
    var checkedNodes = [];
    var count = 0;
    TOOLS.find({}).sort({ 'ID': 1 }).exec(function (err, Mtools) {
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
                if (err) {
                    return;
                }
                if (MDSTATUSs.length != 0) {
                    // var Obj = {
                    //     "MTID": "",
                    //     "MTNAME": "",
                    //     "RunTime": "",
                    //     "OnTime": "",
                    //     "OnlineTime": "",
                    //     "AlarmTime": "",
                    //     "OfflineTime": "",
                    //     "WholeTime": "",
                    //     "AlarmNum": "",
                    //     "RunNum": ""
                    // };
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
                                    return;
                                }
                                console.log('save success')
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
    // Runtime = Runtime / 3600.0;
    // Onlinetime = Onlinetime / 3600.0;
    // Alarmtime = Alarmtime / 3600.0;
    // Offlinetime = Offlinetime / 3600.0;
    // Wholetime = Wholetime / 3600.0;
    Ontime = Runtime + Onlinetime + Alarmtime;
    // RunEff = Runtime / Ontime;
    // UseRatio = Runtime / Wholetime;
    // OnRatio = Ontime / Wholetime;
    // RunRatio = Runtime / Wholetime;
    // OnlineRatio = Onlinetime / Wholetime;
    // AlarmRatio = Alarmtime / Wholetime;
    // OfflineRatio = Offlinetime / Wholetime;
    // OnRatio = Ontime / Wholetime;
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
