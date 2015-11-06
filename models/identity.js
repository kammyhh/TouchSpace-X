/**
 * Created by hh on 15/7/28.
 */
var mongoose = require('./mongoose.js');
var Value = require('../utils/value.js');
var identitySchema = new mongoose.Schema({
  code: String,
  phone: String,
  time: Date
}, {
  collection: 'Identitys'
});

var identityModel = mongoose.model('Identity', identitySchema);

function Identity(identity) {
  this.code = identity.code;
  this.phone = identity.phone;
  this.time = identity.time;
}

Identity.prototype.save = function(callback) {
  var identity = {
    code: this.code,
    phone: this.phone,
    time: this.time
  };

  var newIdentity = new identityModel(identity);

  newIdentity.save(function (err, identity) {
    if (err) {
      return callback(err);
    }
    callback(null, identity);
  });
};

Identity.verify = function(phone, code, callback) {
  identityModel.findOne({phone: phone, code: code}, function (err, code) {
    var result;
    if (code != null) {
      if (Date.now() - code.time > Value.identity_limit * 60000) {
        result = 'Expired';
      } else {
        result = 'OK';
      }
    } else {
      result = 'Wrong';
    }
    callback(null, result)
  })
};

Identity.bind = function(code, callback) {
  identityModel.findOne({code: code}, function (err, code) {
    var result;
    if (code != null) {
      if (Date.now() - code.time > Value.bind_limit * 24 * 60 * 60000) {
        result = {
          status: 'Expired'
        }
      } else {
        result = {
          status: 'OK',
          address: code.phone
        }
      }
    } else {
      result = {
        status: 'Wrong'
      }
    }
    callback(null, result)
  })
};

Identity.clear = function(phone, callback) {
  identityModel.remove({
    $or: [{phone: phone},
      {code: phone}]
  }, function() {
    callback(null)
  })
};

module.exports = Identity;