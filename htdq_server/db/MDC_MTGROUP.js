/**
 * Dependencies
 */
var mongoose = require('mongoose');
var uuid = require('uuid');
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
  MTGRPID: { type: String, default: uuid.v4 },
  DEPTID: { type: String, default: uuid.v4 },
  NAME: { type: String, default: '', unique: true },
  INSTIME: { type: String, default: now },
  NOTE: { type: String, default: '' },
  TREENODEINFO: {
    id: { type: Number },
    pId: { type: Number },
    name: { type: String }, 
    isParent: Boolean,
    open: Boolean,
    collection: { type: String }
  }
},{collection:"MDC_MTGROUP"});


schema.static('nameIsUni', function (name, callback) {
  this.findOne({NAME: name},function(err, existData){
  	if(err || existData){
  		callback("MDC_GROUP name must be unique.");
  		return;
  	}
  	callback(null);
  });
});

schema.static('getNextID', function (callback) {
  if (lastID) {
    lastID = lastID + 1;
    if (! lastID) {
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

    if (! data) {
      // Starting with 1 instead of 0 makes more sense to non-programmer
      lastID = 1;
      callback(null, lastID);
      return;
    }

    lastID = data.ID + 1;
    if (! lastID) {
      callback('Not enough IDs available!');
      return;
    }
    callback(null, lastID);
    return;
  });
});

module.exports = mongoose.model('MDC_MTGROUP', schema);
