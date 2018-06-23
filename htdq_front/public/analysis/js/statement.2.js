function GetQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return (r[2]);
    return null;
}

var Static = function (mtdata, timeTemp) {
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

var convertTime = function (date) {
    var timestamp = Date.parse(date);
    return timestamp / 1000;
};


//
// function(callback){
//
if (window.location.search) {
    var Result = [];
    var Temp = [];
    var nodataNodes = [];
    mtid = GetQueryString('mtid').split(",")
    BEGINTIME = new Date(GetQueryString('BEGINTIME'));
    ENDTIME = new Date(GetQueryString('ENDTIME'));
    mtid.forEach(function (ID, index) {
        $.get("/api/MDC_MACHINETOOLS?ID=" + ID, function (Mtool, resp) {
            if (resp == "success" && Mtool.length != 0) {
                // console.log(Mtool)
            } else {
                alert("不存在ID为" + ID + "的设备")
                window.stop();
            };
            var timeTemp = convertTime(ENDTIME) - convertTime(BEGINTIME);
            var payload = {
                'MTID': ID,
                'BEGINTIME': BEGINTIME,
                'ENDTIME': ENDTIME,
            };
            $.post("/api/MDC_MDSTATUS", payload, function (data, resp) {
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
                    result = Static(data, timeTemp);
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
                    // while (Temp.length == mtid.length) {
                    //     Result = Temp;
                    //     break;
                    // }
                    // document.cookie = "checkednodes=" + JSON.stringify(statuData);
                } else {
                    nodataNodes.push(Mtool[0].MATOLNAME);

                }
                while (Temp.length == mtid.length - nodataNodes.length) {
                    Result = Temp;
                    if (nodataNodes.length == 0) {
                        break;
                    }
                    else {
                        if (Result.length == 0) {
                            window.stop();
                            // document.getElementById("LoadDiv").style.display = "none";
                        }
                        message = "";
                        nodataNodes.forEach(function (node) {
                            message += node + ","
                        })
                        alert("查询不到" + message + "设备数据,只显示可查询到的数据或请重新选择查询条件(设备列表/时间区间)");
                        parent.window.location.href = "/config/ppt.html"
                        break;
                    }
                }

            });
        })
    });
}