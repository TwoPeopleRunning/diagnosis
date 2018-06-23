/**
 * Dependencies
 */
var methods = require('./methods');
var validateType = require('./types');
var interceptors = require('./interceptors');
var EventEmitter = require('events').EventEmitter;
var Device = require('../db/index').MDC_MACHINETOOLS;
var mixin = require('utils-merge');
var config = require('../config');
var utils = require('./utils');

/**
 * Private variables and functions
 */

var validate = function (req) {
  if (!req.action || !req.apikey || !req.deviceid) {
    return false;
  }

  // if (! /^[0-9a-f]{10}$/.test(req.deviceid)) {
  //   return false;
  // }

  return true;
};

/**
 * { 'sequenceValue': { req: reqObj, callback: callbackFunc, timer: setTimeout() } }
 */
var pendingRequests = {};
var removePendingRequest = function (sequence) {
  var pending = pendingRequests[sequence];
  if (!pending) return;
  //console.log('Request Timeout');
  pending.callback(interceptors(pending.req, { error: 504, reason: 'Request Timeout' }));
  delete pendingRequests[sequence];
};

/**
 * Exports
 */
module.exports = exports;
mixin(exports, EventEmitter.prototype);

exports.postRequest = function (req, callback) {
  //console.log('postRequest');
  if (!validate(req)) {
    callback(interceptors(req, { error: 400, reason: 'Bad Request' }));
    return;
  }


  if (typeof methods[req.action] !== 'function') {
    callback(interceptors(req, {
      error: 400,
      reason: 'Bad Request'
    }));
    return;
  }

  req.sequence = req.sequence || ('' + Date.now());
  if (utils.fromDevice(req) || (req.action == 'query' && !req.params.length)) {
    methods[req.action](req, callback);
    return;
  }

  // if (typeof req.params !== 'object' || !validateType(req)) {
  if (typeof req.params !== 'object') {
    callback(interceptors(req, {
      error: 400,
      reason: 'Bad Request'
    }));
    return;
  }

  // Update or query message from apps
  //检查请求参数
  Device.exists(req.apikey, req.deviceid, function (err, device) {
    if (err || !device) {
      callback(interceptors(req, {
        error: 403,
        reason: 'Forbidden'
      }));
      return;
    }

    if (!device.online) {
      callback(interceptors(req, {
        error: 503,
        reason: 'Device Offline'
      }));
      return;
    }

    req.sequence = req.sequence || ('' + Date.now());

    exports.emit('app.' + req.action, req);

    pendingRequests[req.sequence] = {
      req: req,
      callback: callback,
      timer: setTimeout(removePendingRequest,
        config.pendingRequestTimeout || 10000,
        req.sequence)
    };
  });
};

exports.postResponse = function (res) {
  //console.log('postResponse');
  if (!res.sequence || !pendingRequests[res.sequence]) return;
  var pending = pendingRequests[res.sequence];
  clearTimeout(pending.timer);

  if (res.error === 0 && pending.req.action == 'update') {
    //协议栈处理广播用户操作更新
    methods['update'](pending.req, pending.callback);
  } else {// query or error
    pending.callback(res);
  }

  delete pendingRequests[res.sequence];
};

exports.postMessage = function (msg) {
  if (!msg.type || typeof msg.type !== 'string') return;

  switch (msg.type) {
    // Device online offline
    case 'device.online':
      // if (!msg.deviceid || typeof msg.deviceid !== 'string') return;
      if (!msg.deviceid) return;
      Device.getDeviceByDeviceid(msg.deviceid, function (err, device) {
        if (err || !device) return;

        device.online = msg.online ? true : false;
        device.save();

        //console.log('Device:' + device.ID + (device.online ? ' online' : ' offline'));
        exports.emit('device.online', {
          action: 'sysmsg',
          deviceid: device.ID, //ansi
          apikey: device.MATOLGRPID,  //ansi
          params: {
            online: device.online
          }
        });
      });
      break;
    // APP online offline
    case 'app.online':
      if (!msg.deviceid) return;
      Device.getDeviceByDeviceid(msg.deviceid, function (err, device) {
        if (err || !device) return;

        //console.log('APP:' +  (msg.online ? ' online' : ' offline'));
        exports.emit('app.online', {
          action: 'sysmsg',
          deviceid: device.ID, //ansi
          apikey: device.MATOLGRPID,  //ansi
          params: {
            apponline: msg.online
          }
        });
      });
      break;
  }
};

exports.utils = utils;

methods.on('update', function (req) {
  exports.emit('device.update', req);
});

methods.on('query', function (req) {
  exports.emit('app.query', req);
});
