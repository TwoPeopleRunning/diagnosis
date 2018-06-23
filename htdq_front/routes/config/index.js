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


exports.get('/factory_list', function (req, res, next) {

	res.render('config/factory_list', {});

});

exports.get('/group_list', function (req, res, next) {
	var id = req.query.id;
	res.render('config/group_list', { id: req.query.id });

});

exports.get('/jc_table', function (req, res, next) {
	var id = req.query.id;
	res.render('config/jc_table', { id: req.query.id });

});

exports.get('/jc_list', function (req, res, next) {
	// console.log(req.query.name);
	var http = require('http');
	var options = {
		host: config.FRONT.HOST,
		port: config.FRONT.PORT,
		path: '/api/MDC_MACHINETOOLS?MATOLNAME=' + encodeURIComponent(req.query.name),
		headers: {
			"x-access-token": req.cookies.Token
		}
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
				res.render('config/jc_list', { ID: "", MATOLNAME: "", MATOLCODE: "", MATOLTYPE: "", SYSTEMTYPE: "", MATOLIP: "", MATOLPORT: "", WORKER: "", PHONE: "", PERIOD: "" });
				return;
			}
			// res.render('mntinfo', data);
			res.render('config/jc_list', { ID: data.ID, MATOLNAME: data.MATOLNAME, MATOLCODE: data.MATOLCODE, MATOLTYPE: data.MATOLTYPE, SYSTEMTYPE: data.SYSTEMTYPE, MATOLIP: data.MATOLIP, MATOLPORT: data.MATOLPORT, WORKER: data.WORKER, PHONE: data.PHONE, PERIOD: data.PERIOD });

		});
	});
	req.end();
});
