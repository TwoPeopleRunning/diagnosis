var express = require('express');
var mixin = require('utils-merge');
var config = require('../config');

var db = require('../db/index');
var MDC_DSSLAYOUT = db.MDC_DSSLAYOUT;

module.exports = exports = express.Router();

exports.route('/').get(function (req, res) {
    var limit = Number(req.query.limit) || config.page.limit;
    var skip = Number(req.query.skip) || 0;

    var condition = {};
    if (req.query.MTID) {
        condition.MTID = req.query.MTID;
    }

    MDC_DSSLAYOUT.find(condition).select('-_id').skip(skip).limit(limit)
        .sort({ "MTID": 1 }).exec(function (err, MDC_DSSLAYOUT) {
            if (err) {
                res.send({
                    error: 'Get MDC_DSSLAYOUT picture list failed!'
                });
                return;
            }
            res.send(MDC_DSSLAYOUT);
        });
});

// exports.route('/Create').post(function(req, res) {
//     if (!req.body.MTNAME || !req.body.MTID) {
//         res.send({
//             error: 'MTNAME and MTID must be specified!'
//         });
//         return;
//     }
//     var data = {};
//     mixin(data, req.body);
//     (new MDC_DSSLAYOUT(data)).save(function(err, data) {
//         if (err) {
//             res.send({
//                 error: 'Create MDC_DSSLAYOUT failed!'
//             });
//             return;
//         }
//         res.send(data);
//     });
// });


exports.route('/Update').post(function (req, res) {
    if (!req.body.isArray) {
        if (!req.body.MTID) {
            res.send({
                error: 'MTNAME must be specified!'
            });
            return;
        }

        MDC_DSSLAYOUT.findOne({ 'MTID': req.body.MTID }).exec(function (err, data) {
            if (err) {
                res.send({
                    error: err
                });
                return;
            }
            if (!data) {
                var data = {};
                mixin(data, req.body);
                (new MDC_DSSLAYOUT(data)).save(function (err, data) {
                    if (err) {
                        res.send({
                            error: 'Save data failed!'
                        });
                        return;
                    }
                    res.send(data);
                });
                return;
            }
            mixin(data, req.body);
            data.save(function (err, data) {
                if (err) {
                    res.send({
                        error: 'Save data failed!'
                    });
                    return;
                }
                res.send(data);
            });
            return;
        });
    } else {
        //console.log(req.body);
        //console.log(req.body.data);
        req.body.data.forEach(function (e) {
            //console.log(e);
            MDC_DSSLAYOUT.findOne({ 'MTID': e.MTID }).exec(function (err, data) {
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
    MDC_DSSLAYOUT.findOne({ 'MTID': req.body.MTID }).exec(function (err, data) {
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
