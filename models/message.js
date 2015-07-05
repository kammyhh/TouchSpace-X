/**
 * Created by hh on 15/6/30.
 */
var mongoose = require('./mongoose.js');
var messageSchema = new mongoose.Schema({
  from: {
    username: String,
    constellation: String
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

Message.receive = function(username, callback) {
  messageModel.find({to: username, isRead: 0}, {_id: 0, from: 1, message:1, date:1}, function(err, messages){
    if (err) {
      return callback(err);
    }
    callback(null, messages);
    messageModel.update({to: username, isRead: 0}, {isRead: 1}, { multi: true }, function(err) {
      if (err) {
        return callback(err);
      }
    })
  })
};

Message.sendFromConstellation = function(constelllation, callback) {
  messageModel.count({'from.constellation': constelllation}, function(err, count){
    callback(null, count)
  })
}

module.exports = Message;