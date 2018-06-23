// TimeJson = JSON.parse(get_cookie("timeJson"));
Tools = JSON.parse(get_cookie("checkednodes"));
var begin = new Date($("#start", window.parent.document).val());
var end = new Date($("#end", window.parent.document).val());
// console.log($("#start",window.parent.document).val());
var Result = [];

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

var convertTime = function(date) {
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
    Data.forEach(function(data, index) {
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
    //13最高利用率、14最高利用率设备、15最低利用率、16最低利用率设备、17平均开机、18总空闲、19总报警
    //20总关机、21平均空闲、22平均报警、23平均关机 ]
    return [maxEff, Name[max_index], minEff, Name[min_index], avaEff,
        sumRun, sumOn, maxUse, Name[maxUse_index], minUse, Name[minUse_index], avaUse, sumWholetime,
        maxOn, Name[maxOn_index], minOn, Name[minOn_index], avaOn, sumOnline,
        sumAlarm, sumOffline, avaOnline, avaAlarm, avaOffline
    ]
};

var Static = function(mtdata) {
    length = mtdata.length;
    Runtime = 0;
    Onlinetime = 0;
    Alarmtime = 0;
    Offlinetime = 0;
    AlarmNum = 0;
    RunNum = 0;
    Wholetime = convertTime(mtdata[length - 1].ENDTIME) - convertTime(mtdata[0].BEGINTIME)
    mtdata.forEach(function(onedata, index) {
        if (mtdata[index].STATUS == "RUNNING") {
            Runtime += mtdata[index]["DURATION"];
            RunNum += 1;
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
        "AlarmNum": AlarmNum,
        "RunNum": RunNum
    };
};

function Caculate() {
    // console.log(Tools);
    Tools.forEach(function(Mtool, index) {
        var payload = {
            'MTID': Mtool.id,
            'BEGINTIME': begin,
            'ENDTIME': end,
        };
        // console.log(payload)
        $.post("/api/MDC_MDSTATUS", payload, function(data, resp) {
            //  console.log(data);
            if (resp == "success" && data.length != 0) {
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
                result = Static(data);
                Obj.MTID = result.MTID; //设备编号
                Obj.MTNAME = Mtool.name; //设备名称
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
                Result.push(Obj);
                // console.log(Result.length);
                // console.log(Result);

                while (Result.length == Tools.length) {
                    // console.log(Result);
                    Eff_result = SortEff(Result);
                    $(".MaxEff").text(kendo.toString(Eff_result[0], "p2"));
                    $(".MaxName").text(Eff_result[1]);
                    $(".MinEff").text(kendo.toString(Eff_result[2], "p2"));
                    $(".MinName").text(Eff_result[3]);
                    $(".AvaEff").text(kendo.toString(Eff_result[4], "p2"));
                    $(".TotalRun").text(kendo.toString(Eff_result[5], "n2"));
                    $(".TotalTime").text(kendo.toString(Eff_result[6], "n2"));
                    $(".MaxUse").text(kendo.toString(Eff_result[7], "p2"));
                    $(".MaxUseName").text(Eff_result[8]);
                    $(".MinUse").text(kendo.toString(Eff_result[9], "p2"));
                    $(".MinUseName").text(Eff_result[10]);
                    $(".AvaUse").text(kendo.toString(Eff_result[11], "p2"));
                    $(".WholeTime").text(kendo.toString(Eff_result[12], "n2"));
                    $(".MaxOn").text(kendo.toString(Eff_result[13], "p2"));
                    $(".MaxOnName").text(Eff_result[14]);
                    $(".MinOn").text(kendo.toString(Eff_result[15], "p2"));
                    $(".MinOnName").text(Eff_result[16]);
                    $(".AvaOn").text(kendo.toString(Eff_result[17], "p2"));
                    $(".TotalOnline").text(kendo.toString(Eff_result[18], "n2"));
                    $(".TotalAlarm").text(kendo.toString(Eff_result[19], "n2"));
                    $(".TotalOffline").text(kendo.toString(Eff_result[20], "n2"));
                    $(".AvaOnline").text(kendo.toString(Eff_result[21], "p2"));
                    $(".AvaAlarm").text(kendo.toString(Eff_result[22], "p2"));
                    $(".AvaOffline").text(kendo.toString(Eff_result[23], "p2"));
                    //*******************效能分析
                    $("#grid1").kendoGrid({
                        dataSource: Result,
                        pageable: {
                            refresh: true
                        },
                        sortable: true,
                        columns: [
                            { field: "MTID", title: "设备编号", format: "{0:n0}" },
                            { field: "MTNAME", title: "设备名称" },
                            { field: "RunTime", title: "运行时间/h", format: "{0:n2}" },
                            { field: "OnTime", title: "开机时间/h", format: "{0:n2}" },
                            { field: "RunEff", title: "运行效率", format: "{0:p2}" },
                            // { command: ["edit", "destroy"], title: "&nbsp;", width: "250px" }
                        ]
                    });

                    $("#grid2").kendoGrid({
                        dataSource: Result,
                        pageable: {
                            refresh: true
                        },
                        sortable: true,
                        columns: [
                            { field: "MTID", title: "设备编号", format: "{0:n0}" },
                            { field: "MTNAME", title: "设备名称" },
                            { field: "RunTime", title: "运行时间/h", format: "{0:n2}" },
                            { field: "WholeTime", title: "自然时间/h", format: "{0:n2}" },
                            { field: "UseRatio", title: "总利用率", format: "{0:p2}" },
                            // { command: ["edit", "destroy"], title: "&nbsp;", width: "250px" }
                        ]
                    });

                    $("#grid3").kendoGrid({
                        dataSource: Result,
                        pageable: {
                            refresh: true
                        },
                        sortable: true,
                        columns: [
                            { field: "MTID", title: "设备编号", format: "{0:n0}" },
                            { field: "MTNAME", title: "设备名称" },
                            { field: "OnTime", title: "开机时间/h", format: "{0:n2}" },
                            { field: "WholeTime", title: "自然时间/h", format: "{0:n2}" },
                            { field: "OnRatio", title: "总开机率", format: "{0:p2}" },
                            // { command: ["edit", "destroy"], title: "&nbsp;", width: "250px" }
                        ]
                    });

                    $("#grid4").kendoGrid({
                        dataSource: Result,
                        pageable: {
                            refresh: true
                        },
                        sortable: true,
                        columns: [
                            { field: "MTID", title: "设备编号", format: "{0:n0}" },
                            { field: "MTNAME", title: "设备名称" },
                            { field: "RunTime", title: "运行时间/h", format: "{0:n2}" },
                            { field: "OnlineTime", title: "空闲时间/h", format: "{0:n2}" },
                            { field: "AlarmTime", title: "报警时间/h", format: "{0:n2}" },
                            { field: "OfflineTime", title: "关机时间/h", format: "{0:n2}" },
                            { field: "RunRatio", title: "运行比率", format: "{0:p2}" },
                            { field: "OnlineRatio", title: "空闲比率", format: "{0:p2}" },
                            { field: "AlarmRatio", title: "报警比率", format: "{0:p2}" },
                            { field: "OfflineRatio", title: "关机比率", format: "{0:p2}" },
                            // { field: "OnRatio", title: "总开机率",format:"{0:p2}" },
                            // { command: ["edit", "destroy"], title: "&nbsp;", width: "250px" }
                        ]
                    });
                    //**********************综合分析**********************
                    var AvaEff = new Array(Tools.length);
                    var AvaUse = new Array(Tools.length);
                    var AvaOn = new Array(Tools.length);
                    for (var ind = 0; ind < Tools.length; ind++) {
                        AvaEff[ind] = Eff_result[4];
                        AvaUse[ind] = Eff_result[11];
                        AvaOn[ind] = Eff_result[17];
                    };

                    $("#chart_01").kendoChart({
                        dataSource: Result,
                        title: {
                            text: "设备运行效率"
                        },
                        legend: {
                            position: "top",
                            visible: false
                        },
                        //  seriesDefaults: {
                        //      stack: {
                        //          type: "100%"
                        //      }
                        //  },
                        series: [{
                                type: "column",
                                field: "RunEff",
                                name: "柱状图"
                            },
                            {
                                type: "line",
                                data: AvaEff,
                                name: "平均值"

                            }
                        ],
                        categoryAxis: {
                            field: "MTNAME",
                            majorGridLines: {
                                visible: false
                            },
                            line: {
                                visible: false
                            },
                            labels: {
                                padding: { top: 0 }
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

                    $("#chart_02").kendoChart({
                        dataSource: Result,
                        //     sort: {
                        //         field: "CNC",
                        //         dir: "asc"
                        //     }
                        // },
                        title: {
                            text: "设备总利用率"
                        },
                        legend: {
                            position: "top",
                            visible: false
                        },
                        //  seriesDefaults: {
                        //      stack: {
                        //          type: "100%"
                        //      }
                        //  },
                        series: [{
                                type: "column",
                                field: "UseRatio",
                                name: "柱状图"
                            },
                            {
                                type: "line",
                                data: AvaUse,
                                name: "平均值"

                            }
                        ],
                        categoryAxis: {
                            field: "MTNAME",
                            majorGridLines: {
                                visible: false
                            },
                            line: {
                                visible: false
                            },
                            // labels: {
                            //     padding: { top: 80 }
                            // }
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

                    $("#chart_03").kendoChart({
                        dataSource: Result,
                        //     sort: {
                        //         field: "CNC",
                        //         dir: "asc"
                        //     }
                        // },
                        title: {
                            text: "设备总开机率"
                        },
                        legend: {
                            position: "top",
                            visible: false
                        },
                        //  seriesDefaults: {
                        //      stack: {
                        //          type: "100%"
                        //      }
                        //  },
                        series: [{
                                type: "column",
                                field: "OnRatio",
                                name: "柱状图"
                            },
                            {
                                type: "line",
                                data: AvaOn,
                                name: "平均值"

                            }
                        ],
                        categoryAxis: {
                            field: "MTNAME",
                            majorGridLines: {
                                visible: false
                            },
                            line: {
                                visible: false
                            },
                            // labels: {
                            //     padding: { top: 80 }
                            // }
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
                    //*******************报警信息****************************
                    $("#gridAlarm").kendoGrid({
                        toolbar: ["excel"],
                        excel: {
                            fileName: "报警次数统计表"
                        },
                        dataSource: Result,
                        // {
                        //     type: "json",
                        //     transport: {
                        //         read: {
                        //             url: "/json_data/alarm_info.json",
                        //             dataType: "json"
                        //         }
                        //     },
                        //     schema: {
                        //         model: {
                        //             fields: {
                        //                 CNC: { type: "string" },
                        //                 nuclear: { type: "number" }
                        //             }
                        //         }
                        //     },
                        //     pageSize: 10,
                        //     serverPaging: true,
                        //     serverFiltering: true,
                        //     serverSorting: true
                        // },
                        sortable: true,
                        filterable: true,
                        pageable: true,
                        columns: [
                            { field: "MTNAME", title: "设备名称", width: 110, filterable: false },
                            { field: "AlarmNum", title: "报警次数", width: 130 }
                        ]
                    });

                    $("#chartAlarm").kendoChart({
                        dataSource: Result,
                        // {
                        //     transport: {
                        //         read: {
                        //             url: "/json_data/alarm_info.json",
                        //             dataType: "json"
                        //         }
                        //     },
                        //     sort: {
                        //         field: "year",
                        //         dir: "asc"
                        //     }
                        // },
                        title: {
                            text: "报警信息"
                        },
                        legend: {
                            position: "top"
                        },
                        seriesDefaults: {
                            type: "column"
                        },
                        series: [{
                            field: "AlarmNum",
                            //name: "Nuclear"
                        }],
                        categoryAxis: {
                            field: "MTNAME",
                            // labels: {
                            //     rotation: -90
                            // },
                            majorGridLines: {
                                visible: false
                            }
                        },
                        valueAxis: {
                            labels: {
                                format: "N0"
                            },
                            //majorUnit: 10000,
                            line: {
                                visible: false
                            }
                        },
                        tooltip: {
                            visible: true,
                            format: "N0"
                        }
                    });
                    //********************程序统计**************
                    $("#gridRun").kendoGrid({
                        toolbar: ["excel"],
                        excel: {
                            fileName: "加工次数统计表"
                        },
                        dataSource: Result,
                        // {
                        //     type: "json",
                        //     transport: {
                        //         read: {
                        //             url: "/json_data/process_info.json",
                        //             dataType: "json"
                        //         }
                        //     },
                        //     schema: {
                        //         model: {
                        //             fields: {
                        //                 CNC: { type: "string" },
                        //                 nuclear: { type: "number" }
                        //             }
                        //         }
                        //     },
                        //     pageSize: 20,
                        //     serverPaging: true,
                        //     serverFiltering: true,
                        //     serverSorting: true
                        // },
                        sortable: true,
                        filterable: true,
                        pageable: true,
                        columns: [
                            { field: "MTNAME", title: "设备名称", width: 110, filterable: false },
                            { field: "RunNum", title: "加工次数", width: 130 }
                        ]
                    });


                    $("#chartRun").kendoChart({
                        dataSource: Result,
                        // {
                        //     transport: {
                        //         read: {
                        //             url: "/json_data/process_info.json",
                        //             dataType: "json"
                        //         }
                        //     },
                        //     sort: {
                        //         field: "CNC",
                        //         dir: "asc"
                        //     }
                        // },
                        title: {
                            text: "加工程序统计"
                        },
                        legend: {
                            position: "top"
                        },
                        seriesDefaults: {
                            type: "column"
                        },
                        series: [{
                            field: "RunNum",
                            //name: "Nuclear"
                        }],
                        categoryAxis: {
                            field: "MTNAME",
                            // labels: {
                            //     rotation: -90
                            // },
                            majorGridLines: {
                                visible: false
                            }
                        },
                        valueAxis: {
                            labels: {
                                format: "N0"
                            },
                            //majorUnit: 10000,
                            line: {
                                visible: false
                            }
                        },
                        tooltip: {
                            visible: true,
                            format: "N0"
                        }
                    });
                    break;

                }

                // if (index == (Tools.length - 1)) {
                //     console.log(Result);
                //[0最高效率、1最高效率设备、2最低效率、3最低效率设备、4平均效率、5总运行时间、6总开机时间
                //7最高利用率、8最高利用率设备、9最低利用率、10最低利用率设备、11平均利用率、12总自然时间、
                //13最高利用率、14最高利用率设备、15最低利用率、16最低利用率设备、17平均开机率、18总空闲、19总报警
                //20总关机、21平均空闲、22平均报警、23平均关机]
            };

        });
    });

};


$(document).ready(function() {
    Caculate();
    // Eff_result=SortEff(Result);
    $("#tabstrip").kendoTabStrip();
});

// var a=[];
// a.push({"num":1},{"num":2})
// console.log(a[0]);