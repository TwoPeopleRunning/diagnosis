/**
 * Dependencies
 */
var mongoose = require('mongoose');
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
    ID: { type: Number, required: true, index: true },
    NAME: { type: String, required: true, default: "" },
    INSTIME: { type: Date, default: now },
    NOTE: { type: String, default: "" },
    TEL: { type: String, default: "" },
    ADDRESS: { type: String, default: "" },
    FAX: { type: String, default: "" },
    ZIPCODE: { type: String, default: "" },
    TREENODEINFO: {
        id: { type: Number },
        pId: { type: Number },
        name: { type: String }, 
        isParent: Boolean,
        open: Boolean,
        collection: { type: String }
    }
}, { collection: "MDC_FACTORY" });


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

module.exports = mongoose.model('MDC_FACTORY', schema);