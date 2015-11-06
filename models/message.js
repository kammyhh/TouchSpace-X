/**
 * Created by hh on 15/6/30.
 */
var mongoose = require('./mongoose.js');
var messageSchema = new mongoose.Schema({
  from: {
    userId: String,
    constellation: String,
    nickname: String
  },
  to: String,
  message: String,
  isRead: Number,
  date: {type: Date, default: Date.now()}
}, {
  collection: 'Messages'
});

var messageModel = mongoose.model('Message', messageSchema);

function Message(message) {
  this.from = message.from;
  this.to = message.to;
  this.message = message.message;
  this.isRead = message.isRead;
  this.date = message.date;
}

Message.prototype.save = function(callback) {
  var message = {
    from: this.from,
    to: this.to,
    message: this.message,
    isRead: this.isRead,
    date: this.date
  };

  var newMessage = new messageModel(message);

  newMessage.save(function (err, message) {
    if (err) {
      return callback(err);
    }
    callback(null, message)
  });
};

Message.receive = function(userId, callback) {
  messageModel.find({to: userId, isRead: 0}, {_id: 1, from: 1, message:1, date:1}, function(err, messages){
    if (err) {
      return callback(err);
    }
    callback(null, messages);
  }).sort({date: -1})
};

Message.history = function(userId, contactId,callback) {
  messageModel.find({
      $or: [{to: userId, 'from.userId': contactId},
        {to: contactId, 'from.userId': userId}]
    },
    {_id: 1, from: 1, message: 1, date: 1}, function (err, messages) {
      if (err) {
        return callback(err);
      }
      callback(null, messages);
    }).sort({date: -1}).limit(10)
};

Message.confirm = function(userId, msgIds, callback) {
  messageModel.update({to: userId, _id: {$in: msgIds}, isRead: 0}, {isRead: 1}, { multi: true }, function(err) {
    if (err) {
      return callback(err);
    }
    callback(null);
  })
};

Message.sendFromConstellation = function(constelllation, callback) {
  messageModel.count({'from.constellation': constelllation}, function(err, count){
    callback(null, count)
  })
};

Message.lastTime = function(userId, callback) {
  messageModel.find({to: userId}, {_id: 1, from: 1, date: 1}, function (err, messages) {
    if (err) {
      return callback(err);
    }
    var lastTime = [];
    for (var i = 0; i < messages.length; i++) {
      if (lastTime[messages[i]['from']['userId']] == undefined) {
        lastTime[messages[i]['from']['userId']] = messages[i]['date']
      } else if (lastTime[messages[i]['from']['userId']] < messages[i]['date']) {
        lastTime[messages[i]['from']['userId']] = messages[i]['date']
      }
    }
    callback(null, lastTime);
  }).sort({date: -1})
};

Message.lastOne = function(userId, contactId, callback) {
  messageModel.find(  {$or:[{to: userId, 'from.userId': contactId},
    {to: contactId, 'from.userId': userId}]}, {_id:0, message: 1, date: 1, from: 1}, function (err, messages) {
    if (err) {
      return callback(err);
    }
    callback(null,messages[0]);
  }).sort({date: -1})
};

Message.count = function(from, to, callback) {
  messageModel.count({to: to, 'from.userId': from}, function (err, count) {
    if (err) {
      return callback(err);
    }
    callback(null, count);
  }).sort({date: -1})
};

module.exports = Message;