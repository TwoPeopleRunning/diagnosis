/**
 * Dependencies
 */
var mongoose = require('mongoose');

/**
 * Private variables and functions
 */
var Schema = mongoose.Schema;
var lastID = 0;

/**
 * Exports
 */
var schema = new Schema({
    ID: { type: Number, required: true, index: true },
    MATOLGRPID: { type: String, index: true },
    DEPTID: { type: String, default: "" },
    COLSERVERID: { type: Number, default: "" },
    MATOLCODE: { type: String, default: "" },
    MATOLNAME: { type: String, default: "" },
    MATOLTYPE: { type: String, default: "" },
    MATOLIP: { type: String, default: "" },
    MATOLPORT: { type: Number, default: "" },
    INSTIME: { type: String, default: "" },
    EXPAND: { type: String, default: "" },
    ACTIVE: { type: Number, default: "" },
    SYSTEMTYPE: { type: String, default: "" },
    WORKER: { type: String, default: "" },
    PHONE: { type: String, default: "" },
    PERIOD: { type: Number, default: 30 },
    online: { type: Boolean, index: true, default: false }, //add-ansi
    TREENODEINFO: {
        id: { type: Number },
        pId: { type: Number },
        name: { type: String }, 
        isParent: Boolean,
        open: Boolean,
        collection: { type: String }
      }
}, { collection: "MDC_MACHINETOOLS" });

schema.static('nameIsUni', function (name, callback) {
  this.findOne({MATOLNAME: name},function(err, existData){
    if(err || existData){
      callback("MATOLNAME must be unique.");
      return;
    }
    callback(null);
  });
});

schema.static('getNextID', function(callback) {
    if (lastID) {
        lastID = lastID + 1;
        if (!lastID) {
            callback('Not enough IDs available!');
            return;
        }
        callback(null, lastID);
        return;
    }

    this.where({}).select('ID').sort('-ID').findOne(function(err, data) {
        if (err) {
            callback(err);
            return;
        }

        if (!data) {
            // Starting with 1 instead of 0 makes more sense to non-programmer
            lastID = 1;
            callback(null, lastID);
            return;
        }

        lastID = data.ID + 1;
        if (!lastID) {
            callback('Not enough IDs available!');
            return;
        }
        callback(null, lastID);
        return;
    });
});

//add-ansi
schema.static('exists', function (apikey, deviceid, callback) {
  this.where({ MATOLGRPID: apikey, ID: deviceid }).findOne(callback);
});

schema.static('getDeviceByDeviceid', function (deviceid, callback) {
  this.where({ ID: deviceid }).findOne(callback);
});

//end-add

module.exports = mongoose.model('MDC_MACHINETOOLS', schema);