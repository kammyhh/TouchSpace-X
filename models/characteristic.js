/**
 * Created by hh on 15/6/23.
 */
var mongoose = require('./mongoose.js');
var characteristicSchema = new mongoose.Schema({
  digit: Number,
  characteristic: String
}, {
  collection: 'Characteristics'
});

var characteristicModel = mongoose.model('Characteristic', characteristicSchema);

function Characteristic(characteristic) {
  this.digit = characteristic.digit;
  this.characteristic = characteristic.characteristic;
}

Characteristic.prototype.save = function(callback) {
  var characteristic = {
    digit: this.digit,
    characteristic: this.characteristic
  };
  var newCharacteristic = new characteristicModel(characteristic);
  newCharacteristic.save(function (err, characteristic) {
    if (err) {
      return callback(err);
    }
    callback(null, characteristic);
  });
};

Characteristic.clean = function(callback) {
  characteristicModel.remove({}, function(){
    callback()
  })
};

module.exports = Characteristic;