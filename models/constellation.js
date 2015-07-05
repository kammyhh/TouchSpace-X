/**
 * Created by hh on 15/7/1.
 */
var mongoose = require('./mongoose.js');
var constellationSchema = new mongoose.Schema({
  name: String,
  duration: String,
  content: String
}, {
  collection: 'Constellations'
});

var constellationModel = mongoose.model('Constellation', constellationSchema);

function Constellation(constellation) {
  this.name = constellation.name;
  this.content = constellation.content;
  this.duration = constellation.duration;
}

Constellation.prototype.save = function(callback) {
  var constellation = {
    name: this.name,
    duration: this.duration,
    content: this.content
  };

  var newConstellation = new constellationModel(constellation);

  newConstellation.save(function (err, constellation) {
    if (err) {
      return callback(err);
    }
    callback(null, constellation);
  });
};

Constellation.clean = function(callback) {
  constellationModel.remove({}, function(){
    callback()
  })
};

Constellation.find = function(constelltion, callback) {
  constellationModel.findOne({name: constelltion}, {_id: 0, duration: 1, content: 1}, function(err, result){
    callback(null, result)
  })
};


module.exports = Constellation;