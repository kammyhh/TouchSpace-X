/**
 * Created by hh on 15/6/14.
 */
var mongoose = require('./mongoose.js');
var matchSchema = new mongoose.Schema({
  begin: String,
  end: String
}, {
  collection: 'Matchs'
});

var matchModel = mongoose.model('Match', matchSchema);

function Match(match) {
  this.matchname = match.matchname;
  this.password = match.password;
  this.detail = match.detail;
  this.energy = match.energy;
  this.constellation = match.constellation;
  this.tags = match.tags;
}

Match.prototype.save = function(callback) {
  var match = {
    matchname: this.matchname,
    password: this.password,
    detail: this.detail,
    energy: this.energy,
    constellation: this.constellation,
    tags: this. tags
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