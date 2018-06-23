/**
 * Dependencies
 */
var express = require('express');
var mixin = require('utils-merge');
var config = require('../config');

var db = require('../db/index');
/**
 * LOGRECORD
 */
var LOGRECORD = db.LOGRECORD;

/**
 * Exports
 */
module.exports = exports = express.Router();

/**
 * Private variables and functions
 */

// LOGRECORD management  api/LOGRECORD
exports.route('/').get(function(req, res) {
    var limit = Number(req.query.limit) || config.page.limit;
    var skip = Number(req.query.skip) || 0;

    var condition = {};

    LOGRECORD.find(condition).select('-_id').skip(skip).limit(limit)
        .sort({"ID":-1}).exec(function(err, LOGRECORDs) {
            if (err) {
                res.send({
                    error: 'Get LOGRECORD list failed!'
                });
                return;
            }

            res.send(LOGRECORDs);
        });
}).post(function(req, res) {
    if (!req.body.TYPE || !req.body.TIME || !req.body.USER) {
        res.send({
            error: 'TYPE、USER and TIME must be specified!'
        });
        return;
    }
    LOGRECORD.getNextID(function(err, ID) {
        if (err) {
            res.send({
                error: err
            });
            return;
        }

        var data = {
            ID: ID,
            TYPE: req.body.TYPE,
            TIME: req.body.TIME,
            IP: req.body.IP,
            USER: req.body.USER
        };

        (new LOGRECORD(data)).save(function(err, data) {
            if (err) {
                res.send({
                    error: 'Create LOGRECORD failed!'
                });
                return;
            }

            res.send(data);
        });
    });
});