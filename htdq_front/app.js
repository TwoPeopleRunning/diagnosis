var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
// var users = require('./routes/users');
var proxy = require('http-proxy-middleware');
var app = express();
var config = require('./config');

var apiProxy = proxy('/api', {
    target: 'http://' + (process.env.HTDQ_BACK || (config.BACK.HOST + ':' + config.BACK.PORT) || '127.0.0.1:9988'), changeOrigin: true,
})
app.use('/api', apiProxy);
// app.use('/api', proxy({target: 'http://127.0.0.1:9988', changeOrigin: true}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');
app.set('view engine', 'ejs');
// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public/images', 'favicon.png')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser("htdq"));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname + '/bower_components'));


app.use('/', routes);
// app.use('/users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500).end();
        // res.render('error', {
        //     message: err.message,
        //     error: err
        // });
    });
}

// app.all('*', function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "X-Requested-With");
//     res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
//     res.header("X-Powered-By",' 3.2.1')
//     res.header("Content-Type", "application/json;charset=utf-8");
//     next();
// });

// app.all('/', function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
//     res.header("Access-Control-Allow-Headers", "X-Requested-With");
//     res.header('Access-Control-Allow-Headers', 'Content-Type');
//     next();
// });

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {

    res.status(err.status || 500).end();
    // res.status(err.status || 500);
    // res.render('error', {
    //   message: err.message,
    //   error: {}
    // });
});

// app.use(function errorHandler(err, req, res, next) {
//     console.log(err)
//     // res.status(500);
//     // res.render('error', { error: err });
// })


module.exports = app;