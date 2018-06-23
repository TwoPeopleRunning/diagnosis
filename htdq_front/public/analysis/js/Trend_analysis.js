Tools = JSON.parse(get_cookie("checkednodes"));
// console.log(Tools)
var begin = new Date($("#start", window.parent.document).val());
var end = new Date($("#end", window.parent.document).val());
var Result = [];

$.ajaxSetup({
    async: false //取消异步  
});

function get_cookie(Name) {
    var search = Name + "=" //查询检索的值
    var returnvalue = ""; //返回值
    if (parent.window.document.cookie.length > 0) {
        sd = parent.window.document.cookie.indexOf(search);
        if (sd != -1) {
            sd += search.length;
            end = parent.window.document.cookie.indexOf(";", sd);
            if (end == -1)
                end = parent.window.document.cookie.length;
            //unescape() 函数可对通过 escape() 编码的字符串进行解码。
            returnvalue = unescape(parent.window.document.cookie.substring(sd, end))
        }
    }
    return returnvalue;
}

var convertTime = function (date) {
    var timestamp = Date.parse(date);
    return timestamp / 1000;
};

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

    var monthRun = sumRun / sumOn;//总运行效率
    var monthUse = sumRun / sumWholetime;//总利用率
    var monthOn = sumOn / sumWholetime;//总开机率
    // maxEff = Math.max.apply(null, Eff); //最高效率
    // max_index = Eff.indexOf(maxEff); //最高效率索引
    // minEff = Math.min.apply(null, Eff); //最低效率
    // min_index = Eff.indexOf(minEff); //最低效率索引

    // maxUse = Math.max.apply(null, Use); //最高利用率
    // maxUse_index = Use.indexOf(maxUse); //最高利用率索引
    // minUse = Math.min.apply(null, Use); //最低利用率
    // minUse_index = Use.indexOf(minUse); //最低利用率索引

    // maxOn = Math.max.apply(null, On); //最高开机率
    // maxOn_index = On.indexOf(maxOn); //最高开机率索引
    // minOn = Math.min.apply(null, On); //最低开机率
    // minOn_index = On.indexOf(minOn); //最低开机率索引

    // avaEff = sumEffRatio / Data.length; //平均效率
    // avaUse = sumUseRatio / Data.length; //平均利用率、运行率
    // avaOn = sumOnRatio / Data.length; //平均开机率
    // avaOnline = sumOnlineRatio / Data.length; //平均空闲率
    // avaAlarm = sumAlarmRatio / Data.length; //平均报警率
    // avaOffline = sumOfflineRatio / Data.length; //平均关机率
    // //[0最高效率、1最高效率设备、2最低效率、3最低效率设备、4平均效率、5总运行时间、6总开机时间
    // //7最高利用率、8最高利用率设备、9最低利用率、10最低利用率设备、11平均利用率、12总自然时间、
    // //13最高利用率、14最高利用率设备、15最低利用率、16最低利用率设备、17平均开机、18总空闲、19总报警
    // //20总关机、21平均空闲、22平均报警、23平均关机 ]
    // return [maxEff, Name[max_index], minEff, Name[min_index], avaEff,
    //     sumRun, sumOn, maxUse, Name[maxUse_index], minUse, Name[minUse_index], avaUse, sumWholetime,
    //     maxOn, Name[maxOn_index], minOn, Name[minOn_index], avaOn, sumOnline,
    //     sumAlarm, sumOffline, avaOnline, avaAlarm, avaOffline
    // ]
    return [monthRun, monthUse, monthOn];
};

