/**
 * Dependencies
 */
var express = require('express');
var mixin = require('utils-merge');
var config = require('../config');

var db = require('../db/index');
var MDC_DSSEXPRESSIONS = db.MDC_DSSEXPRESSIONS;

/**
 * Exports
 */
module.exports = exports = express.Router();

/**
 * Private variables and functions
 */

// MDC_DSSEXPRESSIONS management  api/MDC_DSSEXPRESSIONS
exports.route('/').get(function (req, res) {
  var limit = Number(req.query.limit) || config.page.limit;
  var skip = Number(req.query.skip) || 0;

  var condition = {};

  MDC_DSSEXPRESSIONS.find(condition).select('-_id').skip(skip).limit(limit)
      .sort({ createdAt: config.page.sort }).exec(function (err, MDC_DSSEXPRESSIONSs) {
    if (err) {
      res.send({
        error: 'Get MDC_DSSEXPRESSIONS list failed!'
      });
      return;
    }

    res.send(MDC_DSSEXPRESSIONSs);
  });
});

exports.route('/Create').post(function (req, res) {
  if (! req.body.CNAME || ! req.body.ENAME || 
      ! req.body.EXPAND || ! req.body.SORT) {
    res.send({
      error: 'CNAME、ENAME、EXPAND and SORT must be specified!'
    });
    return;
  }

  MDC_DSSEXPRESSIONS.getNextID(function (err, ID) {
    if (err) {
      res.send({
        error: err
      });
      return;
    }

    var data = {
      ID: ID,
      ENAME: req.body.ENAME,
      CNAME: req.body.CNAME,
      EXPAND: req.body.EXPAND,
      SORT: req.body.SORT,
    };

    (new MDC_DSSEXPRESSIONS(data)).save(function (err, data) {
      if (err) {
        res.send({
          error: 'Create MDC_DSSEXPRESSIONS failed!'
        });
        return;
      }

      res.send(data);
    });
  });
});

// exports.route('/:ID').get(function (req, res) {
//    MDC_DSSEXPRESSIONS.findOne({ 'ID': req.params.ID}).exec(function (err, data) {
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
  if (! req.body.CNAME || ! req.body.ENAME || 
      ! req.body.EXPAND || ! req.body.SORT) {
    res.send({
      error: 'CNAME、ENAME、EXPAND and SORT must be specified!'
    });
    return;
  }

  MDC_DSSEXPRESSIONS.findOne({ 'ID': req.params.ID}).exec(function (err, data) {
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
  MDC_DSSEXPRESSIONS.findOne({ 'ID': req.body.ID}).exec(function (err, data) {
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


