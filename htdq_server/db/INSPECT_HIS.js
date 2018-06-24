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
  id: { type: Number, required: true },
  serialNumber: { type: String, required: true },
  // health:{type:Object,required:true,default:{}},
  good: { type: Number, required: true, default: 0 },
  innerProblem: { type: Number, required: true, default: 0 },
  outProblem: { type: Number, required: true, default: 0 },
  ballProblem: { type: Number, required: true, default: 0 },
  lastInspect: { type: Date, default: new Date() }
}, { collection: "INSPECT_HIS" });


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

module.exports = mongoose.model('INSPECT_HIS', schema);
