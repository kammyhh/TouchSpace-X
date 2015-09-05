/**
 * Created by hh on 15/6/23.
 */
var mongoose = require('./mongoose.js');
var star_historySchema = new mongoose.Schema({
  from: String,
  to: String,
  time: Date
}, {
  collection: 'Star_histories'
});

var star_historyModel = mongoose.model('Star_history', star_historySchema);

function Star_history(star_history) {
  this.from = star_history.from;
  this.to = star_history.to;
  this.time = star_history.time;
}

Star_history.prototype.save = function(callback) {
  var star_history = {
    from: this.from,
    to: this.to,
    time: this.time
  };
  var newStar_history = new star_historyModel(star_history);
  newStar_history.save(function (err, star_history) {
    if (err) {
      return callback(err);
    }
    callback(null, star_history);
  });
};

Star_history.count = function(from, to, callback) {
  star_historyModel.count({from: from, to: to}, function(err,  count){
    if (err) {
      return callback(err);
    }
    callback(null, count)
  })
};

module.exports = Star_history;