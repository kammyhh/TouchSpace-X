/**
 * Created by hh on 15/7/28.
 */
var mongoose = require('./mongoose.js');
var sixSchema = new mongoose.Schema({
  establish: String,
  target: {
    id: String,
    nickname: String,
    avatar: String,
    city: String
  },
  context: String,
  chain: Array,
  update_time: {type: Date, default: Date.now()},
  status: Number //0:passing 1:complete 2:expired
}, {
  collection: 'Sixes'
});

var sixModel = mongoose.model('Six', sixSchema);

function Six(six) {
  this.establish = six.establish;
  this.target = six.target;
  this.context = six.context;
  this.chain = six.chain;
  this.status = six.status;
}

Six.prototype.save = function(callback) {
  var six = {
    establish: this.establish,
    target: this.target,
    context: this.context,
    chain: this.chain,
    status: this.status
  };

  var newSix = new sixModel(six);

  newSix.save(function (err, six) {
    if (err) {
      return callback(err);
    }
    callback(null, six);
  });
};

Six.fetchAll = function(userId, callback) {
  sixModel.find({'chain.userId': userId}, function (err, sixes) {
    if (err) {
      return callback(err);
    }
    callback(null, sixes);
  })
};

Six.fetch = function(sixId, callback) {
  sixModel.findOne({_id: sixId}, function (err, six) {
    if (err) {
      return callback(err);
    }
    callback(null, six);
  })
};

Six.pass = function(sixId, chain, callback) {
  sixModel.update({_id: sixId}, {chain: chain,
    update_time: new Date(Date.now())}, function(err){
    if (err) {
      return callback(err);
    }
    callback(null);
  })
};

Six.complete = function(sixId, callback) {
  sixModel.update({_id: sixId}, {status: 1,
    update_time: new Date(Date.now())}, function(err){
    if (err) {
      return callback(err);
    }
    callback(null);
  })
};

Six.read = function(sixId, userId, callback) {
  Six.fetch(sixId, function (err, six) {
    if (err) {
      return callback(err);
    }
    var chain = six['chain'];
    sixModel.update({_id: sixId}, {chain: chain,
      update_time: new Date(Date.now())}, function (err) {
      if (err) {
        return callback(err);
      }
      for (var i = 0; i < chain.length; i++) {
        if (chain[i]['userId'] == userId) {
          chain[i]['isRead'] = 1;
        }
      }
      callback(null, chain);
    })
  })
};

Six.update = function(userId, userInfo, callback) {
  console.log('six.update')
  sixModel.find({'chain.userId': userId}, function (err, sixes) {
    if (err) {
      return callback(err);
    }
    for (var i=0;i<sixes.length;i++){
      var chain = [];
      chain[i] = sixes[i]['chain'];
      for (var j=0;j<chain[i].length;j++) {
        if (chain[i][j]['userId'] == userId){
          if (userInfo['device']!=null) {
            chain[i][j]['device'] = userInfo['device'];
          }
          if (userInfo['avatar']!=null) {
            chain[i][j]['avatar'] = userInfo['avatar'];
          }
          if (userInfo['nickname']!=null) {
            chain[i][j]['nickname'] = userInfo['nickname'];
          }
          if (userInfo['city']!=null) {
            chain[i][j]['city'] = userInfo['city'];
          }
        }
      }
      console.log(chain[i])
      console.log(sixes[i]['_id'])
      sixModel.update({_id: sixes[i]['_id']}, {chain: chain[i]}, function(err, res){
        if (err) {
          return callback(err);
        }
        console.log(res)
      });
      if (sixes[i]['target']['id']==userId) {
        sixModel.update({_id: sixes[i]['_id']}, {'target.city': userInfo['city']}, function(err, res){
          if (err) {
            return callback(err);
          }
          console.log(res)
        })
      }
    }
    callback()
  })
};

//10天过期
Six.expire = function(){
  sixModel.remove({update_time: {$lt: new Date(Date.now()) - 864000000}}, function(err, result){
    console.log(result);
  })
};

module.exports = Six;