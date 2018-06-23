/**
 * Dependencies
 */
var express = require('express');
var mixin = require('utils-merge');
var config = require('../config');

var db = require('../db/index');
var MDC_SYSVR = db.MDC_SYSVR;

/**
 * Exports
 */
module.exports = exports = express.Router();

/**
 * Private variables and functions
 */

// MDC_SYSVR management  api/MDC_SYSVR
exports.route('/').get(function (req, res) {
  var limit = Number(req.query.limit) || config.page.limit;
  var skip = Number(req.query.skip) || 0;

  var condition = {};

  MDC_SYSVR.find(condition).select('-_id').skip(skip).limit(limit)
    .sort({ createdAt: config.page.sort }).exec(function (err, MDC_SYSVRs) {
      if (err) {
        res.send({
          error: 'Get MDC_SYSVR list failed!'
        });
        return;
      }

      res.send(MDC_SYSVRs);
    });
});

exports.route('/Create').post(function (req, res) {
  if (!req.body.SYSVRNAME || !req.body.SYSVRIP || !req.body.SYSVRPORT) {
    res.send({
      error: 'SYSVRNAME、SYSVRIP and SYSVRPORT must be specified!'
    });
    return;
  }

  MDC_SYSVR.getNextID(function (err, ID) {
    if (err) {
      res.send({
        error: err
      });
      return;
    }

    var data = {
      ID: ID,
      SYSVRNAME: req.body.SYSVRNAME,
      SYSVRIP: req.body.SYSVRIP,
      SYSVRPORT: req.body.SYSVRPORT,
    };

    (new MDC_SYSVR(data)).save(function (err, data) {
      if (err) {
        res.send({
          error: 'Create MDC_SYSVR failed!'
        });
        return;
      }

      res.send(data);
    });
  });
});

// exports.route('/:ID').get(function (req, res) {
//    MDC_SYSVR.findOne({ 'ID': req.params.ID}).exec(function (err, data) {
//     if (err || ! data) {
//       res.send({
//         error: 'Data does not exist!'
//       });
//       return;
//     }

//     res.send(data);
//   });
// })
exports.route('/Update').post(function (req, res) {
  if (!req.body.SYSVRNAME || !req.body.SYSVRIP || !req.body.SYSVRPORT) {
    res.send({
      error: 'SYSVRNAME、SYSVRIP and SYSVRPORT must be specified!'
    });
    return;
  }

  MDC_SYSVR.findOne({ 'ID': req.body.ID }).exec(function (err, data) {
    //console.log(req.body.ID);
    if (err || !data) {
      res.send({
        error: 'Data does not exist!'
      });
      return;
    }

    mixin(data, req.body);
    data.save(function (err, data) {
      if (err) {
        res.send({
          error: 'Save datafailed!'
        });
        return;
      }

      res.send(data);
    });
  });
});

exports.route('/Destroy').post(function (req, res) {
  MDC_SYSVR.findOne({ 'ID': req.body.ID }).exec(function (err, data) {
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


