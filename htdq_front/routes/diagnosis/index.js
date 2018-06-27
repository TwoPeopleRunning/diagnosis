/**
 * Dependencies
 */
var express = require('express');
// var config = require('../../config');


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
        res.render('diagnosis/index', {});
    } else {
        res.redirect('/users/login');
        return;
    }
});

exports.get('/config', function (req, res, next) {
    if (req.cookies.Token) {
        // console.log(req.signedCookies.user, req.signedCookies.passwd);
        // mtid = req.params.mtid;
        res.render('diagnosis/config', {});
    } else {
        res.redirect('/users/login');
        return;
    }
});

exports.get('/bearing', function (req, res, next) {
    if (req.cookies.Token) {
        // console.log(req.signedCookies.user, req.signedCookies.passwd);
        // mtid = req.params.mtid;
        res.render('diagnosis/bearing', {});
    } else {
        res.redirect('/users/login');
        return;
    }
});

exports.get('/inspect', function (req, res, next) {
    if (req.cookies.Token) {
        // console.log(req.signedCookies.user, req.signedCookies.passwd);
        // mtid = req.params.mtid;
        res.render('diagnosis/inspect', {});
    } else {
        res.redirect('/users/login');
        return;
    }
});

exports.get('/history', function (req, res, next) {
    if (req.cookies.Token) {
        // console.log(req.signedCookies.user, req.signedCookies.passwd);
        // mtid = req.params.mtid;
        res.render('diagnosis/history', {});
    } else {
        res.redirect('/users/login');
        return;
    }
});
// //概览
// exports.get('/outline/running_eff', function (req, res, next) {
//     if (req.cookies.Token) {
//         if (req.query.id && req.query.BEGINTIME && req.query.ENDTIME) {
//             res.render('diagnosis/outline/running_eff', { id: req.query.id, BEGINTIME: req.query.BEGINTIME, ENDTIME: req.query.ENDTIME });
//         } else {
//             res.render('diagnosis/outline/running_eff', {});
//         };
//         // console.log(req.signedCookies.user, req.signedCookies.passwd);

//     } else {
//         res.redirect('/users/login');
//         return;
//     }
// });
