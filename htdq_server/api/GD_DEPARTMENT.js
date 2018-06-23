/**
 * Dependencies
 */
var express = require('express');
var mixin = require('utils-merge');
var config = require('../config');

var db = require('../db/index');
var GD_DEPARTMENT = db.GD_DEPARTMENT;

/**
 * Exports
 */
module.exports = exports = express.Router();

/**
 * Private variables and functions
 */

// GD_DEPARTMENT management  api/GD_DEPARTMENT
exports.route('/').get(function (req, res) {
  var limit = Number(req.query.limit) || config.page.limit;
  var skip = Number(req.query.skip) || 0;

  var condition = {};

  GD_DEPARTMENT.find(condition).select('-_id').skip(skip).limit(limit)
      .sort({ createdAt: config.page.sort }).exec(function (err, GD_DEPARTMENTs) {
    if (err) {
      res.send({
        error: 'Get GD_DEPARTMENT list failed!'
      });
      return;
    }

    res.send(GD_DEPARTMENTs);
  });
});
exports.route('/Create').post(function (req, res) {
  if (! req.body.DEPTNAME) {
    res.send({
      error: 'DEPTNAME must be specified!'
    });
    return;
  }

  // GD_DEPARTMENT.getNextID(function (err, ID) {
  //   if (err) {
  //     res.send({
  //       error: err
  //     });
  //     return;
  //   }

    var data = {
      RECORDID: req.body.RECORDID,
      DEPTNAME: req.body.DEPTNAME,
      NOTE: req.body.NOTE,
      PTPARTID: req.body.PTPARTID,
      DEPTTYPE: req.body.DEPTTYPE,
      SUNMBER: req.body.SUNMBER,
      DEPOTNO: req.body.DEPOTNO,
      INSERTTIME: req.body.INSERTTIME,
    };

    (new GD_DEPARTMENT(data)).save(function (err, data) {
      if (err) {
        res.send({
          error: 'Create GD_DEPARTMENT failed!'
        });
        return;
      }

      res.send(data);
    });
  });


// exports.route('/:ID').get(function (req, res) {
//    GD_DEPARTMENT.findOne({ 'ID': req.params.ID}).exec(function (err, data) {
//     if (err || ! data) {
//       res.send({
//         error: 'Data does not exist!'
//       });
//       return;
//     }

//     res.send(data);
//   });
// });

exports.route('/Update').post(function (req, res) {
  if (! req.body.DEPTNAME) {
    res.send({
      error: 'MNTNAME、SVRNAME、SVRIP and SVRPORT must be specified!'
    });
    return;
  }

  GD_DEPARTMENT.findOne({ 'DEPTNAME': req.body.DEPTNAME}).exec(function (err, data) {
    if (err || ! data) {
      res.send({
        error: 'Data does not exist!'
      });
      return;
    }

    mixin(data,req.body);
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
  GD_DEPARTMENT.findOne({ 'DEPTNAME': req.body.DEPTNAME}).exec(function (err, data) {
     if (err || ! data) {
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


