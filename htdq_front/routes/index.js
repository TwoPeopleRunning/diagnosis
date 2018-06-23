var express = require('express');
var router = express.Router();

var mixin = require('utils-merge');
var debug = require('debug')('htdq');
var http = require('http');
var path = require('path');
var multer = require('multer');
var util = require('util');
var fs = require('fs');

var now = function () {
    return new Date();
};

/**
 * ADD View路由模型
 */
var users = require('./users/index');
var manage = require('./manage/index');
var analysis = require('./analysis/index');
var diagnosis = require('./diagnosis/index');
var config = require('./config/index');
var layout = require('./layout/index');

var views = require('./views/index');
var help = require('./help/index');
var config_sys = require('../config');


/* GET home page. */
router.get('/', function (req, res, next) {

    if (req.cookies.Token) {
        res.render('index', {});

    } else {
        res.redirect('/users/login');
        return;
    }
});

// 上传设备图片
var upload = multer({ dest: path.resolve(__dirname, "../") + "/public/images/MTimg/" })
router.post("/upload", upload.any(), function (req, res) {
    // var fileDir = path.resolve(__dirname, "../");
    // console.log(fileDir);
    var file = req.files[0];
    var originArr = (file.originalname).split(".");
    // console.log(req.body);
    // console.log(req.files);
    fs.renameSync(file.path, file.destination + req.body.MTNAME + "." + originArr[originArr.length - 1]);

    var data = {
        "MTNAME": encodeURIComponent(req.body.MTNAME),
        "MTID": req.body.MTID,
        "SRC": "/images/MTimg/" + encodeURIComponent(req.body.MTNAME) + "." + originArr[originArr.length - 1]
    };

    data = JSON.stringify(data);
    console.log(data);
    var opt = {
        method: "POST",
        host: config_sys.BACK.HOST,
        port: config_sys.BACK.PORT,
        path: "/api/MDC_DSSLAYOUT/Update",
        headers: {
            "Content-Type": 'application/json',
            "Content-Length": data.length,
            "x-access-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJOQU1FIjoiYWRtaW4iLCJVU0VSUEFTU1dPUkQiOiJhZG1pbiIsIklTQURNSU4iOjEsIkRFUEFSVE1FTlQiOiIiLCJpYXQiOjE1MTA4MjU3ODgsImV4cCI6MjQ1NjkwNTc4OH0.1GGLFOKbf9vOf8KURGLQUkXAecgT36Gh820mMDwHbpo"
        }
    };

    var requ = http.request(opt, function (serverFeedback) {
        if (serverFeedback.statusCode == 200) {
            var body = "";
            // console.log("asd");
            serverFeedback.on('data', function (data) { body += data; })
                .on('end', function () { res.send([req.body, file]); });
        }
        else {
            res.send({
                err: "存储设备图片路径失败！"
            });
        }
    });
    requ.write(data + "\n");
    requ.end();
});

// 上传车间背景图
var upload = multer({ dest: path.resolve(__dirname, "../") + "/public/images/MTGRPimg/" })
router.post("/uploadGRP", upload.any(), function (req, res) {
    var file = req.files[0];
    console.log(req.body);
    console.log(req.files);
    fs.renameSync(file.path, file.destination + file.originalname);

    var data = {
        "SRC": "/images/MTGRPimg/" + file.originalname
    };

    data = JSON.stringify(data);
    var opt = {
        method: "POST",
        host: config_sys.BACK.HOST,
        port: config_sys.BACK.PORT,
        path: "/api/MDC_MACHINELAYOUT/Update",
        headers: {
            "Content-Type": 'application/json',
            "Content-Length": data.length,
            "x-access-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJOQU1FIjoiYWRtaW4iLCJVU0VSUEFTU1dPUkQiOiJhZG1pbiIsIklTQURNSU4iOjEsIkRFUEFSVE1FTlQiOiIiLCJpYXQiOjE1MTA4MjU3ODgsImV4cCI6MjQ1NjkwNTc4OH0.1GGLFOKbf9vOf8KURGLQUkXAecgT36Gh820mMDwHbpo",

        }
    };

    var requ = http.request(opt, function (serverFeedback) {
        if (serverFeedback.statusCode == 200) {
            var body = "";
            serverFeedback.on('data', function (data) { body += data; })
                .on('end', function () { res.send([req.body, file]); });
        }
        else {
            res.send({
                err: "存储车间图片路径失败！"
            });
        }
    });
    requ.write(data + "\n");
    requ.end();
});

router.use('/users', users);
router.use(function (req, res, next) {
    if (req.cookies.Token) {
        next();
    }
    else {
        res.render('users/login', {});
    }
})

/* GET home page. */

router.use('/manage', manage);
router.use('/analysis', analysis);
router.use('/config', config);
router.use('/layout', layout);

router.use('/views', views);

router.use('/help', help);

router.use('/diagnosis', diagnosis);


module.exports = router;