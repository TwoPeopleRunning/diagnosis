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
exports.get('/', function (req, res, next) {
	if (req.cookies.Token) {
		// console.log(req.signedCookies.user, req.signedCookies.passwd);
		res.render('manage/index', {});
	} else {
		res.redirect('/users/login');
		return;
	}
});


exports.get('/factory_list', function (req, res, next) {

	res.render('manage/factory_list', {});

});
exports.get('/factory_info', function (req, res, next) {
	var http = require('http');
	var options = {
		host: config.BACK.HOST,
		port: config.BACK.PORT,
		path: '/api/MDC_FACTORY?id=' + req.query.id
	};
	// console.log(req.query.name);
	var req = http.request(options, function (resp) {
		resp.setEncoding('utf8');
		var body = '';
		resp.on('data', function (data) {
			body += data;
		});

		resp.on('end', function () {
			// console.log(body);
			var data = JSON.parse(body);
			data = data[0];
			// res.send(data);
			if (!data) {
				res.render('manage/factory_info', { ID: "", NAME: "", TEL: "", ADDRESS: "", FAX: "", ZIPCODE: "", NOTE: "" });
				return;
			}
			// res.render('mntinfo', data);
			res.render('manage/factory_info', { ID: data.ID, NAME: data.NAME, TEL: data.TEL, ADDRESS: data.ADDRESS, FAX: data.FAX, ZIPCODE: data.ZIPCODE, NOTE: data.NOTE });

		});
	});
	req.end();
});

exports.get('/group_info', function (req, res, next) {
	var http = require('http');
	var options = {
		host: config.BACK.HOST,
		port: config.BACK.PORT,
		path: '/api/MDC_MTGROUP?id=' + req.query.id
	};
	// console.log(req.query.name);
	var req = http.request(options, function (resp) {
		resp.setEncoding('utf8');
		var body = '';
		resp.on('data', function (data) {
			body += data;
		});

		resp.on('end', function () {
			// console.log(body);
			var data = JSON.parse(body);
			data = data[0];
			// res.send(data);
			if (!data) {
				res.render('manage/group_info', { NAME: "", NOTE: "" });
				return;
			}
			// res.render('mntinfo', data);
			res.render('manage/group_info', { NAME: data.NAME, NOTE: data.NOTE });

		});
	});
	req.end();
});

exports.get('/jc', function (req, res, next) {
	res.render('manage/jc', { name: req.query.name });

});
exports.get('/mntinfo', function (req, res, next) {

	res.render('manage/mntinfo', data);
});

exports.get('/matain_info', function (req, res, next) {

	res.render('manage/matain_info', { ID: req.query.id });
});