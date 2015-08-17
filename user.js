/**
 * Created by hh on 15/6/14.
 */
var mongoose = require('./mongoose.js');
var Deck = require('./deck.js');
var Utils = require('../utils.js');
var userSchema = new mongoose.Schema({
  username: String,
  password: String,
  token: String,
  detail: {
    inviter: String,
    nickname: String,
    birthday: {type: Date, default: Date.now()},
    gender: Number,
    phone: String,
    email: String,
    avatar: String,
    life_card: String,
    guard_card: String,
    energy: Number,
    experience: Number,
    balance: Number,
    constellation: String,
    tags: String,
    flag: Number
  },
  purchased_music: Array,
  contact: Array,
  stranger: Array,
  last_login: {
    ip: String,
    x: Number,
    y: Number,
    z: Number,
    time: Date,
    alive_time: Date,
    device: {type: String, default: '1'},
  },
  time_line: Array,
  left_chance: Number,
  online_duration: Number
}, {
  collection: 'Users'
});

var userModel = mongoose.model('User', userSchema);

function User(user) {
  this.username = user.username;
  this.password = user.password;
  this.token = user.token;
  this.detail = user.detail;
  this.purchased_music = user.purchased_music;
  this.contact = user.contact;
  this.stranger = user.stranger;
  this.last_login = user.last_login;
  this.time_line = user.time_line;
  this.left_chance = user.left_chance;
  this.online_duration = user.online_duration;
}

User.prototype.save = function(callback) {
  var user = {
    username: this.username,
    password: this.password,
    token: this.token,
    detail: this.detail,
    purchased_music: this.purchased_music,
    contact: this.contact,
    stranger: this.stranger,
    last_login: this.last_login,
    time_line: this.time_line,
    left_chance: this.left_chance,
    online_duration: this.online_duration
  };

  var newUser = new userModel(user);

  newUser.save(function (err, user) {
    if (err) {
      return callback(err);
    }
    callback(null, user);
  });
};

User.checkEmail = function(email, callback){
  if ((email==undefined)||(email=='')) {
    callback(null)
  } else {
    userModel.findOne({'detail.email': email}, function (err, user) {
      if (err) {
        return callback(err);
      }
      callback(null, user);
    })
  }
};

User.checkPhone = function(phone, callback){
  userModel.findOne({'detail.phone': phone}, function(err, user) {
    if (err) {
      return callback(err);
    }
    callback(null, user);
  })
};

User.checkNick = function(nickname, callback){
  userModel.findOne({'detail.nickname': nickname}, function(err, user) {
    if (err) {
      return callback(err);
    }
    callback(null, user);
  })
};

User.login = function(username, password, callback) {
  var condition = {
    $and: [
      {password: password},
      {$or: [
        {username: username},
        {'detail.phone': username},
        {'detail.email': username}
      ]}
    ]};
  userModel.findOne(condition, function(err, user) {
    if (err) {
      return callback(err);
    }
    callback(null, user);
  })
};

User.setLogin = function(userId, last_login, callback) {
  userModel.update({'last_login.device': last_login['last_login.device']}, {'last_login.device': "1"}, function(err){
    if (err) {
      return callback(err);
    }
    userModel.update({_id: userId}, last_login, function(err, result) {
      if (err) {
        return callback(err);
      }
      callback(null, result);
    })
  })
};

User.verifyInterval = function(userId, last_login, callback) {
  userModel.update({_id: userId}, last_login, function (err, result) {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  })
};

User.alive = function(userId, callback) {
  userModel.update({_id: userId}, {'last_login.alive_time': Date.now()}, function(err) {
    if (err) {
      return callback(err);
    }
    callback(null);
  })
};

User.setAvatar = function(userId, avatar, callback) {
  userModel.update({_id: userId}, {'detail.avatar': avatar}, function(err, result) {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  })
};

User.setStranger = function(userId, strangers, callback) {
  userModel.update({_id: userId}, {stranger: strangers}, function(err, result) {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  })
};

User.setContact = function(userId, contact, callback) {
  userModel.update({_id: userId}, {'contact': contact}, function(err, result) {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  })
};

User.purchaseMusic = function(userId, purchased, callback) {
  userModel.update({_id: userId}, {'purchased_music': purchased}, function(err, result) {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  })
};

User.auth = function(userId, token, callback) {
  userModel.findOne({_id: userId, token: token}, function(err, user) {
    if (err) {
      return callback(err);
    }
    callback(null, user);
  })
};

