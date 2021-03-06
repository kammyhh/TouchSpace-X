var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multipart = require('connect-multiparty');
var index = require('./routes/index');
var api = require('./routes/api');
var cron = require('./utils/cron.js');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(multipart());
app.use('/', index);
app.use('/api', api);

//var log4js = require('log4js');
//log4js.configure({
//  appenders: [
//    { type: 'console' },{
//      type: 'file',
//      filename: './tsx-access.log',
//      maxLogSize: 20480,
//      backups: 4,
//      category: 'normal'
//    }
//  ],
//  replaceConsole: true
//});
//var accessLogger = log4js.getLogger('normal');
//accessLogger.setLevel('INFO');
//app.use(log4js.connectLogger(accessLogger, {level:log4js.levels.INFO}));
//app.use(express.Router());


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user.js
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
