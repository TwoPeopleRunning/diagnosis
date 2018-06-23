/**
 * Dependencies
 */
var express = require('express');
var mixin = require('utils-merge');
var config = require('../../config');
var http = require('http');

/**
 * Exports
 */
module.exports = exports = express.Router();

/**
 * Private variables and functions
 */

exports.get('/about', function (req, res, next) {

	res.render('help/about', {});
});