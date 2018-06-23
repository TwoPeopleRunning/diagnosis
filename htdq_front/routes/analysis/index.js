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
exports.get('/', function(req, res, next) {
    if (req.cookies.Token) {
        // console.log(req.signedCookies.user, req.signedCookies.passwd);
        res.render('analysis/index', {});
    } else {
        res.redirect('/users/login');
        return;
    }
});
//概览
exports.get('/outline/running_eff', function(req, res, next) {
    if (req.cookies.Token) {
        if (req.query.id && req.query.BEGINTIME && req.query.ENDTIME) {
            res.render('analysis/outline/running_eff', { id: req.query.id, BEGINTIME: req.query.BEGINTIME, ENDTIME: req.query.ENDTIME });
        } else {
            res.render('analysis/outline/running_eff', {});
        };
        // console.log(req.signedCookies.user, req.signedCookies.passwd);

    } else {
        res.redirect('/users/login');
        return;
    }
});
exports.get('/outline/use_ratio', function(req, res, next) {
    if (req.cookies.Token) {
        // console.log(req.signedCookies.user, req.signedCookies.passwd);
        if (req.query.id && req.query.BEGINTIME && req.query.ENDTIME) {
            res.render('analysis/outline/use_ratio', { id: req.query.id, BEGINTIME: req.query.BEGINTIME, ENDTIME: req.query.ENDTIME });
        } else {
            res.render('analysis/outline/use_ratio', {});
        };
    } else {
        res.redirect('/users/login');
        return;
    }
});
exports.get('/outline/on_ratio', function(req, res, next) {
    if (req.cookies.Token) {
        // console.log(req.signedCookies.user, req.signedCookies.passwd);
        if (req.query.id && req.query.BEGINTIME && req.query.ENDTIME) {
            res.render('analysis/outline/on_ratio', { id: req.query.id, BEGINTIME: req.query.BEGINTIME, ENDTIME: req.query.ENDTIME });
        } else {
            res.render('analysis/outline/on_ratio', {});
        };
    } else {
        res.redirect('/users/login');
        return;
    }
});
// process_info 加工信息
exports.get('/process_info/process_info', function(req, res, next) {
    if (req.cookies.Token) {
        // console.log(req.signedCookies.user, req.signedCookies.passwd);
        if (req.query.id && req.query.BEGINTIME && req.query.ENDTIME) {
            res.render('analysis/process_info/process_info', { id: req.query.id, BEGINTIME: req.query.BEGINTIME, ENDTIME: req.query.ENDTIME });
        } else {
            res.render('analysis/process_info/process_info', {});
        };
    } else {
        res.redirect('/users/login');
        return;
    }
});
// alarm_info 报警信息
exports.get('/alarm_info/alarm_info', function(req, res, next) {
    if (req.cookies.Token) {
        // console.log(req.signedCookies.user, req.signedCookies.passwd);
        if (req.query.id && req.query.BEGINTIME && req.query.ENDTIME) {
            res.render('analysis/alarm_info/alarm_info', { id: req.query.id, BEGINTIME: req.query.BEGINTIME, ENDTIME: req.query.ENDTIME });
        } else {
            res.render('analysis/alarm_info/alarm_info', {});
        };
    } else {
        res.redirect('/users/login');
        return;
    }
});
// meta_analysis 综合分析
exports.get('/meta_analysis/meta_analysis', function(req, res, next) {
    if (req.cookies.Token) {
        // console.log(req.signedCookies.user, req.signedCookies.passwd);
        if (req.query.id && req.query.BEGINTIME && req.query.ENDTIME) {
            res.render('analysis/meta_analysis/meta_analysis', { id: req.query.id, BEGINTIME: req.query.BEGINTIME, ENDTIME: req.query.ENDTIME });
        } else {
            res.render('analysis/meta_analysis/meta_analysis', {});
        };
    } else {
        res.redirect('/users/login');
        return;
    }
});
// run_chart 走势图
exports.get('/run_chart/operation_rate', function(req, res, next) {
    if (req.cookies.Token) {
        // console.log(req.signedCookies.user, req.signedCookies.passwd);
        if (req.query.id && req.query.BEGINTIME && req.query.ENDTIME) {
            res.render('analysis/run_chart/operation_rate', { id: req.query.id, BEGINTIME: req.query.BEGINTIME, ENDTIME: req.query.ENDTIME });
        } else {
            res.render('analysis/run_chart/operation_rate', {});
        };
    } else {
        res.redirect('/users/login');
        return;
    }
});
exports.get('/run_chart/use_rate', function(req, res, next) {
    if (req.cookies.Token) {
        // console.log(req.signedCookies.user, req.signedCookies.passwd);
        if (req.query.id && req.query.BEGINTIME && req.query.ENDTIME) {
            res.render('analysis/run_chart/use_rate', { id: req.query.id, BEGINTIME: req.query.BEGINTIME, ENDTIME: req.query.ENDTIME });
        } else {
            res.render('analysis/run_chart/use_rate', {});
        };
    } else {
        res.redirect('/users/login');
        return;
    }
});
exports.get('/run_chart/on_rate', function(req, res, next) {
    if (req.cookies.Token) {
        // console.log(req.signedCookies.user, req.signedCookies.passwd);
        if (req.query.id && req.query.BEGINTIME && req.query.ENDTIME) {
            res.render('analysis/run_chart/on_rate', { id: req.query.id, BEGINTIME: req.query.BEGINTIME, ENDTIME: req.query.ENDTIME });
        } else {
            res.render('analysis/run_chart/on_rate', {});
        };
    } else {
        res.redirect('/users/login');
        return;
    }
});
// effct_analysis 效能分析
// 设备运行效率
exports.get('/effct_analysis/opert_efficiency', function(req, res, next) {
    if (req.cookies.Token) {
        // console.log(req.signedCookies.user, req.signedCookies.passwd);
        if (req.query.id && req.query.BEGINTIME && req.query.ENDTIME) {
            res.render('analysis/effct_analysis/opert_efficiency', { id: req.query.id, BEGINTIME: req.query.BEGINTIME, ENDTIME: req.query.ENDTIME });
        } else {
            res.render('analysis/effct_analysis/opert_efficiency', {});
        };
    } else {
        res.redirect('/users/login');
        return;
    }
});
// 设备总利用率
exports.get('/effct_analysis/utiliz_efficiency', function(req, res, next) {
    if (req.cookies.Token) {
        // console.log(req.signedCookies.user, req.signedCookies.passwd);
        if (req.query.id && req.query.BEGINTIME && req.query.ENDTIME) {
            res.render('analysis/effct_analysis/utiliz_efficiency', { id: req.query.id, BEGINTIME: req.query.BEGINTIME, ENDTIME: req.query.ENDTIME });
        } else {
            res.render('analysis/effct_analysis/utiliz_efficiency', {});
        };
    } else {
        res.redirect('/users/login');
        return;
    }
});
// 设备总开机率
exports.get('/effct_analysis/turnon_efficiency', function(req, res, next) {
    if (req.cookies.Token) {
        // console.log(req.signedCookies.user, req.signedCookies.passwd);
        if (req.query.id && req.query.BEGINTIME && req.query.ENDTIME) {
            res.render('analysis/effct_analysis/turnon_efficiency', { id: req.query.id, BEGINTIME: req.query.BEGINTIME, ENDTIME: req.query.ENDTIME });
        } else {
            res.render('analysis/effct_analysis/turnon_efficiency', {});
        };
    } else {
        res.redirect('/users/login');
        return;
    }
});
// 设备状态统计
exports.get('/effct_analysis/mnt_status', function(req, res, next) {
    if (req.cookies.Token) {
        // console.log(req.signedCookies.user, req.signedCookies.passwd);
        if (req.query.id && req.query.BEGINTIME && req.query.ENDTIME) {
            res.render('analysis/effct_analysis/mnt_status', { id: req.query.id, BEGINTIME: req.query.BEGINTIME, ENDTIME: req.query.ENDTIME });
        } else {
            res.render('analysis/effct_analysis/mnt_status', {});
        };
    } else {
        res.redirect('/users/login');
        return;
    }
});

exports.get('/effct_analysis/status_static/pipe_display', function(req, res, next) {
    if (req.cookies.Token) {
        // console.log(req.signedCookies.user, req.signedCookies.passwd);
        res.render('analysis/effct_analysis/status_static/pipe_display', {});
    } else {
        res.redirect('/users/login');
        return;
    }
});

exports.get('/effct_analysis/status_static/day_bar', function(req, res, next) {
    if (req.cookies.Token) {
        // console.log(req.signedCookies.user, req.signedCookies.passwd);
        res.render('analysis/effct_analysis/status_static/day_bar', {});
    } else {
        res.redirect('/users/login');
        return;
    }
});

// test perf_analysis
exports.get('/effct_analysis/perf_analysis', function(req, res, next) {
    if (req.cookies.Token) {
        // console.log(req.signedCookies.user, req.signedCookies.passwd);
        res.render('analysis/effct_analysis/perf_analysis', {});
    } else {
        res.redirect('/users/login');
        return;
    }
});