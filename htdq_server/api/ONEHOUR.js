
/**
 * Dependencies
 */
var express = require('express');
var mixin = require('utils-merge');
var config = require('../config');

var db = require('../db/index');
var ONEHOUR = db.ONEHOUR;
var MDC_MACHINETOOLS = db.MDC_MACHINETOOLS;

/**`
 * Exports
 */
module.exports = exports = express.Router();

// /**
//  * Private variables and functions
//  */
// setInterval(function () {
//     now = new Date();
//     if (now.getTime() % 10000 == 0) {
//         console.log(now)
//         // SaveOneHour(now)
//     }
// }, 1000)


// SaveOneHour = function (now) {
//     year = now.getYear();
//     month = now.getMonth();
//     day = now.getDay();
//     hour = now.getHours();
//     label = String(year) + '-' + String(month) + '-' + String(day) + '-' + String(hour);

// }
// ONEHOUR management  api/ONEHOUR
exports.route('/').post(function (req, res) {
    BEGINTIME = req.body.BEGINTIME
    ENDTIME = req.body.ENDTIME
    if (!BEGINTIME || !ENDTIME) {
        res.send({
            'error': 'BEGINTIME and ENDTIME must be specified'
        })
    }
    BEGINTIME = Math.ceil(new Date(BEGINTIME).getTime() / 600000)
    ENDTIME = Math.floor(new Date(ENDTIME).getTime() / 600000)
    var condition = {
        'LABEL': {
            '$gte': BEGINTIME,
            '$lte': ENDTIME
        }
    };

    ONEHOUR.find(condition).exec(function (err, ONEHOURs) {
        if (err) {
            res.send({
                error: 'Get ONEHOUR list failed!'
            });
            return;
        }
        if (ONEHOURs.length == 0) {
            res.send({
                error: 'there is not exsit data'
            });
            return;
        }
        var toArray = new Array()
        var count = 0
        ONEHOURs.forEach(function (obj, index) {
            toArray = merge(toArray, obj.RESULT)
            count += 1
            if (count == ONEHOURs.length) {
                res.send(toArray)
            }
        });
    });
})

function merge(array1, array2) {
    if (array1 == null || array1.length == 0) {
        return array2;
    }
    if (array2 == null || array2.length == 0) {
        return array1;
    }
    if (array1.length != array2.length) {
        return { 'error': 'The length of Array1 and Array2 must be same' }
    }
    len = array1.length
    result = new Array(len)
    var index = 0
    while (index < array1.length) {
        // console.log(typeof (array1[index]))
        if (typeof (array1[index]) == 'object') {
            array1[index] = merge(array1[index], array2[index])
        }
        if (typeof (array1[index]) == 'number') {
            array1[index] = array1[index] + array2[index]
        }
        index += 1;
    }
    return array1
    // console.log(result)
}
