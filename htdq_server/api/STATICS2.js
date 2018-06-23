/**
 * Dependencies
 */
var express = require('express');
var mixin = require('utils-merge');
var config = require('../config');

var db = require('../db/index');
/**
 * STATICS
 */
var MDSTATUS = db.MDC_MDSTATUS;
var TOOLS = db.MDC_MACHINETOOLS;

/**
 * Exports
 */
module.exports = exports = express.Router();

/**
 * Private variables and functions
 */

function SortEff(Data) {
    var Eff = [];
    var Use = [];
    var On = [];
    var Name = [];
    var sumOn = 0;
    var sumOnline = 0;
    var sumAlarm = 0;
    var sumOffline = 0;
    var sumRun = 0;
    var sumWholetime = 0;
    var sumEffRatio = 0;
    var sumUseRatio = 0;
    var sumOnRatio = 0;
    var sumOnlineRatio = 0;
    var sumAlarmRatio = 0;
    var sumOfflineRatio = 0;
    Data.forEach(function (data, index) {
        Eff[index] = data.RunEff;
        Name[index] = data.MTNAME;
        Use[index] = data.UseRatio;
        On[index] = data.OnRatio;
        sumOn += data.OnTime;
        sumOnline += data.OnlineTime;
        sumAlarm += data.AlarmTime;
        sumOffline += data.OfflineTime;
        sumRun += data.RunTime
        sumWholetime += data.WholeTime;
        sumEffRatio += data.RunEff;
        sumUseRatio += data.UseRatio;
        sumOnRatio += data.OnRatio;
        sumOnlineRatio += data.OnlineRatio;
        sumAlarmRatio += data.AlarmRatio;
        sumOfflineRatio += data.OfflineRatio;
    });
    maxEff = Math.max.apply(null, Eff); //最高效率
    max_index = Eff.indexOf(maxEff); //最高效率索引
    minEff = Math.min.apply(null, Eff); //最低效率
    min_index = Eff.indexOf(minEff); //最低效率索引

    maxUse = Math.max.apply(null, Use); //最高利用率
    maxUse_index = Use.indexOf(maxUse); //最高利用率索引
    minUse = Math.min.apply(null, Use); //最低利用率
    minUse_index = Use.indexOf(minUse); //最低利用率索引

    maxOn = Math.max.apply(null, On); //最高开机率
    maxOn_index = On.indexOf(maxOn); //最高开机率索引
    minOn = Math.min.apply(null, On); //最低开机率
    minOn_index = On.indexOf(minOn); //最低开机率索引

    avaEff = sumEffRatio / Data.length; //平均效率
    avaUse = sumUseRatio / Data.length; //平均利用率、运行率
    avaOn = sumOnRatio / Data.length; //平均开机率
    avaOnline = sumOnlineRatio / Data.length; //平均空闲率
    avaAlarm = sumAlarmRatio / Data.length; //平均报警率
    avaOffline = sumOfflineRatio / Data.length; //平均关机率
    //[0最高效率、1最高效率设备、2最低效率、3最低效率设备、4平均效率、5总运行时间、6总开机时间
    //7最高利用率、8最高利用率设备、9最低利用率、10最低利用率设备、11平均利用率、12总自然时间、
    //13最高开机率、14最高开机率设备、15最低开机率、16最低开机率设备、17平均开机、18总空闲、19总报警
    //20总关机、21平均空闲、22平均报警、23平均关机 ]
    return [maxEff, Name[max_index], minEff, Name[min_index], avaEff,
        sumRun, sumOn, maxUse, Name[maxUse_index], minUse, Name[minUse_index], avaUse, sumWholetime,
        maxOn, Name[maxOn_index], minOn, Name[minOn_index], avaOn, sumOnline,
        sumAlarm, sumOffline, avaOnline, avaAlarm, avaOffline
    ]
};

var Jugetime = function (data, BEGINTIME, ENDTIME) {
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
var Static = function (mtdata, timeTemp, BEGINTIME, ENDTIME) {
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
    Runtime = Runtime / 3600.0;
    Onlinetime = Onlinetime / 3600.0;
    Alarmtime = Alarmtime / 3600.0;
    Offlinetime = Offlinetime / 3600.0;
    Wholetime = Wholetime / 3600.0;
    Ontime = Wholetime - Offlinetime;
    RunEff = Runtime / Ontime;
    UseRatio = Runtime / Wholetime;
    OnRatio = Ontime / Wholetime;
    RunRatio = Runtime / Wholetime;
    OnlineRatio = Onlinetime / Wholetime;
    AlarmRatio = Alarmtime / Wholetime;
    OfflineRatio = Offlinetime / Wholetime;
    OnRatio = Ontime / Wholetime;
    return {
        "MTID": mtdata[0].MTID,
        "RunTime": Runtime,
        "OnTime": Ontime,
        "OnlineTime": Onlinetime,
        "AlarmTime": Alarmtime,
        "OfflineTime": Offlinetime,
        "RunEff": RunEff,
        "WholeTime": Wholetime,
        "UseRatio": UseRatio,
        "OnRatio": OnRatio,
        "RunRatio": RunRatio,
        "OnlineRatio": OnlineRatio,
        "AlarmRatio": AlarmRatio,
        "OfflineRatio": OfflineRatio,
        "OnRatio": OnRatio,
        "AlarmNum": AlarmNum,
        "RunNum": RunNum
    };
};

var convertTime = function (date) {
    var timestamp = Date.parse(date);
    return timestamp / 1000;
};

function GetQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return (r[2]);
    return null;
}

