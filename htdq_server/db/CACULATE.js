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
    ID: { type: Number, require: true },
    MONTHLABLE: { type: String, require: true },
    RUNRATIO: { type: Number, require: true },
    USERATIO: { type: Number, require: true },
    ONRATIO: { type: Number, require: true },
}, { collection: "CACULATE" });




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

module.exports = mongoose.model('CACULATE', schema);