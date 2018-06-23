/**
 * Dependencies
 */
var express = require('express');
var mixin = require('utils-merge');
var config = require('../config');

var db = require('../db/index');
var GD_ROLE = db.GD_ROLE;

/**
 * Exports
 */
module.exports = exports = express.Router();

/**
 * Private variables and functions
 */

// GD_ROLE management  api/GD_ROLE
exports.route('/').get(function (req, res) {
  var limit = Number(req.query.limit) || config.page.limit;
  var skip = Number(req.query.skip) || 0;

  var condition = {};

  GD_ROLE.find(condition).select('-_id').skip(skip).limit(limit)
      .sort({ createdAt: config.page.sort }).exec(function (err, GD_ROLEs) {
    if (err) {
      res.send({
        error: 'Get GD_ROLE list failed!'
      });
      return;
    }

    res.send(GD_ROLEs);
  });
});
exports.route('/Create').post(function (req, res) {
  if (! req.body.ROLENAME) {
    res.send({
      error: 'DEPTNAME must be specified!'
    });
    return;
  }

  // GD_ROLE.getNextID(function (err, ID) {
  //   if (err) {
  //     res.send({
  //       error: err
  //     });
  //     return;
  //   }

    var data = {
      RECORDID: req.body.RECORDID,
      ROLENAME: req.body.ROLENAME,
      SOFTWARECODE: req.body.SOFTWARECODE,
      NOTE: req.body.NOTE,
      INSERTTIME: req.body.INSERTTIME,
    };

    (new GD_ROLE(data)).save(function (err, data) {
      if (err) {
        res.send({
          error: 'Create GD_ROLE failed!'
        });
        return;
      }

      res.send(data);
    });
  });


// exports.route('/:ID').get(function (req, res) {
//    GD_ROLE.findOne({ 'ID': req.params.ID}).exec(function (err, data) {
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
  if (! req.body.ROLENAME) {
    res.send({
      error: 'MNTNAME、SVRNAME、SVRIP and SVRPORT must be specified!'
    });
    return;
  }

  GD_ROLE.findOne({ 'ROLENAME': req.body.ROLENAME}).exec(function (err, data) {
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
  GD_ROLE.findOne({ 'ROLENAME': req.body.ROLENAME}).exec(function (err, data) {
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


