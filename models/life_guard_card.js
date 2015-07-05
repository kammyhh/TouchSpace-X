/**
 * Created by hh on 15/6/23.
 */
var mongoose = require('./mongoose.js');
var life_guard_cardSchema = new mongoose.Schema({
  birthday: String,
  life_card: String,
  guard_card: String
}, {
  collection: 'Life_guard_cards'
});

var life_guard_cardModel = mongoose.model('Life_guard_card', life_guard_cardSchema);

function Life_guard_card(life_guard_card) {
  this.birthday = life_guard_card.birthday;
  this.life_card = life_guard_card.life_card;
  this.guard_card = life_guard_card.guard_card;
}

Life_guard_card.prototype.save = function(callback) {
  var life_guard_card = {
    birthday: this.birthday,
    life_card: this.life_card,
    guard_card: this.guard_card
  };

  var newLife_guard_card = new life_guard_cardModel(life_guard_card);

  newLife_guard_card.save(function (err, life_guard_card) {
    if (err) {
      return callback(err);
    }
    callback(null, life_guard_card)
  });
};

Life_guard_card.clean = function(callback) {
  life_guard_cardModel.remove({}, function(){
    callback()
  })
};

Life_guard_card.findOne = function(birthday, callback) {
  life_guard_cardModel.findOne({birthday: birthday}, function(err, life_guard_card){
    if (err) {
      return callback(err);
    }
    callback(null, life_guard_card)
  })
};

module.exports = Life_guard_card;