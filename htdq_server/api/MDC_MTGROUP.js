/**
 * Dependencies
 */
var express = require('express');
var mixin = require('utils-merge');
var config = require('../config');

var db = require('../db/index');
var MDC_MTGROUP = db.MDC_MTGROUP;

/**
 * Exports
 */
module.exports = exports = express.Router();

/**
 * Private variables and functions
 */

// MDC_GROUP management  api/MDC_MNT
exports.route('/').get(function (req, res) {
  var limit = Number(req.query.limit) || config.page.limit;
  var skip = Number(req.query.skip) || 0;

  var condition = {};
  if (req.query.NODE) {
    // condition.TREENODEINFO = {};
    condition["TREENODEINFO.pId"] = req.query.NODE;
  }
  if (req.query.id) {
    condition["TREENODEINFO.id"] = req.query.id
  }

  MDC_MTGROUP.find(condition).select('-_id').skip(skip).limit(limit)
    .sort({ createdAt: config.page.sort }).exec(function (err, dataA) {
      if (err) {
        res.send({
          error: 'Get MDC_GROUP list failed!'
        });
        return;
      }

      res.send(dataA);
    });
});

// exports.route('/Create').post(function (req, res) {
//   if (! req.body.NAME) {
//     res.send({
//       error: 'GROUP NAME must be specified!'
//     });
//     return;
//   }

//     if (err) {
//       res.send({
//         error: err
//       });
//       return;
//     }

//   var data = {
//     NAME: req.body.NAME,
//     NOTE: req.body.NOTE,
//     TREENODEINFO: {
//       id: { type: Number },
//       pId: { type: Number },
//       name: { type: String }, 
//       isParent: Boolean,
//       open: Boolean,
//       collection: { type: String }
//     }
//   };

//   (new MDC_MTGROUP(data)).save(function (err, data) {
//     if (err) {
//       res.send({
//         error: 'Create MDC_MTGROUP failed!'
//       });
//       return;
//     }

//     res.send(data);
//   });

// });

// exports.route('/:ID').get(function (req, res) {
//    MDC_GROUP.findOne({ 'ID': req.params.ID}).exec(function (err, data) {
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
  if (!req.body.NAME) {
    res.send({
      error: 'NAME must be specified!'
    });
    return;
  }

  MDC_MTGROUP.findOne({ 'NAME': req.query.NAME }).exec(function (err, data) {
    if (err) {
      res.send({
        error: err
      });
      return;
    }

    if (typeof req.body.TREENODEINFO == "string") {
      req.body.TREENODEINFO = JSON.parse(req.body.TREENODEINFO);
    }
    // 数据不存在则新建
    if (!data) {
      if (!req.body.NAME) {
        res.send({
          error: 'NAME must be specified!'
        });
        return;
      }
      MDC_MTGROUP.nameIsUni(req.body.NAME, function (err) {
        if (err) {
          res.send({
            error: err
          })
          return;
        }
        var data = {};
        mixin(data, req.body);
        (new MDC_MTGROUP(data)).save(function (err, data) {
          if (err) {
            res.send({
              error: 'Create MDC_GROUP failed!'
            });
            return;
          }
          res.send(data);
        });
        return;
      });
      return;
    }
    // 更新数据
    if (req.body.TREENODEINFO) {
      mixin(data.TREENODEINFO, req.body.TREENODEINFO);
      req.body.TREENODEINFO = data.TREENODEINFO;
    }
    mixin(data, req.body);
    // //console.log(data.TREENODEINFO);
    // //console.log(req.body.TREENODEINFO);
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
  MDC_MTGROUP.findOne({ 'NAME': req.body.NAME }).exec(function (err, data) {
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


