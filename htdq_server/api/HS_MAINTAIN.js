/**
 * Dependencies
 */
var express = require('express');
var mixin = require('utils-merge');
var config = require('../config');

var db = require('../db/index');
var HS_MAINTAIN = db.HS_MAINTAIN;
var MDC_MACHINETOOLS = db.MDC_MACHINETOOLS;

/**`
 * Exports
 */
module.exports = exports = express.Router();

/**
 * Private variables and functions
 */

// HS_MAINTAIN management  api/HS_MAINTAIN
exports.route('/').get(function (req, res) {
    var limit = Number(req.query.limit) || config.page.limit;
    var skip = Number(req.query.skip) || 0;
    if (req.query.MTID) {
        condition.MTID = req.query.MTID
    }

    HS_MAINTAIN.find(condition).select('-_id').skip(skip).limit(limit)
        .sort({ "ID": 1 }).exec(function (err, HS_MAINTAINs) {
            if (err) {
                res.send({
                    error: 'Get HS_MAINTAIN list failed!'
                });
                return;
            }

            res.send(HS_MAINTAINs);
        });
});

exports.route('/Create').post(function (req, res) {
    if (!req.body.MTID || !req.body.CONTENT) {
        res.send({
            error: 'MTID and CONTENT must be specified!'
        });
        return;
    }
    MDC_MACHINETOOLS.find({ "ID": req.body.MTID }).exec(function (err, MTOOL) {
        // //console.log(MTOOL[0].WORKER)
        if (err) {
            res.send({
                error: 'Get MDC_MACHINETOOLS list failed!'
            });
            return;
        }
        HS_MAINTAIN.getNextID(function (err, ID) {
            if (err) {
                res.send({
                    error: err
                });
                return;
            }

            var data = {
                ID: ID,
                MTID: req.body.MTID,
                TIME: req.body.TIME,
                WORKER: ((!req.body.WORKER) ? MTOOL[0].WORKER : req.body.WORKER),
                PHONE: ((!req.body.PHONE) ? MTOOL[0].PHONE : req.body.PHONE),
                PERIOD: ((!req.body.PERIOD) ? MTOOL[0].PERIOD : req.body.PERIOD),
                CONTENT: req.body.CONTENT,
            };


            (new HS_MAINTAIN(data)).save(function (err, data) {
                if (err) {
                    res.send({
                        error: 'Create HS_MAINTAIN failed!'
                    });
                    return;
                }

                res.send(data);
            });
        });
    });
});

// exports.route('/:ID').get(function (req, res) {
//    HS_MAINTAIN.findOne({ 'ID': req.params.ID}).exec(function (err, data) {
//     if (err || ! data) {
//       res.send({
//         error: 'Data does not exist!'
//       });
//       return;
//     }

//     res.send(data);
//   });
// })