/**
 * Dependencies
 */
var express = require('express');
var mixin = require('utils-merge');
var config = require('../config');

var db = require('../db/index');
var CACULATE = db.CACULATE;
var MDC_MACHINETOOLS = db.MDC_MACHINETOOLS;

/**`
 * Exports
 */
module.exports = exports = express.Router();

/**
 * Private variables and functions
 */

// CACULATE management  api/CACULATE
exports.route('/Create').post(function(req, res) {
    if (!req.body.MONTHLABLE || !req.body.RUNRATIO ||
        !req.body.USERATIO || !req.body.ONRATIO) {
        res.send({
            error: 'MONTHLABLE、RUNRATIO、USERATIO and ONRATIO must be specified!'
        });
        return;
    }
    CACULATE.getNextID(function(err, ID) {
        if (err) {
            res.send({
                error: err
            });
            return;
        }

        var data = {
            ID: ID,
            MONTHLABLE: req.body.MONTHLABLE,
            RUNRATIO: req.body.RUNRATIO,
            USERATIO: req.body.USERATIO,
            ONRATIO: req.body.ONRATIO,
        };



        (new CACULATE(data)).save(function(err, data) {
            if (err) {
                res.send({
                    error: 'Create CACULATE failed!'
                });
                return;
            }

            res.send(data);
        });
    });
});


exports.route('/:MONTHLABLE').get(function(req, res) {
    CACULATE.findOne({ 'MONTHLABLE': req.params.MONTHLABLE }).exec(function(err, data) {
        if (err || !data) {
            res.send(err);
            return;
        }
        res.send(data);
    });
})


// exports.route('/:ID').get(function (req, res) {
//    CACULATE.findOne({ 'ID': req.params.ID}).exec(function (err, data) {
//     if (err || ! data) {
//       res.send({
//         error: 'Data does not exist!'
//       });
//       return;
//     }

//     res.send(data);
//   });
// })