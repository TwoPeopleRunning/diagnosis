function GetQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return (r[2]);
    return null;
}


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

    var payload = {
        "MTID": JSON.stringify(mtid),
        "BEGINTIME": BEGINTIME,
        "ENDTIME": ENDTIME
    }

    $.post("/api/STATICS", payload, function (data, resp) {
        if (resp == "success") {
            Result = data.RESULT;
            nodataNodes = data.nodataNodes;
            // //在父页面中存储Result
            // $("#transData").val(JSON.stringify(Result));

            // document.cookie = "checkednodes=" + JSON.stringify(checkedNodes);

            if (nodataNodes.length != 0) {
                message = "";
                nodataNodes.forEach(function (node) {
                    message += node + ","
                })
                alert("查询不到" + message + "设备数据,只显示可查询到的数据或请重新选择查询条件(设备列表/时间区间)");
                parent.window.location.href = "/config/ppt.html"
            }
        } else {
            alert("请检查查询条件后重试！")
            window.stop();
        }

    });

}