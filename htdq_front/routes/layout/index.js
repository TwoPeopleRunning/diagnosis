var express = require('express');
var mixin = require('utils-merge');
var config = require('../../config');

module.exports = exports = express.Router();

exports.get('/', function (req, res, next) {
	var http = require('http');
	var options = {
		host: config.BACK.HOST,
		port: config.BACK.PORT,
		path: '/api/MDC_DSSLAYOUT',
		headers: {
			"x-access-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJOQU1FIjoiYWRtaW4iLCJVU0VSUEFTU1dPUkQiOiJhZG1pbiIsIklTQURNSU4iOjEsIkRFUEFSVE1FTlQiOiIiLCJpYXQiOjE1MTA4MjU3ODgsImV4cCI6MjQ1NjkwNTc4OH0.1GGLFOKbf9vOf8KURGLQUkXAecgT36Gh820mMDwHbpo",

		}
	};
	var req = http.request(options, function (resp) {
		resp.setEncoding('utf8');
		var body = '';
		resp.on('data', function (data) {
			body += data;
		});

		resp.on('end', function () {
			var data = JSON.parse(body);
			// res.send(data);
			if (!data) {
				res.send('Data not exist!');
				return;
			}
			res.render('layout/index', { data: data });

		});
	});
	req.end();
});

exports.get('/display', function (req, res, next) {
	var http = require('http');
	var options = {
		host: config.BACK.HOST,
		port: config.BACK.PORT,
		path: '/api/MDC_DSSLAYOUT',
		headers: {
			"x-access-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJOQU1FIjoiYWRtaW4iLCJVU0VSUEFTU1dPUkQiOiJhZG1pbiIsIklTQURNSU4iOjEsIkRFUEFSVE1FTlQiOiIiLCJpYXQiOjE1MTA4MjU3ODgsImV4cCI6MjQ1NjkwNTc4OH0.1GGLFOKbf9vOf8KURGLQUkXAecgT36Gh820mMDwHbpo",

		}
	};
	var req = http.request(options, function (resp) {
		resp.setEncoding('utf8');
		var body = '';
		resp.on('data', function (data) {
			body += data;
		});

		resp.on('end', function () {
			var data = JSON.parse(body);
			// res.send(data);
			if (!data) {
				res.send('Data not exist!');
				return;
			}
			res.render('layout/layoutview', { data: data });

		});
	});
	req.end();
});
