/**
 * Created by hh on 15/7/28.
 */
var mongoose = require('./mongoose.js');
var verificationSchema = new mongoose.Schema({
  code: String,
  phone: String,
  time: Date
}, {
  collection: 'Verifications'
});

var verificationModel = mongoose.model('Verification', verificationSchema);

function Verification(verification) {
  this.code = verification.code;
  this.phone = verification.phone;
  this.time = verification.time;
}

Verification.prototype.save = function(callback) {
  var verification = {
    code: this.code,
    phone: this.phone,
    time: this.time
  };

  var newVerification = new verificationModel(verification);

  newVerification.save(function (err, verification) {
    if (err) {
      return callback(err);
    }
    callback(null, verification);
  });
};

Verification.verify = function(phone, code, callback) {
  verificationModel.findOne({phone: phone, code: code, time: {$gt: Date.now() - 1800000}}, function (err, code) {
    callback(null, code)
  })
};

Verification.clear = function(phone, callback) {
  verificationModel.remove({phone: phone}, function(err, result) {
    callback(null, result)
  })
};

module.exports = Verification;