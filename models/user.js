/**
 * Created by hh on 15/6/14.
 */
var mongoose = require('./mongoose.js');
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
    constellation: String,
    tags: String,
    flag: Number
  },
  last_login:{
    ip: String,
    time: {type: Date, default: Date.now()}
  }
}, {
  collection: 'Users'
});

var userModel = mongoose.model('User', userSchema);

function User(user) {
  this.username = user.username;
  this.password = user.password;
  this.token = user.token;
  this.detail = user.detail;
  this.last_login = user.last_login;
}

User.prototype.save = function(callback) {
  var user = {
    username: this.username,
    password: this.password,
    token: this.token,
    detail: this.detail,
    last_login: this.last_login
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
  userModel.findOne({'detail.email': email}, function(err, user) {
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

User.setLogin = function(userId, token, ip, callback) {
  userModel.update({_id: userId}, {token: token, 'last_login.ip': ip,
    'last_login.time': Date.now()}, function(err, user) {
    if (err) {
      return callback(err);
    }
    callback(null, user);
  })
};

User.setAvatar = function(userId, avatar, callback) {
  userModel.update({_id: userId}, {'detail.avatar': avatar}, function(err, user) {
    if (err) {
      return callback(err);
    }
    callback(null, user);
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


module.exports = User;