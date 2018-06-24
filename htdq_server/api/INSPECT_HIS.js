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


//创建检测记录，可以兼顾单条和批量的创建，并更新轴承对应数据(轴承编号必须，且在数据库中有记录)
exports.route('/Create').post(function (req, res) {
    savedata = req.body;
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

