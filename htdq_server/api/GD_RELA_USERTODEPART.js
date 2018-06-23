/**
 * Dependencies
 */
var express = require('express');
var mixin = require('utils-merge');
var config = require('../config');

var db = require('../db/index');
var GD_RELA_USERTODEPART = db.GD_RELA_USERTODEPART;

/**
 * Exports
 */
module.exports = exports = express.Router();

/**
 * Private variables and functions
 */

// GD_RELA_USERTODEPART management  api/GD_RELA_USERTODEPART
exports.route('/').get(function (req, res) {
  var limit = Number(req.query.limit) || config.page.limit;
  var skip = Number(req.query.skip) || 0;

  var condition = {};

  GD_RELA_USERTODEPART.find(condition).select('-_id').skip(skip).limit(limit)
      .sort({ createdAt: config.page.sort }).exec(function (err, GD_RELA_USERTODEPARTs) {
    if (err) {
      res.send({
        error: 'Get GD_RELA_USERTODEPART list failed!'
      });
      return;
    }

    res.send(GD_RELA_USERTODEPARTs);
  });
});
exports.route('/Create').post(function (req, res) {
  if (! req.body.USERID) {
    res.send({
      error: 'USERID must be specified!'
    });
    return;
  }

  // GD_RELA_USERTODEPART.getNextID(function (err, ID) {
  //   if (err) {
  //     res.send({
  //       error: err
  //     });
  //     return;
  //   }

    var data = {
      USERID: req.body.USERID,
      DPTID: req.body.DPTID,
    };

    (new GD_RELA_USERTODEPART(data)).save(function (err, data) {
      if (err) {
        res.send({
          error: 'Create GD_RELA_USERTODEPART failed!'
        });
        return;
      }

      res.send(data);
    });
  });


// exports.route('/:ID').get(function (req, res) {
//    GD_RELA_USERTODEPART.findOne({ 'ID': req.params.ID}).exec(function (err, data) {
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
  if (! req.body.USERID) {
    res.send({
      error: 'MNTNAME、SVRNAME、SVRIP and SVRPORT must be specified!'
    });
    return;
  }

  GD_RELA_USERTODEPART.findOne({ 'USERID': req.body.USERID}).exec(function (err, data) {
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
  GD_RELA_USERTODEPART.findOne({ 'USERID': req.body.USERID}).exec(function (err, data) {
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