// STATICS management  api/MDC_MNT
exports.route('/').post(function (req, res) {
    // var limit = Number(req.query.limit) || config.page.limit;
    // var skip = Number(req.query.skip) || 0;
    var mtid = req.body.MTID;
    if (!Array.isArray(mtid)) {
        mtid = JSON.parse(mtid);
    }
    var BEGINTIME = new Date(req.body.BEGINTIME);
    var ENDTIME = new Date(req.body.ENDTIME);
    var timeTemp = convertTime(ENDTIME) - convertTime(BEGINTIME);
    var Result = [];
    var Temp = [];
    var nodataNodes = [];
    var checkedNodes = [];

    mtid.forEach(function (ID, index) {
        //获取机床名称
        TOOLS.find({ "ID": ID }).exec(function (err, Mtool) {
            if (err) {
                res.send(err);
                return;
            }
            // if (Mtool.length == 0) {
            //     continue;
            //     // res.send({ 'err': '不存在' + ID + '的机床' });
            //     // return;
            // }
            var condition = {
                "$or": [{
                    "BEGINTIME": { "$gt": BEGINTIME },
                    "ENDTIME": { "$lt": ENDTIME },
                    "MTID": ID
                }, {
                    "BEGINTIME": { "$lt": BEGINTIME },
                    "ENDTIME": { "$gt": BEGINTIME },
                    "MTID": ID
                }, {
                    "BEGINTIME": { "$lt": ENDTIME },
                    "ENDTIME": { "$gt": ENDTIME },
                    "MTID": ID
                }
                ]
            };
            MDSTATUS.find(condition).sort({ "BEGINTIME": 1 }).exec(function (err, MDSTATUSs) {
                if (err) {
                    res.send(err);
                    return;
                }
                if (MDSTATUSs.length != 0) {
                    var Obj = {
                        "MTID": "",
                        "MTNAME": "",
                        "RunTime": "",
                        "OnTime": "",
                        "OnlineTime": "",
                        "AlarmTime": "",
                        "OfflineTime": "",
                        "RunEff": "",
                        "WholeTime": "",
                        "UseRatio": "",
                        "OnRatio": "",
                        "RunRatio": "",
                        "OfflineRatio": "",
                        "AlarmRatio": "",
                        "AlarmNum": "",
                        "RunNum": ""
                    };
                    result = Static(MDSTATUSs, timeTemp, BEGINTIME, ENDTIME);
                    Obj.MTID = result.MTID; //设备编号
                    Obj.MTNAME = Mtool[0].MATOLNAME; //设备名称
                    Obj.RunTime = result.RunTime; //运行时间
                    Obj.OnTime = result.OnTime; //在线时间
                    Obj.OnlineTime = result.OnlineTime; //空闲时间
                    Obj.AlarmTime = result.AlarmTime; //报警时间
                    Obj.OfflineTime = result.OfflineTime; //关机时间
                    Obj.RunEff = result.RunEff; //运行效率
                    Obj.WholeTime = result.WholeTime; //自然时间
                    Obj.UseRatio = result.UseRatio; //利用率/运行率
                    Obj.OnRatio = result.OnRatio; //开机率
                    Obj.OnlineRatio = result.OnlineRatio //开机率
                    Obj.RunRatio = result.RunRatio; //运行比率
                    Obj.OfflineRatio = result.OfflineRatio; //关机比率
                    Obj.AlarmRatio = result.AlarmRatio; //报警比率
                    Obj.AlarmNum = result.AlarmNum; //报警次数
                    Obj.RunNum = result.RunNum; //运行次数
                    Temp.push(Obj);
                    checkedNodes.push({ "id": Mtool[0].ID, "name": Mtool[0].MATOLNAME });
                } else {
                    nodataNodes.push(Mtool[0].MATOLNAME);
                }
                while (Temp.length == mtid.length - nodataNodes.length) {
                    Result = Temp;
                    if (nodataNodes.length == 0) {
                        res.send({ "RESULT": Result, "nodataNodes": nodataNodes, "checkedNodes": checkedNodes });
                        return;
                    }
                    else {
                        if (Result.length == 0) {
                            res.send({ "error": "没有符合条件数据" });
                            return;
                        } else {
                            res.send({ "RESULT": Result, "nodataNodes": nodataNodes, "checkedNodes": checkedNodes });
                            return;
                        }

                        // message = "";
                        // nodataNodes.forEach(function (node) {
                        //     message += node + ","
                        // })
                        // alert("查询不到" + message + "设备数据,只显示可查询到的数据或请重新选择查询条件(设备列表/时间区间)");
                        // parent.window.location.href = "/config/ppt.html"
                        // break;
                    }
                }

            });

        });
    });
});
