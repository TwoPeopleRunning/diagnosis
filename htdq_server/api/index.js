/**
 * Dependencies
 */
var debug = require('debug')('htdq');
var express = require('express');
var config = require('../config');
var unless = require('express-unless');
var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');

var db = require('../db/index');
var User = db.GD_USER;


/**
 * ADD 数据库路由模型
 */
var MDC_DSSEXPRESSIONS = require('./MDC_DSSEXPRESSIONS');
var MDC_MNT = require('./MDC_MNT');
var MDC_MACHINETOOLS = require('./MDC_MACHINETOOLS');
var MDC_SYSVR = require('./MDC_SYSVR');
var MDC_MDALARMDATA = require('./MDC_MDALARMDATA');
var GD_DEPARTMENT = require('./GD_DEPARTMENT');
var GD_ROLE = require('./GD_ROLE');
var GD_USER = require('./GD_USER');
var GD_RELA_FILE = require('./GD_RELA_FILE');
var GD_RELA_USERTODEPART = require('./GD_RELA_USERTODEPART');
var GD_RELA_USERTOROLE = require('./GD_RELA_USERTOROLE');
var MDC_MTGROUP = require('./MDC_MTGROUP');
var MDC_MDSTATUS = require('./MDC_MDSTATUS');
var HS_MAINTAIN = require('./HS_MAINTAIN');
var CACULATE = require('./CACULATE');
var PPTCONFIG = require('./PPTCONFIG');
var MDC_FACTORY = require('./MDC_FACTORY');
var MDC_DSSLAYOUT = require('./MDC_DSSLAYOUT');
var MDC_MACHINELAYOUT = require('./MDC_MACHINELAYOUT');
var LOGRECORD = require('./LOGRECORD');
var STATICS = require('./STATICS');
var ONEHOUR = require('./ONEHOUR');

/**
 * Private variables and functions
 */
// var authenticate = function(user, password, callback) {
//     if (user in config.admin || config.admin[user] !== password) {
//         callback(null, { user: user, isAdmin: true });
//         return;
//     }

//     User.authenticate(user, password, function(err, user) {
//         if (err || !user) {
//             res.send({
//                 error: 'Email address or password is not correct!'
//             });
//             return;
//         }

//         res.send({
//             jwt: jsonWebToken.sign(user, config.jwt.secret),
//             user: user
//         });
//     });

// };
//用户验证函数
var authenticate = function (username, passwd, callback) {
    User.find({ "NAME": username }).exec(function (err, user) {
        if (err || user.length == 0) {
            callback(null, false);
            return;
        } else {
            if (user[0].USERPASSWORD == passwd) {
                callback(null, { NAME: username, USERPASSWORD: passwd, ISADMIN: user[0].ISADMIN, DEPARTMENT: user[0].DEPARTMENT });
                return;
            } else {
                callback(null, false);
                return;
            }
        }
    });
};
// var adminOnly = function(req, res, next) {
//     if (!req.user.isAdmin) {
//         var err = new Error('Admin only area!');
//         err.status = 401;
//         next(err);
//     }

//     next();
// };
// adminOnly.unless = unless;


/**
 * api
 */
var api = express.Router();
//  localhost:端口号/api 路径路由定义

// // Enable Json Web Token
// api.use(expressJwt(config.jwt).unless({
//     path: ['/api/login']
// }));

// Login
api.route('/login').get(function (req, res) {
    if (req.query.NAME && req.query.USERPASSWORD) {
        authenticate(req.query.NAME, req.query.USERPASSWORD, function (err, user) {
            if (err || !user) {
                res.send({
                    error: '用户名或密码不正确'
                });
                // return;
            } else {
                if (user.ISADMIN == 1) {
                    res.send({
                        jwt: jwt.sign(user, config.jwt.secret, {
                            expiresIn: 60 * 60 * 24 * 365 * 30//永久
                        }),
                        user: user.NAME
                    });
                } else {
                    res.send({
                        jwt: jwt.sign(user, config.jwt.secret, {
                            expiresIn: 60 * 60 * 12// 授权时效24小时
                        }),
                        user: user.NAME
                    });
                }
            }
        });
    } else {
        res.send({
            error: '用户名或密码不正确'
        });
    };
});

api.use('/LOGRECORD', LOGRECORD);

api.use(function (req, res, next) {
    // 拿取token 数据 按照自己传递方式写
    var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.cookies.Token;
    if (token) {
        // 解码 token (验证 secret 和检查有效期（exp）)
        jwt.verify(token, config.jwt.secret, function (err, decoded) {
            if (err) {
                return res.status(500).send({
                    success: false,
                    error: "登录超时，请重新登录"
                });
                // res.send({
                //     error: "登录超时，请重新登录"
                // })
                // return res.json({ success: false, message: '无效的token.' });
            } else {
                // 如果验证通过，在req中写入解密结果
                req.decoded = decoded;
                next(); //继续下一步路由
                // var now = (new Date()).getTime() / 1000;
                // if (now >= decoded.iat & now <= decoded.exp) {
                //     next(); //继续下一步路由
                // } else {
                //     res.send({
                //         error: "登录超时，请重新登录"
                //     })
                // }
                ////console.log(decoded)  ;

            }
        });
    } else {
        // // 没有拿到token 返回错误 
        return res.status(403).send({
            success: false,
            error: "获取不到登录信息，请重新登录"
        });
        // res.send({
        //     error: "获取不到登录信息，请重新登录"
        // })
    }
});

/**
 * ADD 路由路径
 */
api.use('/MDC_DSSEXPRESSIONS/', MDC_DSSEXPRESSIONS);
api.use('/MDC_MNT/', MDC_MNT);
api.use('/MDC_MACHINETOOLS/', MDC_MACHINETOOLS);
api.use('/MDC_SYSVR/', MDC_SYSVR);
api.use('/MDC_MDALARMDATA/', MDC_MDALARMDATA);
api.use('/GD_DEPARTMENT/', GD_DEPARTMENT);
api.use('/GD_ROLE/', GD_ROLE);
api.use('/GD_USER/', GD_USER);
api.use('/GD_RELA_FILE/', GD_RELA_FILE);
api.use('/GD_RELA_USERTODEPART/', GD_RELA_USERTODEPART);
api.use('/GD_RELA_USERTOROLE/', GD_RELA_USERTOROLE);
api.use('/MDC_MTGROUP', MDC_MTGROUP);
api.use('/MDC_MDSTATUS', MDC_MDSTATUS);
api.use('/HS_MAINTAIN', HS_MAINTAIN);
api.use('/CACULATE/', CACULATE);
api.use('/PPTCONFIG', PPTCONFIG);
api.use('/MDC_FACTORY', MDC_FACTORY);
api.use('/MDC_DSSLAYOUT', MDC_DSSLAYOUT);
api.use('/MDC_MACHINELAYOUT', MDC_MACHINELAYOUT);
api.use('/STATICS', STATICS);
api.use('/ONEHOUR', ONEHOUR);
module.exports = api;