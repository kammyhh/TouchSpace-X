/**
 * Created by hh on 15/6/23.
 */
var mongoose = require('./mongoose.js');
var solutionSchema = new mongoose.Schema({
  card: String,
  Mercury: String,
  Venus: String,
  Mars: String,
  Jupiter: String,
  Saturn: String,
  Uranus: String,
  Neptune: String,
  long_term: String,
  Pluto: String,
  result: String,
  environment: String,
  substitution: String
}, {
  collection: 'Solutions'
});

var solutionModel = mongoose.model('Solution', solutionSchema);

function Solution(solution) {
  this.card = solution.card;
  this.Mercury = solution.Mercury;
  this.Venus = solution.Venus;
  this.Mars = solution.Mars;
  this.Jupiter = solution.Jupiter;
  this.Saturn = solution.Saturn;
  this.Uranus = solution.Uranus;
  this.Neptune = solution.Neptune;
  this.long_term = solution.long_term;
  this.Pluto = solution.Pluto;
  this.result = solution.result;
  this.environment = solution.environment;
  this.substitution = solution.substitution;
}

Solution.prototype.save = function(callback) {
  var solution = {
    card: this.card,
    Mercury: this.Mercury,
    Venus: this.Venus,
    Mars: this.Mars,
    Jupiter: this.Jupiter,
    Saturn: this.Saturn,
    Uranus: this.Uranus,
    Neptune: this.Neptune,
    long_term: this.long_term,
    Pluto: this.Pluto,
    result: this.result,
    environment: this.environment,
    substitution: this.substitution
  };

  var newSolution = new solutionModel(solution);

  newSolution.save(function (err, solution) {
    if (err) {
      return callback(err);
    }
    callback(null, solution);
  });
};

Solution.clean = function(callback) {
  solutionModel.remove({}, function(){
    callback()
  })
};

Solution.findOne = function(card, callback) {
  solutionModel.findOne({card: card}, function(err, solution){
    if (err) {
      return callback(err);
    }
    callback(null, solution)
  })
};

module.exports = Solution;