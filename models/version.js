/**
 * Created by hh on 15/6/14.
 */
var mongoose = require('./mongoose.js');
var versionSchema = new mongoose.Schema({
  date: Number,
  platform: String,
  version: String
}, {
  collection: 'Versions'
});

var versionModel = mongoose.model('Version', versionSchema);

function Version(version) {
  this.date = version.date;
  this.platform = version.platform;
  this.version = version.version;
}

Version.prototype.save = function(callback) {
  var version = {
    date: this.date,
    platform: this.platform,
    version: this.version
  };

  var newVersion = new versionModel(version);

  newVersion.save(function (err, version) {
    if (err) {
      return callback(err);
    }
    callback(null, version);
  });
};

Version.get = function(callback) {
  versionModel.find({}, function (err, version) {
    if (err) {
      return callback(err);
    }
    callback(null, version);
  });
};

module.exports = Version;