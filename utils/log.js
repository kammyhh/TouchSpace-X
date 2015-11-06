/**
 * Created by hh on 15/8/19.
 */
var log4js = require('log4js');
log4js.configure({
  appenders: [
    { type: 'console' },{
      type: 'file',
      filename: './tsx-access.log',
      maxLogSize: 1024000,
      backups: 4,
      category: 'normal'
    },{
      type: 'file',
      filename: './tsx-error.log',
      maxLogSize: 1024000,
      backups: 4,
      category: 'error'
    }
  ],
  replaceConsole: true
});

var access_log = log4js.getLogger('normal');
access_log.setLevel('INFO');
var error_log = log4js.getLogger('error');
error_log.setLevel('INFO');

var getAccessLogger = function() {
  return access_log;
};
var getErrorLogger = function() {
  return error_log;
};

exports.accessLogger = getAccessLogger();
exports.errorLogger = getErrorLogger();
exports.logger = access_log;