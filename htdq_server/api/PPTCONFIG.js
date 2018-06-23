/**
 * Dependencies
 */
var express = require('express');
var mixin = require('utils-merge');
var config = require('../config');

var db = require('../db/index');
/**
 * PPTCONFIG
 */
var PPTCONFIG = db.PPTCONFIG;

/**
 * Exports
 */
module.exports = exports = express.Router();

/**
 * Private variables and functions
 */

// PPTCONFIG management  api/MDC_MNT
exports.route('/').get(function(req, res) {
    PPTCONFIG.find().exec(function(err, pptconfig) {
        if (err) {
            res.send({
                error: 'pptconfig list failed!'
            });
            return;
        }
        res.send(pptconfig);
    });
}).post(function(req, res) {
    if (!req.body.TIMESETTING || !req.body.DISPLAYPERCENT || !req.body.NODEID || req.body.NODEID.length == 0) {
        res.send({
            error: 'NODEID、TIMESETTING and DISPLAYPERCENT must be specified!'
        })
    } else {
        var data = {
            MTID: req.body.MTID,
            CONTENT: req.body.CONTENT,
            TIMESETTING: req.body.TIMESETTING,
            DISPLAYPERCENT: req.body.DISPLAYPERCENT,
            BEGINTIME: req.body.BEGINTIME,
            EB: req.body.EB,
            LAYOUT: req.body.LAYOUT,
            ENDTIME: req.body.ENDTIME,
            NODEID: req.body.NODEID,
        };

        PPTCONFIG.findOne().exec(function(err, resp) {
            if (err || !resp) {
                new PPTCONFIG(data).save(function(err, data) {
                    if (err) {
                        res.send({
                            error: 'Save data failed!'
                        });
                        return;
                    }
                    res.send('PPTconfig is not exist! Create a new one')
                });
                return;
            }
            mixin(resp, req.body);
            resp.save(function(err, data) {
                if (err) {
                    res.send({
                        error: 'Save data failed!'
                    });
                    return;
                }
                res.send(data);
            });
        });
    }

});