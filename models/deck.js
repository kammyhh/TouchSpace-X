/**
 * Created by hh on 15/6/23.
 */
var mongoose = require('./mongoose.js');
var deckSchema = new mongoose.Schema({
  card: String,
  cards: Array
}, {
  collection: 'Decks'
});

var deckModel = mongoose.model('Deck', deckSchema);

function Deck(deck) {
  this.card = deck.card;
  this.cards = deck.cards;
}

Deck.prototype.save = function(callback) {
  var deck = {
    card: this.card,
    cards: this.cards
  };

  var newDeck = new deckModel(deck);

  newDeck.save(function (err, deck) {
    if (err) {
      return callback(err);
    }
    callback(null, deck);
  });
};

Deck.clean = function(callback) {
  deckModel.remove({}, function(){
    callback()
  })
};

Deck.getOne = function(card, age, callback) {
  if (card == 'Joker') {
    var num = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'],
      cor = ['黑桃','红桃','草花','方块'];
    card = num[parseInt(Math.random()*13)] + cor[parseInt(Math.random()*4)]
  }
  deckModel.findOne({card: card}, function(err, deck) {
    if (err) {
      return callback(err);
    }
    callback(null, deck['cards'][age]);
  });
};

module.exports = Deck;