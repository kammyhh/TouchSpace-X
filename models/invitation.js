/**
 * Created by hh on 15/7/28.
 */
var mongoose = require('./mongoose.js');
var invitationSchema = new mongoose.Schema({
  code: String,
  sixId: String,
  phone: String,
  time: Date
}, {
  collection: 'Invitations'
});

var invitationModel = mongoose.model('Invitation', invitationSchema);

function Invitation(invitation) {
  this.code = invitation.code;
  this.sixId = invitation.sixId;
  this.phone = invitation.phone;
  this.time = invitation.time;
}

Invitation.prototype.save = function(callback) {
  var invitation = {
    code: this.code,
    sixId: this.sixId,
    phone: this.phone,
    time: this.time
  };

  var newInvitation = new invitationModel(invitation);

  newInvitation.save(function (err, invitation) {
    if (err) {
      return callback(err);
    }
    callback(null, invitation);
  });
};

Invitation.genCode = function(callback) {
  var code = (parseInt(Math.random() * 10)).toString()
    + (parseInt(Math.random() * 10)).toString()
    + (parseInt(Math.random() * 10)).toString()
    + (parseInt(Math.random() * 10)).toString()
    + (parseInt(Math.random() * 10)).toString()
    + (parseInt(Math.random() * 10)).toString();
  console.log(code);
  invitationModel.findOne({code: code}, function(err, invitation) {
    if (err) {
      return callback(err);
    }
    if (invitation != null) {
      Invitation.genCode(callback);
    } else {
      callback(null, code);
    }
  })
};

Invitation.acceptCode = function(phone, code, callback) {
  invitationModel.findOne({phone: phone, code: code}, function (err, invitation) {
    if (err) {
      return callback(err);
    }
    callback(null, invitation);
  })
};

module.exports = Invitation;