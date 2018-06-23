/**
 * Dependencies
 */
var express = require('express');
var mixin = require('utils-merge');
var config = require('../config');
var expressJwt = require("express-jwt");
var jwt = require("jsonwebtoken");

var db = require('../db/index');
var GD_USER = db.GD_USER;

/**
 * Exports
 */
module.exports = exports = express.Router();

/**
 * Private variables and functions
 */

GD_USER.find().exec(function (err, users) {
    if (users.length == 0) {
        var user = {
            NAME: "admin",
            USERPASSWORD: "admin",
            ISADMIN: 1
        };
        (new GD_USER(user)).save(function (err, newuser) {
            if (err) {
                //console.log({ err: err });
                return;
            }
            //console.log(newuser);
        })
    }
});


// GD_USER management  api/GD_USER
exports.route('/').get(function (req, res) {
    var limit = Number(req.query.limit) || config.page.limit;
    var skip = Number(req.query.skip) || 0;
    var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.cookies.Token;

    var condition = {};
    var decoded = jwt.verify(token, config.jwt.secret);
    if (decoded.DEPARTMENT != '') {
        condition['DEPARTMENT'] = decoded.DEPARTMENT;
    }

    if (req.query.NAME) {
        condition.NAME = req.query.NAME;
    }
    GD_USER.find(condition).select('-_id').skip(skip).limit(limit)
        .sort({ createdAt: config.page.sort }).exec(function (err, GD_USERs) {
            if (err) {
                res.send({
                    error: 'Get GD_USER list failed!'
                });
                return;
            }
            res.send(GD_USERs);
        });
});

// exports.route('/Create').post(function (req, res) {
//   if (! req.body.USERNAME) {
//     res.send({
//       error: 'DEPTNAME must be specified!'
//     });
//     return;
//   }

//   var data = {
//     RECORDID: req.body.RECORDID,
//     USERACCOUNT: req.body.USERACCOUNT,
//     USERNAME: req.body.USERNAME,
//     USERPASSWORD: req.body.USERPASSWORD,
//     EDITDATE: req.body.EDITDATE,
//     ISUSE: req.body.ISUSE,
//     IMAGEID: req.body.IMAGEID,
//     NOTE: req.body.NOTE,
//   };

//   (new GD_USER(data)).save(function (err, data) {
//     if (err) {
//       res.send({
//         error: 'Create GD_USER failed!'
//       });
//       return;
//     }

//     res.send(data);
//   });
// });

exports.route('/Update').post(function (req, res) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.cookies.Token;
    var decoded = jwt.verify(token, config.jwt.secret);
    req.body.DEPARTMENT = decoded.DEPARTMENT;
    if (!req.body.NAME) {
        res.send({
            error: 'USERNAME must be specified!'
        });
        return;
    }

    GD_USER.findOne({ 'NAME': req.query.NAME }).exec(function (err, data) {
        if (err) {
            res.send({
                error: err
            });
            return;
        }

        if (typeof req.body.TREENODEINFO == "string") {
            req.body.TREENODEINFO = JSON.parse(req.body.TREENODEINFO);
        }

        if (!data) {
            if (!req.body.NAME) {
                res.send({
                    error: 'NAME must be specified!'
                });
                return;
            }
            GD_USER.nameIsUni(req.body.NAME, function (err) {
                if (err) {
                    res.send({
                        error: err
                    })
                    return;
                }
                var data = {};
                mixin(data, req.body);
                (new GD_USER(data)).save(function (err, data) {
                    if (err) {
                        res.send({
                            error: 'Create GD_USER failed!'
                        });
                        return;
                    }
                    res.send(data);
                });
                return;
            });
            return;
        }
        // 更新数据
        if (req.body.TREENODEINFO) {
            mixin(data.TREENODEINFO, req.body.TREENODEINFO);
            req.body.TREENODEINFO = data.TREENODEINFO;
        }
        mixin(data, req.body);
        // //console.log(data.TREENODEINFO);
        // //console.log(req.body.TREENODEINFO);

        data.save(function (err, data) {
            if (err) {
                res.send({
                    error: 'Save datafailed!'
                });
                return;
            }

            // 更新数据
            if (req.body.TREENODEINFO) {
                mixin(data.TREENODEINFO, req.body.TREENODEINFO);
                req.body.TREENODEINFO = data.TREENODEINFO;
                // //console.log(data.TREENODEINFO);
                // //console.log(req.body.TREENODEINFO);
            }
            mixin(data, req.body);


            data.save(function (err, data) {
                if (err) {
                    res.send({
                        error: 'Save datafailed!'
                    });
                    return;
                }

                res.send(data);
            });
        });
    });
});

exports.route('/Destroy').post(function (req, res) {
    GD_USER.findOne({ 'NAME': req.body.NAME }).exec(function (err, data) {
        if (err || !data) {
            res.send({
                error: 'Data does not exist!'
            });
            return;
        }

        data.remove(function (err, data) {
            if (err) {
                res.send({
                    error: 'Delete data failed!'
                });
            }
            res.send(data);
        });
    });
})