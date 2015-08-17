/**
 * Created by hh on 15/8/17.
 */
var Six = require('./models/six.js');
var schedule = require('node-schedule');
//var rule = new schedule.RecurrenceRule();
//rule.second = 0;
var times = 0, secs = [];
for (var i=0;i<60;i++){
  secs.push(i);
}
//var test = schedule.scheduleJob({second: secs}, function() {
//  times++;
//  console.log('ahh!' + times);
//  if (times > 3) {
//    test.cancel();
//    Six.expire();
//  }
//});
//