var Static = function (mtdata) {
    length = mtdata.length;
    Runtime = 0;
    Onlinetime = 0;
    Alarmtime = 0;
    Offlinetime = 0;
    AlarmNum = 0;
    Wholetime = convertTime((mtdata[length - 1]).ENDTIME) - convertTime(mtdata[0].BEGINTIME)
    mtdata.forEach(function (onedata, index) {
        if (mtdata[index].STATUS == "RUNNING") {
            Runtime += mtdata[index]["DURATION"]
        };
        if (mtdata[index].STATUS == "ALARM") {
            Alarmtime += mtdata[index]["DURATION"];
            AlarmNum += 1;
        };
        if (mtdata[index].STATUS == "ONLINE") {
            Onlinetime += mtdata[index]["DURATION"]
        };
        if (mtdata[index].STATUS == "OFFLINE") {
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
        "AlarmNum": AlarmNum
    };
};

function GenDatelable(begin, end) {
    yearBegin = begin.getFullYear();
    yearEnd = end.getFullYear();
    monthBegin = begin.getMonth();
    monthEnd = end.getMonth();
    var month = monthBegin;
    var year = yearBegin;
    var date = [];
    if (yearBegin == yearEnd) {
        monthNum = monthEnd - monthBegin + 1;
    } else {
        monthNum = (12 - monthBegin) + (yearEnd - yearBegin - 1) * 12 + monthEnd + 1;
    };
    for (var index = 0; index < monthNum - 1; index++) {
        month = month + 1;
        if (month > 12) {
            year = year + 1;
            month = month - 12;
        }
        date[index] = String(year) + '-' + String(month);
    };
    return date;
};

function GenpayloadDate(begin, end) {
    var begintime = [];
    var endtime = [];
    Datelable = GenDatelable(begin, end);
    // console.log(Datelable);
    for (var index = 0; index < Datelable.length; index++) {
        if (index == 0) {
            begintime[index] = begin;
        } else begintime[index] = new Date(Datelable[index]);
        if (index == Datelable.length - 1) {
            endtime[index] = end;
        } else endtime[index] = new Date(Datelable[index + 1]);
    }
    return [Datelable, begintime, endtime];
};


function Caculate(begin, end) {
    var Begin = [];
    var End = [];
    var ObjRun = [];
    var ObjUse = [];
    var ObjOn = [];
    var nodataNodes = [];
    var mtools = [];

    [Datelable, Begin, End] = GenpayloadDate(begin, end);
    for (var IND = 0; IND < Datelable.length; IND++) {
        $.get("/api/CACULATE/" + Datelable[IND], function (data, resp) {
            // console.log("/api/CACULATE/" + Datelable[IND])
            if (resp == "success" && data.length != 0) {
                var ObjRunMonth = { "Month": "", "AvaRun": "" };
                var ObjUseMonth = { "Month": "", "AvaUse": "" };
                var ObjOnMonth = { "Month": "", "AvaOn": "" };
                ObjRunMonth.Month = data.MONTHLABLE;
                ObjRunMonth.AvaRun = data.RUNRATIO;
                ObjUseMonth.Month = data.MONTHLABLE;
                ObjUseMonth.AvaUse = data.USERATIO;
                ObjOnMonth.Month = data.MONTHLABLE;
                ObjOnMonth.AvaOn = data.ONRATIO;
                ObjRun.push(ObjRunMonth);
                ObjUse.push(ObjUseMonth);
                ObjOn.push(ObjOnMonth);
            } else {
                for (var index = 0; index < Tools.length; index++) {
                    mtools.push(Tools[index].id);
                }
                var payload = {
                    "MTID": JSON.stringify(mtools),
                    'BEGINTIME': Begin[IND],
                    'ENDTIME': End[IND],
                }
                $.post("/api/STATICS", payload, function (data, resp) {
                    if (resp == "success") {
                        Result = data.RESULT;
                        nodataNodes = data.nodataNodes;
                        // if (nodataNodes.length != 0) {
                        //     message = "";
                        //     nodataNodes.forEach(function (node) {
                        //         message += node + ","
                        //     })
                        //     alert("查询不到" + message + "设备数据,只显示可查询到的数据或请重新选择查询条件(设备列表/时间区间)");
                        // }


                        Eff_result = SortEff(Result);
                        // console.log(Eff_result)

                        var ObjRunMonth = { "Month": "", "AvaRun": "" };
                        var ObjUseMonth = { "Month": "", "AvaUse": "" };
                        var ObjOnMonth = { "Month": "", "AvaOn": "" };
                        ObjRunMonth.Month = Datelable[IND];
                        ObjRunMonth.AvaRun = Eff_result[0];
                        ObjUseMonth.Month = Datelable[IND];
                        ObjUseMonth.AvaUse = Eff_result[1];
                        ObjOnMonth.Month = Datelable[IND];
                        ObjOnMonth.AvaOn = Eff_result[2];

                        // console.log(ObjRunMonth);
                        ObjRun.push(ObjRunMonth);
                        ObjUse.push(ObjUseMonth);
                        ObjOn.push(ObjOnMonth);

                        var Monthdata = {
                            "MONTHLABLE": Datelable[IND],
                            "USERATIO": ObjUseMonth.AvaUse,
                            "RUNRATIO": ObjRunMonth.AvaRun,
                            "ONRATIO": ObjOnMonth.AvaOn
                        };
                        $.post("/api/CACULATE/Create", Monthdata, function (data, resp) {
                            if (resp == "success") {
                                // console.log("save successfuly")
                            }
                        })
                    } else {
                        alert("请检查查询条件后重试！")
                        window.stop();
                    }
                });

            }
        })
    };
    // console.log(ObjRun)
    $("#chartTrend1").kendoChart({
        dataSource: ObjRun,
        title: {
            text: "设备运行效率"
        },
        legend: {
            position: "top",
            visible: false
        },
        series: [{
            type: "column",
            field: "AvaRun",
            name: "柱状图"
        },
        {
            type: "line",
            field: "AvaRun",
            name: "折线图"

        }
        ],
        categoryAxis: {
            field: "Month",
            majorGridLines: {
                visible: false
            },
            line: {
                visible: false
            }
        },
        valueAxis: {
            line: {
                visible: false
            },
            labels: {
                format: "{0:p1}"
            },
            minorGridLines: {
                visible: true
            },
            axisCrossingValue: 0
        },
        tooltip: {
            visible: true,
            format: "Value:{0:p1}",
            // template: "#= series.name #: #= value #"
        }
    });

    $("#chartTrend2").kendoChart({
        dataSource: ObjUse,
        title: {
            text: "设备总利用率"
        },
        legend: {
            position: "top",
            visible: false
        },
        series: [{
            type: "column",
            field: "AvaUse",
            name: "柱状图"
        },
        {
            type: "line",
            field: "AvaUse",
            name: "折线图"

        }
        ],
        categoryAxis: {
            field: "Month",
            majorGridLines: {
                visible: false
            },
            line: {
                visible: false
            }
        },
        valueAxis: {
            line: {
                visible: false
            },
            labels: {
                format: "{0:p1}"
            },
            minorGridLines: {
                visible: true
            },
            axisCrossingValue: 0
        },
        tooltip: {
            visible: true,
            format: "Value:{0:p1}",
            // template: "#= series.name #: #= value #"
        }
    });

    $("#chartTrend3").kendoChart({
        dataSource: ObjOn,
        title: {
            text: "设备总开机率"
        },
        legend: {
            position: "top",
            visible: false
        },
        series: [{
            type: "column",
            field: "AvaOn",
            name: "柱状图"
        },
        {
            type: "line",
            field: "AvaOn",
            name: "折线图"

        }
        ],
        categoryAxis: {
            field: "Month",
            majorGridLines: {
                visible: false
            },
            line: {
                visible: false
            }
        },
        valueAxis: {
            line: {
                visible: false
            },
            labels: {
                format: "{0:p1}"
            },
            minorGridLines: {
                visible: true
            },
            axisCrossingValue: 0
        },
        tooltip: {
            visible: true,
            format: "Value:{0:p1}",
            // template: "#= series.name #: #= value #"
        }
    });

};


$(document).ready(function () {
    Caculate(begin, end);

    // Eff_result=SortEff(Result);
});