User.info = function(userId, callback) {
  userModel.findOne({_id: userId}, function(err, user) {
    if (err) {
      return callback(err);
    }
    callback(null, user);
  })
};

User.countName = function(pre, callback){
  userModel.count({username: { $regex: pre}}, function(err, count) {
    if (err) {
      return callback(err);
    }
    callback(null, count);
  })
};

User.countConstellation = function(constellation, callback){
  userModel.count({'detail.constellation': constellation}, function(err, count) {
    if (err) {
      return callback(err);
    }
    callback(null, count);
  })
};

User.countActiveInConstellation = function(constellation, callback){
  userModel.count({'last_login.time': {$gt:Date.now()-86400000}, 'detail.constellation': constellation}, function(err, count) {
    if (err) {
      return callback(err);
    }
    callback(null, count);
  })
};

User.rankInConstellation = function(userId, constellation, callback){
  User.info(userId, function(err, user){
    if (err) {
      return callback(err);
    }
    userModel.count({'detail.energy': {$gt:user['detail']['energy']}, 'detail.constellation': constellation}, function(err, count) {
      if (err) {
        return callback(err);
      }
      callback(null, count+1);
    })
  });
};

User.brightestInConstellation = function(constellation, callback){
  userModel.find({'detail.constellation': constellation}).sort({'detail.energy': -1}).exec(function(err, sort) {
    callback(null, sort[0])
  });
};

User.countGenderInConstellation = function(gender, constellation, callback){
  userModel.count({'detail.constellation': constellation, 'detail.gender': gender}, function(err, count) {
    if (err) {
      return callback(err);
    }
    callback(null, count);
  })
};

User.get_all = function(callback) {
  var results = [];
  userModel.find({left_chance: {$gt: 0}}, function (err, users) {
    if (err) {
      return callback(err);
    }
    if (users.length >= 2) {
      var form = function (callback) {
        users.forEach(function (user) {
          Deck.getOne(user['detail']['life_card'],
            Utils.get_age(user['detail']['birthday'], Date.now()), function (err, deck) {
              callback(user, deck)
            })
        })
      };
      var send = function (callback) {
        form(function (user, deck) {
          var result = {
            _id: user['_id'],
            username: user['username'],
            last_login: user['last_login'],
            stranger: user['stranger'],
            contact: user['contact'],
            detail: user['detail'],
            left_chance: user['left_chance'],
            deck: deck['cards']
          };
          results.push(result);
          callback(results)
        })
      };
      send(function (results) {
        if (results.length == users.length) {
          callback(results)
        }
      });
    } else {
      callback({})
    }
  })
};

User.addExp = function(userId, addition, callback) {
  userModel.findOne({_id: userId}, function(err, user) {
    if (err) {
      return callback(err);
    }
    var experience = user['detail']['experience'] + addition;
    userModel.update({_id: userId}, {'detail.experience': experience}, function(err){
      if (err) {
        return callback(err);
      }
      callback(null, experience)
    })
  })
};

User.incChance = function(userId, inc, callback) {
  userModel.update({_id: userId}, {$inc: {left_chance: inc}}, function (err) {
    if (err) {
      return callback(err);
    }
    callback(null)
  })
};

User.addTimeLine = function(userId, time_line, callback) {
  userModel.findOne({_id: userId}, function(err, user){
    if (err) {
      return callback(err);
    }
    console.log(userId, user)
    var origin = user['time_line'];
    origin[origin.length] = time_line;
    userModel.update({_id: userId}, {time_line: origin}, function (err) {
      if (err) {
        return callback(err);
      }
      callback(null)
    })
  })
};

User.modify = function(userId, detail, callback) {
  console.log(detail);
  userModel.update({_id: userId}, {detail: detail}, function(err){
    if (err) {
      return callback(err);
    }
    callback(null)
  });
};

User.contactList = function(userId, callback) {
  userModel.findOne({_id: userId}, function (err, user) {
    if (err) {
      return callback(err);
    }
    userModel.find({
        $or: [{'detail.phone': {$in: user['contact']}},
          {_id: {$in: user['stranger']}}]
      },
      {'detail.nickname': 1,
      'detail.avatar':1}, function (err, list) {
        if (err) {
          return callback(err);
        }
        console.log(list);
        callback(null, list)
      })
  })
};

module.exports = User;