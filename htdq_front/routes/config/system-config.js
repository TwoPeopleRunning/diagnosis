/**
 * Dependencies
 */
var express = require('express');
var mixin = require('utils-merge');
var config = require('../../config');


/**
 * Exports
 */
module.exports = exports = express.Router();

/**
 * Private variables and functions
 */
exports.get('/', function (req, res, next) {


	res.render('analysis/system-config', { name: req.query.name });

});