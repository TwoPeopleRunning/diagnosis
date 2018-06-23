var express = require('express');
var mixin = require('utils-merge');
var config = require('../config');

var db = require('../db/index');
var MDC_MACHINELAYOUT = db.MDC_MACHINELAYOUT;

module.exports = exports = express.Router();

exports.route('/').get(function(req, res) {
    var limit = Number(req.query.limit) || config.page.limit;
    var skip = Number(req.query.skip) || 0;

    var condition = {};
    if (req.query.ID) {
        condition.ID = req.query.ID;
    }

    MDC_MACHINELAYOUT.find(condition).select('-_id').skip(skip).limit(limit)
        .sort({ "ID": 1 }).exec(function(err, MDC_MACHINELAYOUT) {
            if (err) {
                res.send({
                    error: 'Get MDC_MACHINELAYOUT picture list failed!'
                });
                return;
            }
            res.send(MDC_MACHINELAYOUT);
        });
});

exports.route('/Update').post(function(req, res) {
    if (!req.body.isArray) {
        if (!req.body.SRC) {
            res.send({
                error: 'SRC must be specified!'
            });
            return;
        }

        MDC_MACHINELAYOUT.findOne({}).exec(function(err, data) {
            if (err) {
                res.send({
                    error: err
                });
                return;
            }
            if (!data) {
                MDC_MACHINELAYOUT.getNextID(function(err, ID){
                    if (err) {
                        res.send({
                            err: err
                        });
                        return;
                    }
                    var data = {
                        ID: ID,
                        SRC: req.body.SRC
                    };
                    (new MDC_MACHINELAYOUT(data)).save(function(err, data) {
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
            }
            mixin(data, req.body);
            data.save(function(err, data) {
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
    }
});

