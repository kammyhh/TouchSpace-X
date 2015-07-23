/**
 * Created by hh on 15/6/14.
 */
var mongoose = require('./mongoose.js');
var musicSchema = new mongoose.Schema({
  title: String,
  demo: String,
  full: String
}, {
  collection: 'Musics'
});

var musicModel = mongoose.model('Music', musicSchema);

function Music(music) {
  this.title = music.title;
  this.demo = music.demo;
  this.full = music.full;
}

Music.prototype.save = function(callback) {
  var music = {
    title: this.title,
    demo: this.demo,
    full: this.full
  };

  var newMusic = new musicModel(music);

  newMusic.save(function (err, music) {
    if (err) {
      return callback(err);
    }
    callback(null, music);
  });
};

module.exports = Music;