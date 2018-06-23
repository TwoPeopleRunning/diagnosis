// var util = require('util');
/**
 * Dependencies
 */
var express = require('express');
var mixin = require('utils-merge');
var config = require('../config');

var db = require('../db/index');
var MDC_MDSTATUS = db.MDC_MDSTATUS;
var MDC_MACHINETOOLS = db.MDC_MACHINETOOLS;
var Caculate = db.Caculate;

/**
 * Exports
 */
module.exports = exports = express.Router();

/**
 * Private variables and functions
 */

// MDC_MDSTATUS management  api/MDC_MDSTATUS
exports.route('/').post(function (req, res) {
    var limit = Number(req.query.limit) || config.page.limit;
    var skip = Number(req.query.skip) || 0;

    var mtid = req.body.MTID;
    BEGINTIME = req.body.BEGINTIME;
    ENDTIME = req.body.ENDTIME;
    var condition = {
        "$or": [{
            "BEGINTIME": { "$gt": BEGINTIME },
            "ENDTIME": { "$lt": ENDTIME }
        }, {
            "BEGINTIME": { "$lt": BEGINTIME },
            "ENDTIME": { "$gt": BEGINTIME }
        }, {
            "BEGINTIME": { "$lt": ENDTIME },
            "ENDTIME": { "$gt": ENDTIME }
        }
        ]
    };
    // var condition = {
    //     "BEGINTIME": { "$gt": req.body.BEGINTIME },
    //     "ENDTIME": { "$lt": req.body.ENDTIME },
    // };
    // //console.log(typeof (mtid));
    if (mtid) {
        if (Array.isArray(mtid)) {
            condition["MTID"] = { $in: mtid };
        } else {
            condition["MTID"] = mtid;
        }
    }

    // //console.log(condition);
    MDC_MDSTATUS.find(condition).sort({ "BEGINTIME": 1 }).exec(function (err, MDC_MDSTATUSs) {
        if (err) {
            res.send(err);
            return;
        }
        res.send(MDC_MDSTATUSs);
    });
});


// exports.route('/').get(function (req, res) {

//   var condition = {};
//   MDC_MDSTATUS.find(condition)
//   .sort({"BEGINTIME":1}).exec(function (err, MDC_MDSTATUSs) {
//     if (err) {
//       res.send({
//         error: 'Get MDC_MDSTATUS list failed!'
//       });
//       return;
//     }
//     res.send(MDC_MDSTATUSs);
//   });
// });

exports.route('/Create').post(function (req, res) {
    if (Array.isArray(req.body)) {
        MDC_MDSTATUS.getNextID(function (err, ID) {
            if (err) {
                res.send({
                    error: err
                });
                return;
            }
            var data = [];
            for (var index = 0; index < req.body.length; index++) {
                var Onedata = req.body[index];
                if (!Onedata.MTID || !Onedata.STATUS ||
                    !Onedata.BEGINTIME || !Onedata.ENDTIME || !Onedata.DURATION) {
                    res.send({
                        error: 'MTID、STATUS、DURATION、BEGINTIME and ENDTIME must be specified!'
                    });
                    return;
                }
                data[index] = {
                    ID: ID + index,
                    MTID: Onedata.MTID,
                    STATUS: Onedata.STATUS,
                    BEGINTIME: Onedata.BEGINTIME,
                    ENDTIME: Onedata.ENDTIME,
                    DURATION: Onedata.DURATION,
                };
                (new MDC_MDSTATUS(data[index])).save(function (err, data) {
                    if (err) {
                        res.send({
                            error: 'Create MDC_MDSTATUS failed!'
                        });
                        return;
                    }
                });
            };
            res.send(data);
        });

    } else {
        if (!req.body.MTID || !req.body.STATUS ||
            !req.body.BEGINTIME || !req.body.ENDTIME || !req.body.DURATION) {
            res.send({
                error: 'MTID、STATUS、DURATION、BEGINTIME and ENDTIME must be specified!'
            });
            return;
        }

        MDC_MDSTATUS.getNextID(function (err, ID) {
            if (err) {
                res.send({
                    error: err
                });
                return;
            }

            var data = {
                ID: ID,
                MTID: req.body.MTID,
                STATUS: req.body.STATUS,
                BEGINTIME: req.body.BEGINTIME,
                ENDTIME: req.body.ENDTIME,
                DURATION: req.body.DURATION,
            };
            (new MDC_MDSTATUS(data)).save(function (err, data) {
                if (err) {
                    res.send({
                        error: 'Create MDC_MDSTATUS failed!'
                    });
                    return;
                }

                res.send(data);
            });
        });
    }

});

// exports.route('/BatchCreate').post(function (req, res) {
//     MDC_MDSTATUS.getNextID(function (err, ID) {
//         if (err) {
//             res.send({
//                 error: err
//             });
//             return;
//         }
//         var data = [];
//         for (var index = 0; index < req.body.length; index++) {
//             var Onedata = req.body[index];
//             if (!Onedata.MTID || !Onedata.STATUS ||
//                 !Onedata.BEGINTIME || !Onedata.ENDTIME || !Onedata.DURATION) {
//                 res.send({
//                     error: 'MTID、STATUS、DURATION、BEGINTIME and ENDTIME must be specified!'
//                 });
//                 return;
//             }
//             data[index] = {
//                 ID: ID + index,
//                 MTID: Onedata.MTID,
//                 STATUS: Onedata.STATUS,
//                 BEGINTIME: Onedata.BEGINTIME,
//                 ENDTIME: Onedata.ENDTIME,
//                 DURATION: Onedata.DURATION,
//             };
//             (new MDC_MDSTATUS(data[index])).save(function (err, data) {
//                 if (err) {
//                     res.send({
//                         error: 'Create MDC_MDSTATUS failed!'
//                     });
//                     return;
//                 }
//             });
//         };
//         res.send(data);
//     });
// });

