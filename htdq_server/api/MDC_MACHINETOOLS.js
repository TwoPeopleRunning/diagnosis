/**
 * Dependencies
 */
var express = require('express');
var mixin = require('utils-merge');
var config = require('../config');

var db = require('../db/index');
var MDC_MACHINETOOLS = db.MDC_MACHINETOOLS;
var MDC_MTGROUP = db.MDC_MTGROUP;
/**`
 * Exports
 */
module.exports = exports = express.Router();

/**
 * Private variables and functions
 */

// MDC_MACHINETOOLS management  api/MDC_MACHINETOOLS
exports.route('/').get(function (req, res) {
    var limit = Number(req.query.limit) || config.page.limit;
    var skip = Number(req.query.skip) || 0;

    var condition = {};
    if (req.query.MATOLNAME) {
        condition.MATOLNAME = req.query.MATOLNAME;
    }
    if (req.query.ID) {
        condition.ID = { $in: req.query.ID.split(",") };
    }

    if (req.query.NODE) {
        // condition.TREENODEINFO = {};
        condition["TREENODEINFO.pId"] = req.query.NODE;
    }

    MDC_MACHINETOOLS.find(condition).select('-_id')
        .sort({ "ID": 1 }).exec(function (err, MDC_MACHINETOOLSs) {
            if (err) {
                res.send({
                    error: 'Get MDC_MACHINETOOLS list failed!'
                });
                return;
            }

            res.send(MDC_MACHINETOOLSs);
        });
});


exports.route('/Create').post(function (req, res) {
    if (!req.query.MATOLNAME) {
        res.send({
            error: 'MATOLNAME、MATOLTYPE、MATOLIP and MATOLPORT must be specified!'
        });
        return;
    }

    MDC_MACHINETOOLS.getNextID(function (err, ID) {
        if (err) {
            res.send({
                error: err
            });
            return;
        }

        var data = {
            ID: ID,
            MATOLNAME: req.query.MATOLNAME,
            MATOLTYPE: req.body.MATOLTYPE,
            MATOLIP: req.body.MATOLIP,
            MATOLPORT: req.body.MATOLPORT,
            MATOLGRPID: req.query.MATOLGRPID,
            DEPTID: req.body.DEPTID,
            COLSERVERID: req.body.COLSERVERID,
            MATOLCODE: req.body.MATOLCODE,
            INSTIME: req.body.INSTIME,
            EXPAND: req.body.EXPAND,
            ACTIVE: req.body.ACTIVE,
            SYSTEMTYPE: req.body.SYSTEMTYPE,
            WORKER: req.body.WORKER,
            PHONE: req.body.PHONE,
            PERIOD: req.body.PERIOD
        };

        (new MDC_MACHINETOOLS(data)).save(function (err, data) {
            if (err) {
                res.send({
                    error: 'Create MDC_MACHINETOOLS failed!'
                });
                return;
            }

            //console.log(data);
        });
    });
});

exports.route('/Update').post(function (req, res) {
    if (!req.body.NAME) {
        res.send({
            error: 'MACHINETOOLS NAME must be specified!'
        });
        return;
    }

    MDC_MACHINETOOLS.findOne({ 'MATOLNAME': req.query.NAME }).exec(function (err, data) {
        if (err) {
            res.send({
                error: err
            });
            return;
        }

        if (typeof req.body.TREENODEINFO == "string") {
            req.body.TREENODEINFO = JSON.parse(req.body.TREENODEINFO);
        }

        if (!data) {
            if (!req.body.NAME) {
                res.send({
                    error: 'MDC_MACHINETOOLS NAME must be specified!'
                });
                return;
            }
            // 绑定MDC_MTGROUP的MTGRPID与MDC_MACHINETOOLS的MATOLGRPID
            MDC_MTGROUP.findOne({ "TREENODEINFO.id": req.body.TREENODEINFO.pId }).exec(function (err, groupData) {
                if (err) {
                    res.send({
                        error: err
                    });
                    return;
                }
                //   var data = {
                //       ID: ID,
                //       MATOLGRPID: groupData.MTGRPID,
                //       MATOLNAME: req.body.NAME,
                //       TREENODEINFO: req.body.TREENODEINFO
                //   };
                //   (new MDC_MACHINETOOLS(data)).save(function(err, data) {
                //     if (err) {
                //         res.send({
                //             error: 'Create MDC_MACHINETOOLS failed!'
                //         });
                //         return;
                //     }
                //     res.send(data);
                //   });
                //   return;

                MDC_MACHINETOOLS.nameIsUni(req.body.NAME, function (err) {
                    if (err) {
                        res.send({
                            error: err
                        })
                        return;
                    }
                    MDC_MACHINETOOLS.getNextID(function (err, ID) {
                        if (err) {
                            res.send({
                                error: err
                            });
                            return;
                        }
                        var data = {
                            ID: ID,
                            MATOLGRPID: groupData.MTGRPID,
                            MATOLNAME: req.body.NAME,
                            TREENODEINFO: req.body.TREENODEINFO
                        };
                        (new MDC_MACHINETOOLS(data)).save(function (err, data) {
                            if (err) {
                                res.send({
                                    error: 'Create MDC_MACHINETOOLS failed!'
                                });
                                return;
                            }
                            res.send(data);
                        });
                        return;
                    });
                });
                return;
            });
            return;
        }

        // 更新数据
        if (req.body.TREENODEINFO) {
            mixin(data.TREENODEINFO, req.body.TREENODEINFO);
            req.body.TREENODEINFO = data.TREENODEINFO;
        }
        mixin(data, req.body);
        data.MATOLNAME = req.body.NAME;
        delete data.NAME;

        data.save(function (err, data) {
            if (err) {
                res.send({
                    error: 'Save datafailed!'
                });
                return;
            }

            res.send(data);
        });
    });
});

exports.route('/Destroy').post(function (req, res) {
    MDC_MACHINETOOLS.findOne({ 'MATOLNAME': req.body.NAME }).exec(function (err, data) {
        if (err || !data) {
            res.send({
                error: 'Data does not exist!'
            });
            return;
        }

        data.remove(function (err, data) {
            if (err) {
                res.send({
                    error: 'Delete data failed!'
                });
            }
            res.send(data);
        });
    });
});