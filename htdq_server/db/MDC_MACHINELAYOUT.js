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
    ID: { type: Number },
    IMG: { type: String },
    WIDTHS: { type: Number },
    HEIGHTS: { type: Number },
    SRC: { type: String },
    WORKPLACENAME: { type: String }
}, { collection: "MDC_MACHINELAYOUT" });


schema.static('getNextID', function(callback) {
    this.where({}).select('ID').sort('-ID').findOne(function(err, data) {
        if (err) {
            callback(err);
            return;
        }
        if (!data) {
            lastID = 1;
            callback(null, lastID);
            return;
        }

        lastID = data.ID + 1;
        callback(null, lastID);
        return;
    });
});

module.exports = mongoose.model('MDC_MACHINELAYOUT', schema);