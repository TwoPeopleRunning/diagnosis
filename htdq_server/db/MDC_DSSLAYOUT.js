/**
 * Dependencies
 */
var mongoose = require('mongoose');
/**
 * Private variables and functions
 */
var Schema = mongoose.Schema;

var getXRandomNum = function(){
    return Math.round(900 * Math.random());
};

var getYRandomNum = function(){
    return Math.round(400 * Math.random());
};

var lastID = 0;

/**
 * Exports
 */
var schema = new Schema({
    RECORDID: { type: String, default: "" },
    LAYOUTID: { type: Number },
    MTID: { type: Number, index: true },
    MTNAME: { type: String, index: true },
    XSERIES: { type: Number, default: getXRandomNum },
    YSERIES: { type: Number, default: getYRandomNum },
    WIDTH: { type: Number },
    HEIGHT: { type: Number },
    SRC: { type: String },
    IMG: { type: String }
}, { collection: "MDC_DSSLAYOUT" });


schema.static('getNextID', function(callback) {
    this.where({}).select('MTID').sort('-MTID').findOne(function(err, data) {
        if (err) {
            callback(err);
            return;
        }
        if (!data) {
            lastID = 1;
            callback(null, lastID);
            return;
        }

        lastID = data.id + 1;
        callback(null, lastID);
        return;
    });
});

module.exports = mongoose.model('MDC_DSSLAYOUT', schema);