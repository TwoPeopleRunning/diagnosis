/**
 * Dependencies
 */
var express = require('express');
var mixin = require('utils-merge');
var config = require('../../config');
// var os = require('os');
// console.log(os.networkInterfaces());
/**
 * Exports
 */
module.exports = exports = express.Router();

/**
 * Private variables and functions
 */
exports.get('/login', function (req, res, next) {
    res.clearCookie('Token');
    res.clearCookie('checkednodes');
    res.clearCookie('user');
    res.render('users/login', {});
});

// exports.post('/login', function(req, res, next) {
//     res.cookie('thisuser', req.param('user'));
//     // console.log(req.param('user'));
//     if (req.param('user') == "admin" && req.param('passwd') == "admin") {
//         res.cookie('passwd', req.param('user'), { signed: true });
//         res.cookie('user', req.param('passwd'), { signed: true });
//         res.redirect('/');
//     } else {
//         res.redirect('/users/login');
//     }

// });

getClientIP = function (req) {
    var ipAddress;
    var headers = req.headers;
    var forwardedIpsStr = headers["x-real-ip"] || headers["x-forwarded-for"];
    forwardedIpsStr ? ipAddress = forwardedIpsStr : ipAddress = null;
    if (!ipAddress) {
        ipAddress = req.connection.remoteAddress;
    }
    return ipAddress;
}


var http = require('http');
exports.post('/login', function (req, res, next) {
    // res.cookie('thisuser', req.param('user'));
    var currenturl = req.cookies.currenturl;
    var post_options = {
        host: config.FRONT.HOST,
        port: config.FRONT.PORT,
        path: "/api/login?NAME=" + req.param('user') + "&USERPASSWORD=" + req.param('passwd'),
    }
    var post_req = http.request(post_options, function (resp) {
        resp.setEncoding('utf8');
        resp.on('data', function (data) {
            data = JSON.parse(data);
            if (data.error) {
                res.send(data);
                // res.redirect('/users/login');
                // return data;
            } else {
                var IP = getClientIP(req);
                var USER = req.param('user');
                // sessionStorage.userToken = session.jwt;
                var req_data = {
                    TYPE: "login",
                    TIME: new Date(),
                    IP: IP,
                    USER: USER,
                };
                // console.log(req_data.length)
                req_data = JSON.stringify(req_data);
                // console.log(req_data);
                var opt = {
                    method: "POST",
                    host: config.FRONT.HOST,
                    port: config.FRONT.PORT,
                    path: "/api/LOGRECORD",
                    headers: {
                        "Content-Type": 'application/json',
                        "Content-Length": req_data.length
                    }
                };

                var req_in = http.request(opt, function (serverFeedback) { });
                req_in.write(req_data + "\n");
                req_in.end();
                res.cookie('Token', data.jwt);
                res.cookie('user', data.user);

                res.redirect("/");
                // if (currenturl) {
                //     res.redirect("/manage/group_info");
                // } else {
                //     res.redirect("/");
                // }

            }
        });

    });
    post_req.end();

});

// $.get("/api/GD_USER?NAME=" + req.param('user'), function(users, resp) {
//     if (resp == "success") {
//         // console.log(users)
//         username = users[0].NAME;
//         userpswd = users[0].USERPASSWORD;
//         if (req.param('user') == username && req.param('passwd') == userpswd) {
//             res.cookie('passwd', req.param('user'), { signed: true });
//             res.cookie('user', req.param('passwd'), { signed: true });
//             res.redirect('/');
//         } else {
//             res.redirect('/users/login');
//         }
//     } else {
//         alert("用户名或密码不正确！")
//     }
// });

exports.get('/logout', function (req, res, next) {
    var IP = getClientIP(req);
    var USER = req.cookies.user;
    var req_outdata = {
        TYPE: "logout",
        TIME: new Date(),
        IP: IP,
        USER: USER,
    };
    // console.log(req_data.length)
    req_outdata = JSON.stringify(req_outdata);
    // console.log(req_outdata);
    var opt = {
        method: "POST",
        host: config.FRONT.HOST,
        port: config.FRONT.PORT,
        path: "/api/LOGRECORD",
        headers: {
            "Content-Type": 'application/json',
            "Content-Length": req_outdata.length
        }
    };

    var req_out = http.request(opt, function (serverFeedback) { });
    req_out.write(req_outdata + "\n");
    req_out.end();

    res.clearCookie('Token');
    res.clearCookie('checkednodes');
    res.clearCookie('user');
    // res.clearCookie('user', { signed: true });
    res.redirect('/users/login');
});


exports.get('/logrecord', function (req, res, next) {
    if (req.cookies.Token) {
        // console.log(req.signedCookies.user, req.signedCookies.passwd);
        res.render('users/logrecord', {});
    } else {
        res.redirect('/users/login');
        return;
    }
});