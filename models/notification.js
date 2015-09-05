/**
 * Created by hh on 15/6/23.
 */
var mongoose = require('./mongoose.js');
var notificationSchema = new mongoose.Schema({
  id: {type: String, default: null},
  userId: String,
  type: String,
  notification: String,
  percent: {type: Number, default: 0}
}, {
  collection: 'Notifications'
});

var notificationModel = mongoose.model('Notification', notificationSchema);

function Notification(notification) {
  this.id = notification.id;
  this.userId = notification.userId;
  this.type = notification.type;
  this.notification = notification.notification;
  this.percent = notification.percent;
}

Notification.prototype.save = function(callback) {
  var notification = {
    id: this.id,
    userId: this.userId,
    type: this.type,
    notification: this.notification,
    percent: this.percent
  };
  var newNotification = new notificationModel(notification);
  newNotification.save(function (err, notification) {
    if (err) {
      return callback(err);
    }
    callback(null, notification);
  });
};

Notification.get = function(userId, callback) {
  notificationModel.find({userId: userId}, function(err, notifications){
    callback(null, notifications)
  })
};

Notification.clear = function(userId) {
  notificationModel.remove({userId: userId}, function(err) {
  })
};

module.exports = Notification;