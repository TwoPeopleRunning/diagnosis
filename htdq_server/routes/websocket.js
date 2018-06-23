/**
 * Dependencies
 */
var Server = require('ws').Server;
var protocol = require('../protocol/index');
var mixin = require('utils-merge');

/**
 * Private variables and functions
 */

var devices = {}; // { deviceid: [ws, ws, ws] }
var apps = {};  // { deviceid: [ws, ws, ws] }

var clean = function (ws) {
  ws.devices.forEach(function (deviceid) {
    if (Array.isArray(devices[deviceid]) && devices[deviceid][0] === ws) {
      delete devices[deviceid];
      protocol.postMessage({
        type: 'device.online',
        deviceid: deviceid,
        online: false
      });
    }

    var pos, wsList = apps[deviceid];
    if (wsList && (pos = wsList.indexOf(ws)) !== -1) {
      wsList.splice(pos, 1);
      if (wsList.length === 0) {
        delete apps[deviceid];
        protocol.postMessage({
          type: 'app.online',
          deviceid: deviceid,
          online: false
        });
      }
    }
  });
};

var Types = {
  'REQUEST': 1,
  'RESPONSE': 2,
  'UNKNOWN': 0
};
var getType = function (msg) {
  if (msg.action && msg.deviceid && msg.apikey) return Types.REQUEST;

  if (typeof msg.error === 'number') return Types.RESPONSE;

  return Types.UNKNOWN;
};

var postRequest = function (ws, req) {
  if (req.ws && req.ws === ws) {
    return;
  }
  var msg = JSON.stringify(req, function (key, value) {
    if (key === 'ws' || key === 'mq') {
      // exclude property ws from resulting JSON string
      return undefined;
    }
    return value;
  });
  //console.log('\nWB postRequest\n' + msg);
  ws.send(msg);
};

var postRequestToApps = function (req) {
  apps[req.deviceid] && apps[req.deviceid].forEach(function (ws) {
    //console.log('WB postRequestToApps');
    postRequest(ws, req);
  });
};

var postRequestToDevices = function (req) {
  devices[req.deviceid] && devices[req.deviceid].forEach(function (ws) {
    // Transform timers for ITEAD indie device
    //console.log('\nWB updateToDevice');
    postRequest(ws, protocol.utils.transformRequest(req));
  });
};

protocol.on('device.update', function (req) {
  postRequestToApps(req);
});

protocol.on('device.online', function (req) {
  postRequestToApps(req);
});

protocol.on('app.update', function (req) {
  postRequestToDevices(req);
});

protocol.on('app.query', function (req) {
  postRequestToDevices(req);
});

protocol.on('app.online', function (req) {
  postRequestToDevices(req);
});

/**
 * Exports
 */

module.exports = function (httpServer) {
  var server = new Server({
    server: httpServer,
    path: '/api/ws'
  });

  server.on('connection', function (ws, req) {
    ws.devices = [];
    const ip = req.connection.remoteAddress;
    //console.log('Connection', ip);
    ws.on('message', function (msg) {
      try {
        msg = JSON.parse(msg);
        //console.log(ip, msg);
      }
      catch (err) {
        // Ignore non-JSON message
        return;
      }

      switch (getType(msg)) {
        case Types.UNKNOWN:
          return;

        case Types.RESPONSE:
          //console.log('WB RESPONSE');
          protocol.postResponse(msg);
          return;

        case Types.REQUEST:
          //console.log('WB REQUEST');
          msg.ws = ws;
          protocol.postRequest(msg, function (res) {
            // Transform timers for ITEAD indie device
            if (protocol.utils.fromDevice(msg) &&
              protocol.utils.isFactoryDeviceid(msg.deviceid)) {
              res = protocol.utils.transformResponse(res);
            }
            ws.send(JSON.stringify(res));

            if (res.error) return;

            // Message sent from device
            if (protocol.utils.fromDevice(msg)) {
              devices[msg.deviceid] = devices[msg.deviceid] || [];

              if (devices[msg.deviceid][0] === ws) return;

              devices[msg.deviceid] = [ws];
              ws.devices.push(msg.deviceid);
              protocol.postMessage({
                type: 'device.online',
                deviceid: msg.deviceid,
                online: true
              });

              return;
            }

            // Message sent from apps
            apps[msg.deviceid] = apps[msg.deviceid] || [];

            if (apps[msg.deviceid].indexOf(ws) !== -1) return;

            apps[msg.deviceid].push(ws);
            ws.devices.push(msg.deviceid);
          });
      }
    });

    ws.on('close', function () {
      clean(ws);
    });

    ws.on('error', function () {
      clean(ws);
    });
  });

};

