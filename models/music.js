/**
 * Created by hh on 15/6/14.
 */
var mongoose = require('./mongoose.js');
var User = require('./user.js');
var utils = require('../utils.js');
var musicSchema = new mongoose.Schema({
  title: String,
  constellation: String,
  demo: String,
  full: String,
  like: Array
}, {
  collection: 'Musics'
});

var musicModel = mongoose.model('Music', musicSchema);

function Music(music) {
  this.title = music.title;
  this.constellation = music.constellation;
  this.demo = music.demo;
  this.full = music.full;
  this.like = music.like;
}

Music.prototype.save = function(callback) {
  var music = {
    title: this.title,
    constellation: this.constellation,
    demo: this.demo,
    full: this.full,
    like: this.like
  };

  var newMusic = new musicModel(music);

  newMusic.save(function (err, music) {
    if (err) {
      return callback(err);
    }
    callback(null, music);
  });
};


Music.like = function(musicId, userId, callback) {
  musicModel.findOne({_id: musicId}, function(err, music) {
    if (err) {
      return callback(err);
    }
    if (utils.if_contains(music['like'], userId)){
      for (var i=0;i<music['like'].length;i++){
        if (userId==music['like'][i]) {
          music['like'] = music['like'].slice(0, i).concat(music['like'].slice(i+1));
          break;
        }
      }
    } else {
      music['like'][music['like'].length] = userId;
    }
    musicModel.update({_id: musicId}, {'like': music['like']}, function(err) {
      if (err) {
        return callback(err);
      }
      callback(null, music['like']);
    })
  })
};

Music.list = function(userId, callback) {
  User.info(userId, function (err, user) {
    if (err) {
      return callback(err);
    }
    musicModel.find({}, function (err, musics) {
      var list = [], like = [], purchased = [];
      for (var i = 0; i < musics.length; i++) {

        if (utils.if_contains(user['purchased_music'], musics[i]['_id'].toString())) {
          list[i] = {
            id: musics[i]['_id'],
            title: musics[i]['title'],
            url: '10.1.7.241:3000' + musics[i]['full'],
            like: musics[i]['like'].length
          }
          purchased[purchased.length] = list[i]
        } else {
          list[i] = {
            id: musics[i]['_id'],
            title: musics[i]['title'] + '-试听',
            url: '10.1.7.241:3000' + musics[i]['demo'],
            like: musics[i]['like'].length
          }
        }
        if (utils.if_contains(musics[i]['like'], user['_id'].toString())) {
          like[like.length] = {
            id: musics[i]['_id'],
            title: list[i]['title'],
            url: list[i]['url']
          }
        }


      }
      callback(null, list, like, purchased)
    })
  })
};

Music.query = function(musicId, callback) {
  musicModel.findOne({_id: musicId}, function (err, music) {
    callback(null, music);
  })
};

Music.updateList = function(files, callback) {
  var titles = [];
  for (var i=0;i<files.length;i++){
    var title = files[i].split('-')[1]||'null';
    if (title != undefined) {
      titles.push(title)
    }
  }
  musicModel.find({title: {$in: titles}}, function (err, musics) {
    var exists = []
    for (var i=0;i<musics.length;i++) {
      exists.push(musics[i].title)
    }
    var result = [];
    for (i=0;i<titles.length;i++) {
      if (!utils.if_contains(exists, titles[i])) {
        result.push(titles[i])
      }
    }
    callback(null, result);
  })
};

Music.constellation = function(constellation, callback) {
  musicModel.find({constellation: constellation}, function (err, list) {
    callback(null, list);
  })
};




module.exports = Music;