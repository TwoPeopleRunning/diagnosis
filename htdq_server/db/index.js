/**
 * Dependencies
 */
var mongoose = require('mongoose');
var MDC_MNT = require('./MDC_MNT');
var MDC_SYSVR = require('./MDC_SYSVR');
var MDC_MACHINETOOLS = require('./MDC_MACHINETOOLS');
var MDC_DSSEXPRESSIONS = require('./MDC_DSSEXPRESSIONS');
var MDC_MDALARMDATA = require('./MDC_MDALARMDATA');
var GD_DEPARTMENT = require('./GD_DEPARTMENT');
var GD_ROLE = require('./GD_ROLE');
var GD_USER = require('./GD_USER');
var GD_RELA_FILE = require('./GD_RELA_FILE');
var GD_RELA_USERTODEPART = require('./GD_RELA_USERTODEPART');
var GD_RELA_USERTOROLE = require('./GD_RELA_USERTOROLE');
var MDC_MTGROUP = require('./MDC_MTGROUP');
var MDC_MDSTATUS = require('./MDC_MDSTATUS');
var HS_MAINTAIN = require('./HS_MAINTAIN');
var CACULATE = require('./CACULATE');
var PPTCONFIG = require('./PPTCONFIG');
var LOGRECORD = require('./LOGRECORD');
var ONEHOUR = require('./ONEHOUR');
// var ADD = require('./ADD');
/**
 * Exports
 */
var MDC_FACTORY = require('./MDC_FACTORY');
var MDC_DSSLAYOUT = require('./MDC_DSSLAYOUT');
var MDC_MACHINELAYOUT = require('./MDC_MACHINELAYOUT');
// var ADD = require('./ADD');
/**
 * Exports
 */
// var ADD = require('./ADD');
/**
 * Exports
 */
module.exports = exports = mongoose;


/**
 * ADD db模型
 */
exports.MDC_MNT = MDC_MNT;
exports.MDC_SYSVR = MDC_SYSVR;
exports.MDC_MACHINETOOLS = MDC_MACHINETOOLS;
exports.MDC_DSSEXPRESSIONS = MDC_DSSEXPRESSIONS;
exports.MDC_MDALARMDATA = MDC_MDALARMDATA;
exports.GD_DEPARTMENT = GD_DEPARTMENT;
exports.GD_ROLE = GD_ROLE;
exports.GD_USER = GD_USER;
exports.GD_RELA_FILE = GD_RELA_FILE;
exports.GD_RELA_USERTODEPART = GD_RELA_USERTODEPART;
exports.GD_RELA_USERTOROLE = GD_RELA_USERTOROLE;
exports.MDC_MTGROUP = MDC_MTGROUP;
exports.MDC_MDSTATUS = MDC_MDSTATUS;
exports.HS_MAINTAIN = HS_MAINTAIN;
exports.CACULATE = CACULATE;
exports.PPTCONFIG = PPTCONFIG;
exports.MDC_FACTORY = MDC_FACTORY;
exports.MDC_DSSLAYOUT = MDC_DSSLAYOUT;
exports.MDC_MACHINELAYOUT = MDC_MACHINELAYOUT;
exports.LOGRECORD = LOGRECORD;
exports.ONEHOUR = ONEHOUR;
// exports.ADD = ADD;