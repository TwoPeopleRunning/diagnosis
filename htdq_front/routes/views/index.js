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
	res.render('views/index', { name: req.query.name,BACK:config.BACK});

});

exports.get('/status', function (req, res, next) {
	res.render('views/status',  { ID: req.query.ID,BACK:config.BACK});
});

exports.get('/detail', function (req, res, next) {
	var IDs = req.query.ID.split(",");
	res.render('views/detail',  { ID: IDs[0],BACK:config.BACK});
});