/**
 * Created by hh on 15/8/17.
 */

var Chat_history = require('./../models/chat_history.js');
var User = require('./../models/user.js');
var Six = require('./../models/six.js');
var schedule = require('node-schedule');
//var rule = new schedule.RecurrenceRule();
//rule.second = 0;

//var times = 0, secs = [];
//for (var i=0;i<60;i++){
//  secs.push(i);
//}

//var c1 = schedule.scheduleJob({second: secs}, function() {
//  times++;
//  console.log(new Date(Date.now()).getMinutes(),new Date(Date.now()).getSeconds());
//  if (times > 60) {
//    c1.cancel();
//    Six.expire();
//  }
//});
var c2 = schedule.scheduleJob({second: 0}, function() {
  User.retrieveLeftChance();
});

var c3 = schedule.scheduleJob({second: 0}, function() {
  User.retrieveTimeLine();
});

//定期删除msgs， 记录收发条数
//var userId = '55d42aaa67e4c9aa04d204b4',
//  contactId = '55d42a9a67e4c9aa04d204b3';
//Chat_history.query(userId, contactId, function (err, ch) {
//  if (ch != 0) {
//    Chat_history.increase(userId, contactId, 10);
//  } else {
//    var newChat_history = new Chat_history({
//      from: userId,
//      to: contactId
//    });
//    newChat_history.save(function () {
//      Chat_history.increase(userId, contactId, 10);
//    });
//  }
//});
