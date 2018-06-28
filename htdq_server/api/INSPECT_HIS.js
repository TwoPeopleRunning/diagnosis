// var util = require('util');
/**
 * Dependencies
 */
var express = require('express');
var mixin = require('utils-merge');
var config = require('../config');

var db = require('../db/index');
var INSPECT_HIS = db.INSPECT_HIS;
var MDC_BEARING = db.MDC_BEARING;
/**
 * Exports
 */
module.exports = exports = express.Router();

/**
 * Private variables and functions
 */

// INSPECT_HIS management  api/INSPECT_HIS


//创建检测记录，可以兼顾单条和批量的创建，并更新轴承对应数据(轴承编号和mtid必须，且在数据库中有记录)
exports.route('/Create').post(function (req, res) {
    savedata = req.body;
    savedata.lastInspect = new Date();
    INSPECT_HIS.find({}).sort({ id: -1 }).exec(function (err, data) {
        if (err) {
            res.send({ "error": err })
        } else {
            if (data.length == 0) {
                if (Array.isArray(savedata)) {
                    for (let index = 0; index < savedata.length; index++) {
                        savedata[index].id = index + 1;
                    }
                } else {
                    savedata.id = 1
                }
            } else {
                if (Array.isArray(savedata)) {
                    for (let index = 0; index < savedata.length; index++) {
                        savedata[index].id = data[0].id + index + 1;
                    }
                } else {
                    savedata.id = data[0].id + 1
                }
            }
            INSPECT_HIS.create(savedata, function (err, datas) {
                if (err) {
                    res.send({ 'error': err })
                } else {
                    if (Array.isArray(savedata)) {
                        for (let index = 0; index < savedata.length; index++) {
                            MDC_BEARING.findOne({ serialNumber: savedata[index].serialNumber }, function (finderr, updateInspect) {
                                if (err) {
                                    res.send({ "error": finderr })
                                } else {
                                    mixin(updateInspect, savedata[index]);
                                    updateInspect.save()
                                }
                            })
                        }
                    } else {
                        MDC_BEARING.findOne({ serialNumber: savedata.serialNumber }, function (finderr, updateInspect) {
                            if (err) {
                                res.send({ "error": finderr })
                            } else {
                                mixin(updateInspect, savedata);
                                if (savedata.result != '正常状态') {
                                    updateInspect.healthy = '0'
                                } else {
                                    updateInspect.healthy = '1'
                                }
                                updateInspect.save()
                            }
                        })
                    }
                    res.send(datas)
                }
            })
        }
    })

});

exports.route('/').get(function (req, res) {
    var condition = {};
    if (req.query.start || req.query.end) {
        condition['lastInspect'] = {};
    }
    if (req.query.mtid) { condition.mtid = req.query.mtid }
    if (req.query.serialNumber) { condition.serialNumber = req.query.serialNumber }
    if (req.query.start) { condition.lastInspect['$gt'] = new Date(req.query.start) }
    if (req.query.end) { condition.lastInspect['$lt'] = new Date(req.query.end) }
    INSPECT_HIS.find(condition, function (err, datas) {
        if (err) {
            res.send({ 'error': err })
        } else {
            res.send(datas)
        }
    })
})