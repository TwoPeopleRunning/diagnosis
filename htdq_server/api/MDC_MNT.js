/**
 * Dependencies
 */
var express = require('express');
var mixin = require('utils-merge');
var config = require('../config');

var db = require('../db/index');
var MDC_MNT = db.MDC_MNT;

/**
 * Exports
 */
module.exports = exports = express.Router();

/**
 * Private variables and functions
 */

// MDC_MNT management  api/MDC_MNT
exports.route('/').get(function (req, res) {
  var limit = Number(req.query.limit) || config.page.limit;
  var skip = Number(req.query.skip) || 0;

  var condition = {};

  MDC_MNT.find(condition).select('-_id').skip(skip).limit(limit)
    .sort({ createdAt: config.page.sort }).exec(function (err, MDC_MNTs) {
      if (err) {
        res.send({
          error: 'Get MDC_MNT list failed!'
        });
        return;
      }

      res.send(MDC_MNTs);
    });
});

exports.route('/Create').post(function (req, res) {
  if (!req.body.MNTNAME || !req.body.SVRNAME ||
    !req.body.SVRIP || !req.body.SVRPORT) {
    res.send({
      error: 'MNTNAME、SVRNAME、SVRIP and SVRPORT must be specified!'
    });
    return;
  }

  MDC_MNT.getNextID(function (err, ID) {
    if (err) {
      res.send({
        error: err
      });
      return;
    }

    var data = {
      ID: ID,
      MNTNAME: req.body.MNTNAME,
      SVRNAME: req.body.SVRNAME,
      SVRIP: req.body.SVRIP,
      MNTDESC: req.body.MNTDESC,
      EXPAND: req.body.EXPAND,
      SVRPORT: req.body.SVRPORT,
    };

    (new MDC_MNT(data)).save(function (err, data) {
      if (err) {
        res.send({
          error: 'Create MDC_MNT failed!'
        });
        return;
      }

      res.send(data);
    });
  });
});

// exports.route('/:ID').get(function (req, res) {
//    MDC_MNT.findOne({ 'ID': req.params.ID}).exec(function (err, data) {
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
  //console.log(req.body);
  if (!req.body.MNTNAME || !req.body.SVRNAME ||
    !req.body.SVRIP || !req.body.SVRPORT) {
    res.send({
      error: 'MNTNAME、SVRNAME、SVRIP and SVRPORT must be specified!'
    });
    return;
  }

  MDC_MNT.findOne({ 'ID': req.body.ID }).exec(function (err, data) {
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
  MDC_MNT.findOne({ 'ID': req.body.ID }).exec(function (err, data) {
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


