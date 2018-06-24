// var util = require('util');
/**
 * Dependencies
 */
var express = require('express');
var mixin = require('utils-merge');
var config = require('../config');

var db = require('../db/index');
var MDC_BEARING = db.MDC_BEARING;
var MDC_MACHINETOOLS = db.MDC_MACHINETOOLS;

/**
 * Exports
 */
module.exports = exports = express.Router();

/**
 * Private variables and functions
 */

// MDC_BEARING management  api/MDC_BEARING
exports.route('/Delete/:serialNumber').get(function (req, res) {
    serialNumber = req.params.serialNumber;
    MDC_BEARING.remove({ serialNumber: serialNumber }, function (err, response) {
        if (err) {
            res.send({ 'error': err })
        } else {
            res.send(response)
        }
    })

});

exports.route('/:mtid').get(function (req, res) {
    mtid = req.params.mtid;
    MDC_BEARING.find({ mtid: mtid }, function (err, response) {
        if (err) {
            res.send({ 'error': err })
        } else {
            res.send(response)
        }
    })

});

//mtid为机床id，如果有serialNumber就是修改信息，如果没有serialNumber就是创建轴承信息，serialNumber格式mtid_id
exports.route('/Create').post(function (req, res) {
    if (!req.body.mtid || !req.body.position || !req.body.kind) {
        res.send("mtid、position、kind is necessary")
    } else {
        data = {
            'mtid': req.body.mtid,
            'position': req.body.position,
            'kind': req.body.kind,
            'good': req.body.good ? req.body.good : 0,
            'innerProblem': req.body.innerProblem ? req.body.innerProblem : 0,
            'outProblem': req.body.outProblem ? req.body.outProblem : 0,
            'ballProblem': req.body.ballProblem ? req.body.ballProblem : 0,
            'lastInspect': req.body.lastInspect ? req.body.lastInspect : '',
        };
        if (req.body.serialNumber) {
            data.serialNumber = req.body.serialNumber;
            MDC_BEARING.findOne({ serialNumber: req.body.serialNumber }, function (finderr, existdata) {
                if (finderr) {
                    res.send({ 'error': finderr })
                } else {
                    if (existdata) {
                        mixin(existdata, data)
                        existdata.save(function (err, data) {
                            if (err) {
                                res.send({
                                    error: 'Save datafailed!'
                                });
                                return;
                            }
                            res.send(data);
                        })
                    }
                }
            })
        }
        else {
            MDC_BEARING.find({}).sort({ serialNumber: -1 }).exec(function (err, alldata) {
                if (err) {
                    res.send({ 'error': err })
                } else {
                    if (alldata.length == 0) {
                        data.serialNumber = req.body.mtid + '_1'
                    } else {
                        data.serialNumber = req.body.mtid + '_' + String(Number(alldata[0].serialNumber.split('_')[1]) + 1)
                    }
                    (new MDC_BEARING(data)).save(function (err, option) {
                        if (err) {
                            res.send({ 'error': err })
                        } else {
                            res.send(option)
                        }
                    })
                }
            });
        }
    }
});

