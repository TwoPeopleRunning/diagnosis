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
  mtid: { type: Number, required: true },
  position: { type: String, required: true, default: "" },
  kind: { type: String, required: true, default: "" },
  serialNumber: {
    type: String, required: true, index: true, unique: true, validate: {
      validator: function (v) {
        return /^[0-9]{1,}_[0-9]{1,}$/.test(v)
      }, message: 'serialNumber is not a valid number like as "4421'
    }
  },
  // health:{type:Object,required:true,default:{}},
  good: { type: Number, required: true, default: 0 },
  innerProblem: { type: Number, required: true, default: 0 },
  outProblem: { type: Number, required: true, default: 0 },
  ballProblem: { type: Number, required: true, default: 0 },
  lastInspect: { type: Date, default: "" }
}, { collection: "MDC_BEARING" }, { _id: false });


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

module.exports = mongoose.model('MDC_BEARING', schema);
