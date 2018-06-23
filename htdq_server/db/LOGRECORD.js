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
    //LOGRECORD参数
    ID: { type: Number, required: true },
    TYPE: { type: String, required: true },
    TIME: { type: Date, required: true },
    IP: { type: String, required: true },
    USER: { type: String, required: true },

}, { collection: "LOGRECORD" });


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

module.exports = mongoose.model('LOGRECORD', schema);