var convertTime = function (date) {
    var timestamp = Date.parse(date);
    return timestamp / 1000;
};
// var Static = function (mtdata) {
//     length = mtdata.length;
//     Runtime = 0;
//     Onlinetime = 0;
//     Alarmtime = 0;
//     Offlinetime = 0;
//     Wholetime = convertTime(mtdata[length - 1].ENDTIME) - convertTime(mtdata[0].BEGINTIME)
//     // //console.log(Wholetime)
//     mtdata.forEach(function (onedata, index) {
//         if (mtdata[index].STATUS == "RUNNING") {
//             Runtime += mtdata[index]["DURATION"]
//         };
//         if (mtdata[index].STATUS == "ALARM") {
//             Alarmtime += mtdata[index]["DURATION"]
//         };
//         if (mtdata[index].STATUS == "ONLINE") {
//             Onlinetime += mtdata[index]["DURATION"]
//         };
//         if (mtdata[index].STATUS == "OFFLINE") {
//             Offlinetime += mtdata[index]["DURATION"]
//         };
//     });
//     Runtime = Runtime / 3600.0;
//     Onlinetime = Onlinetime / 3600.0;
//     Alarmtime = Alarmtime / 3600.0;
//     Wholetime = Wholetime / 3600.0;
//     Ontime = Wholetime - Offlinetime / 3600.0;
//     RunEff = Runtime / Wholetime;
//     // //console.log({ "MTID": mtdata[0].MTID, "RunTime": Runtime, "OnTime": Ontime, "RunEff": RunEff })
//     return { "MTID": mtdata[0].MTID, "RunTime": Runtime, "OnTime": Ontime, "RunEff": RunEff };
// };

// exports.route('/Caculate').post(function (req, res) {

// condition={"BEGINTIME":req.body.Begin,
//         "ENDTIME":req.body.End};
// var Result=[];
// var Obj = { "MTID": "", "MTNAME": "", "RunTime": "", "OnTime": "", "RunEff": "" };
// MDC_MACHINETOOLS.find().sort({"ID":1}).exec(function (err, tools) {
//   if (err) {
//     res.send({
//       error: 'Get MDC_MACHINETOOLS list failed!'
//     });
//     return;
//   }
//   Tools = tools;
//   // //console.log(Tools);
//   Tools.forEach(function (Mtool) {
//     var payload = {
//       'MTID': Mtool.ID,
//       "BEGINTIME":{"$gt":req.body.Begin},
//       "ENDTIME":{"$lt":req.body.End}
//     };
//     // //console.log(payload);
//     MDC_MDSTATUS.find(payload).sort({ "BEGINTIME": 1 }).exec(function (err, data) {
//       if (err) {
//         res.send({
//           error: 'Get MDC_MDSTATUS list failed!'
//         });
//         return;
//       }
//       // //console.log(data);
//       result = Static(data);
//       Obj.MTID = result.MTID;
//       Obj.MTNAME = Mtool.MATOLNAME;
//       Obj.RunTime = result.RunTime;
//       Obj.OnTime = result.OnTime;
//       Obj.RunEff = result.RunEff;
//       (new Caculate(Obj)).save(function (err, data) {
//         if (err) {
//           res.send({
//             error: 'Create MDC_MDSTATUS failed!'
//           });
//           return;
//         }
//       });
//     });
//   });
// });   
// });

// exports.route('/:ID').get(function (req, res) {
//    MDC_MDSTATUS.findOne({ 'ID': req.params.ID}).exec(function (err, data) {
//     if (err || ! data) {
//       res.send({
//         error: 'Data does not exist!'
//       });
//       return;
//     }

//     res.send(data);
//   });
// })
// exports.route('/Update').post(function (req, res) {
//     //console.log(req.body);
//   if (! req.body.MNTNAME || ! req.body.SVRNAME || 
//       ! req.body.SVRIP || ! req.body.SVRPORT) {
//     res.send({
//       error: 'MNTNAME、SVRNAME、SVRIP and SVRPORT must be specified!'
//     });
//     return;
//   }

//   MDC_MDSTATUS.findOne({ 'ID': req.body.ID}).exec(function (err, data) {
//     //console.log(req.body.ID);
//     if (err || ! data) {
//       res.send({
//         error: 'Data does not exist!'
//       });
//       return;
//     }

//     mixin(data,req.body);
//     data.save(function (err, data) {
//       if (err) {
//         res.send({
//           error: 'Save datafailed!'
//         });
//         return;
//       }

//       res.send(data);
//     });
//   });
// });

// exports.route('/Destroy').post(function (req, res) {
//   MDC_MDSTATUS.findOne({ 'ID': req.body.ID}).exec(function (err, data) {
//      if (err || ! data) {
//       res.send({
//         error: 'Data does not exist!'
//       });
//       return;
//     }

//     data.remove(function (err, data) {
//       if (err) {
//         res.send({
//           error: 'Delete data failed!'
//         });
//       }
//       res.send(data);
//     });
//   });
// });