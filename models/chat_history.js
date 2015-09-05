/**
 * Created by hh on 15/6/23.
 */
var mongoose = require('./mongoose.js');
var chat_historySchema = new mongoose.Schema({
  from: String,
  to: String,
  total: {type: Number, default: 0}
}, {
  collection: 'Chat_histories'
});

var chat_historyModel = mongoose.model('Chat_history', chat_historySchema);

function Chat_history(chat_history) {
  this.from = chat_history.from;
  this.to = chat_history.to;
  this.total = chat_history.total;
}

Chat_history.prototype.save = function(callback) {
  var chat_history = {
    from: this.from,
    to: this.to,
    total: this.total
  };
  var newChat_history = new chat_historyModel(chat_history);
  newChat_history.save(function (err, chat_history) {
    if (err) {
      return callback(err);
    }
    callback(null, chat_history);
  });
};

Chat_history.query = function(from, to, callback) {
  chat_historyModel.findOne({from: from, to: to}, function(err, result){
    if (err) {
      return callback(err);
    }
    var total;
    if (result != undefined) {
      total = result.total;
    } else {
      total = 0;
    }
    callback(null, total)
  })
};

Chat_history.increase = function(from, to, addition) {
  console.log(from, to, addition)
  chat_historyModel.update({from: from, to: to}, {$inc: {total: addition}}, function(err){
    if (err) {
      return callback(err);
    }
  })
};

module.exports = Chat_history;