/**
 * Dependencies
 */
var Device = require('../db/index').MDC_MACHINETOOLS;
var validate = require('./types');
var interceptors = require('./interceptors');
var EventEmitter = require('events').EventEmitter;
var mixin = require('utils-merge');

/**
 * Exports
 */
module.exports = exports = {};
mixin(exports, EventEmitter.prototype);

exports.update = function (req, callback) {
  //检查请求参数
  // if (typeof req.params !== 'object' || ! validate(req)) {
  //   callback(interceptors(req, {
  //     error: 400,
  //     reason: 'Bad Request'
  //   }));
  //   return;
  // }

  Device.exists(req.apikey, req.deviceid, function (err, device) {
    if (err || ! device) {
      callback(interceptors(req, {
        error: 403,
        reason: 'Forbidden'
      }));
      return;
    }

    //取消数据库存储 ansi
    /*
    mixin(device.params, req.params);
    device.markModified('params');
    if (req.params.timers) {
      device.markModified('params.timers');
    }
    device.save();
    */
    
    callback(interceptors(req, {
      error: 0
    }));

    exports.emit('update', req);
  });
};

exports.query = function (req, callback) {
  if (! Array.isArray(req.params)) {
    callback(interceptors(req, {
      error: 400,
      reason: 'Bad Request'
    }));
    return;
  }

  Device.exists(req.apikey, req.deviceid, function (err, device) {
    if (err || ! device) {
      callback(interceptors(req, {
        error: 403,
        reason: 'Forbidden'
      }));
      return;
    }

    if (! req.params.length) {
      callback(interceptors(req, {
        error: 0,
        params: device.params
      }));
      return;
    }
    
    callback(interceptors(req, {
      error: 0
    }));
    exports.emit('query', req);
  });
};
