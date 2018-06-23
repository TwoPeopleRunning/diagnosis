var express = require('express');
var mixin = require('utils-merge');
var config = require('../config');
var expressJwt = require("express-jwt");
var jwt = require("jsonwebtoken");
var db = require('../db/index');
var MDC_FACTORY = db.MDC_FACTORY;

module.exports = exports = express.Router();

exports.route('/').get(function (req, res) {
    var limit = Number(req.query.limit) || config.page.limit;
    var skip = Number(req.query.skip) || 0;
    var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.cookies.Token;

    var condition = {};
    // 解码 token 
    var decoded = jwt.verify(token, config.jwt.secret);
    if (decoded.DEPARTMENT != '') {
        condition['NAME'] = decoded.DEPARTMENT;
    }

    if (req.query.id) {
        condition["TREENODEINFO.id"] = req.query.id
    }
    // //console.log(condition)
    MDC_FACTORY.find(condition).select('-_id').skip(skip).limit(limit)
        .sort({ "id": 1 }).exec(function (err, dataA) {
            if (err) {
                res.send({
                    error: 'Get MDC_FACTORY failed!'
                });
                return;
            }
            res.send(dataA);
        });
});

exports.route('/Create').post(function (req, res) {
    if (!req.body.NAME) {
        res.send({
            error: 'NAME must be specified!'
        });
        return;
    }

    MDC_FACTORY.getNextID(function (err, id) {
        if (err) {
            res.send({
                error: err
            });
            return;
        }
        var data = {
            ID: id,
            NAME: req.body.NAME,
            TREENODEINFO: req.body.TREENODEINFO
        };
        (new MDC_FACTORY(data)).save(function (err, data) {
            if (err) {
                res.send({
                    error: 'Create MDC_FACTORY failed!'
                });
                return;
            }
            res.send(data);
        });
    });
});

exports.route('/Update').post(function (req, res) {
    if (!req.body.isArray) {
        if (!req.body.NAME) {
            res.send({
                error: 'NAME must be specified!'
            });
            return;
        }

        MDC_FACTORY.findOne({ 'NAME': req.query.NAME }).exec(function (err, data) {
            if (err) {
                res.send({
                    error: err
                });
                return;
            }
            if (!data) {
                // 新建
                if (!req.body.NAME) {
                    res.send({
                        error: 'NAME must be specified!'
                    });
                    return;
                }

                MDC_FACTORY.getNextID(function (err, id) {
                    if (err) {
                        res.send({
                            error: err
                        });
                        return;
                    }
                    if (typeof req.body.TREENODEINFO == "string") {
                        req.body.TREENODEINFO = JSON.parse(req.body.TREENODEINFO);
                    }
                    var data = {
                        ID: id,
                        NAME: req.body.NAME,
                        TREENODEINFO: req.body.TREENODEINFO
                    };
                    (new MDC_FACTORY(data)).save(function (err, data) {
                        if (err) {
                            res.send({
                                error: 'Create MDC_FACTORY failed!'
                            });
                            return;
                        }
                        res.send(data);
                    });
                });
                return;
            }

            if (typeof req.body.TREENODEINFO == "string") {
                req.body.TREENODEINFO = JSON.parse(req.body.TREENODEINFO);
            }
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
                        error: 'Save data failed!'
                    });
                    return;
                }
                res.send(data);
            });
        });

    } else {
        //console.log(req.body);
        //console.log(req.body.data);
        req.body.data.forEach(function (e) {
            //console.log(e);
            MDC_FACTORY.findOne({ 'ID': e.ID }).exec(function (err, data) {
                // //console.log(req.body.ID);
                if (err || !data) {
                    res.send({
                        error: 'Data does not exist!'
                    });
                    return;
                }

                mixin(data, e);
                //console.log(data);
                data.save(function (err, data) {
                    if (err) {
                        res.send({
                            error: 'Save datafailed!'
                        });
                        return;
                    }
                });
            });
        });
        res.send({
            success: true
        });
    }
});

exports.route('/Destroy').post(function (req, res) {
    MDC_FACTORY.findOne({ 'NAME': req.body.NAME }).exec(function (err, data) {
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
});
