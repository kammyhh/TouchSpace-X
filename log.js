/**
 * Created by hh on 15/8/19.
 */
var log4js = require('log4js');
log4js.configure({
  appenders: [
    { type: 'console' },{
      type: 'file',
      filename: __dirname + '/access.log',
      maxLogSize: 20480,
      backups:4,
      category: 'normal'
    }
  ],
  replaceConsole: true
});

var log = log4js.getLogger('normal');
log.setLevel('INFO');
var getLogger = function() {
  return log;
};
exports.logger = getLogger();