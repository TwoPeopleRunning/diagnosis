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
  //ONEHOUR参数
  ID: { type: Number, require: true },
  LABEL: { type: String, required: true, },
  // match: /^20[0-9]{2}-[0-1][0-2]-[0-3][0-9]-[0-2][0-9]$/,
  RESULT: { type: Array, required: true, default: [] }
}, { collection: "ONEHOUR" });


schema.static('getNextID', function (callback) {
  if (lastID) {
    lastID = lastID + 1;
    if (!lastID) {
      callback('Not enough IDs available!');
      return;
    }
    callback(null, lastID);
    return;
  }

  this.where({}).select('ID').sort('-ID').findOne(function (err, data) {
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
schema.static('nameIsUni', function (label, callback) {
  this.findOne({ LABEL: label }, function (err, existData) {
    if (err || existData) {
      callback("MATOLNAME must be unique.");
      return;
    }
    callback(null);
  });
});
module.exports = mongoose.model('ONEHOUR', schema);