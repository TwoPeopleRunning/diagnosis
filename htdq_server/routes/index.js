var express = require('express');
var router = express.Router();
var mixin = require('utils-merge');
var debug = require('debug')('htdq');
var db = require('../db/index');
var MDC_MACHINETOOLS = db.MDC_MACHINETOOLS;

var now = function () {
  return new Date();
};


/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {});
});



module.exports = router;

