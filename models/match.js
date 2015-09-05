/**
 * Created by hh on 15/6/14.
 */
var mongoose = require('./mongoose.js');
var Utils = require('../utils.js');
var matchSchema = new mongoose.Schema({
  begin: String,
  end: String,
  value: Number,
  time: {type: Date, default: Date.now()},
  status: Number //0：初始，1：begin接受，2：end接受，3：完成，4：过期，5：拒绝
}, {
  collection: 'Matchs'
});

var matchModel = mongoose.model('Match', matchSchema);

function Match(match) {
  this.begin = match.begin;
  this.end = match.end;
  this.value = match.value;
  this.time = match.time;
  this.status = match.status;
}

Match.prototype.save = function(callback) {
  var match = {
    begin: this.begin,
    end: this.end,
    value: this.value,
    time: this.time,
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

Match.accept = function(matchId, userId, callback) {
  console.log(matchId, userId)
  matchModel.findOne({_id: matchId}, function (err, match) {
    console.log(match)
    if (err) {
      return callback(err);
    }
    var status = match['status'],
      begin = match['begin'],
      end = match['end'],
      targetId;
    if (userId == begin) {
      targetId = end;
    }
    if (userId == end) {
      targetId = begin;
    }
    if ((userId == begin) && (Utils.if_contains([0, 2], status))) {
      status += 1;
    }
    if ((userId == end) && (Utils.if_contains([0, 1], status)))  {
      status += 2;
      targetId = begin;
    }
    matchModel.update({_id: matchId}, {status: status}, function (err) {
      if (err) {
        return callback(err);
      }
      callback(null, targetId, status);
    })
  })
};

Match.reject = function(matchId, deviceId, callback) {
  matchModel.findOne({_id: matchId}, function (err, match) {
    if (err) {
      return callback(err);
    }
    var status = match['status'],
      begin = match['begin'],
      end = match['end'];
    var targetId;
    if (deviceId == begin) {
      targetId = end;
    }
    if (deviceId == end)   {
      targetId = begin;
    }
    matchModel.update({_id: matchId}, {status: 5}, function (err) {
      if (err) {
        return callback(err);
      }
      callback(null, targetId, 5);
    })
  })
};

module.exports = Match;