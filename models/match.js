/**
 * Created by hh on 15/6/14.
 */
var mongoose = require('./mongoose.js');
var matchSchema = new mongoose.Schema({
  begin: String,
  end: String,
  value: Number,
  status: Number
}, {
  collection: 'Matchs'
});

var matchModel = mongoose.model('Match', matchSchema);

function Match(match) {
  this.begin = match.begin;
  this.end = match.end;
  this.value = match.value;
  this.status = match.status;
}

Match.prototype.save = function(callback) {
  var match = {
    begin: this.begin,
    end: this.end,
    value: this.value,
    status: this.status
  };

  var newMatch = new matchModel(match);

  newMatch.save(function (err, match) {
    if (err) {
      return callback(err);
    }
    callback(null, match);
  });
};

module.exports = Match;