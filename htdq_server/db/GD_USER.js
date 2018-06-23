/**
 * Dependencies
 */
var mongoose = require('mongoose');
var uuid = require('uuid');
var bcrypt = require('bcryptjs');
var hash = function (value) {
  return bcrypt.hashSync(value, 10);
};
var now = function () {
  return new Date();
};
/**
 * Private variables and functions
 */
var Schema = mongoose.Schema;
var lastID = 0;

/**
 * Exports
 */
var schema = new Schema({
  RECORDID: { type: String, default: uuid.v4 },
  USERACCOUNT: { type: String, set: hash },
  NAME: { type: String, unique: true },
  USERPASSWORD: { type: String, default: '' },
  EDITDATE: { type: Date, default: now },
  ISADMIN: { type: Number, default: 0 },
  IMAGEID: { type: String, default: '' },
  NOTE: { type: String, default: '' },
  DEPARTMENT: { type: String, default: '' },
  TREENODEINFO: {
    id: { type: Number },
    pId: { type: Number },
    name: { type: String },
    isParent: Boolean,
    open: Boolean,
    collection: { type: String }
  }
}, { collection: "GD_USER" });

schema.static('nameIsUni', function (name, callback) {
  this.findOne({ NAME: name }, function (err, existData) {
    if (err || existData) {
      callback("GD_USER name must be unique.");
      return;
    }
    callback(null);
  });
});

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

module.exports = mongoose.model('GD_USER', schema);
