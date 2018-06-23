/**
 * Dependencies
 */
var mongoose = require('mongoose');

/**
 * Private variables and functions
 */
var Schema = mongoose.Schema;

/**
 * Exports
 */
var schema = new Schema({
    MTID: { type: Array, default: "" },
    CONTENT: { type: Array, default: "" },
    EB: { type: String, default: "" },
    LAYOUT: { type: String, default: "" },
    TIMESETTING: { type: Number, default: "" },
    DISPLAYPERCENT: { type: String, default: "" },
    BEGINTIME: { type: Date, default: "" },
    ENDTIME: { type: Date, default: "" },
    NODEID: { type: Array, default: "" },
    MTID: { type: Array, default: "" }
}, { collection: "PPTCONFIG" });



module.exports = mongoose.model('PPTCONFIG', schema);