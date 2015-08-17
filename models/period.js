/**
 * Created by hh on 15/8/6.
 */
var mongoose = require('./mongoose.js');
var periodSchema = new mongoose.Schema({
  date: String,
  p1: String,
  p2: String,
  p3: String,
  p4: String,
  p5: String,
  p6: String,
  p7: String
}, {
  collection: 'Periods'
});

var periodModel = mongoose.model('Period', periodSchema);

function Period(period) {
  this.date = period.date;
  this.p1 = period.p1;
  this.p2 = period.p2;
  this.p3 = period.p3;
  this.p4 = period.p4;
  this.p5 = period.p5;
  this.p6 = period.p6;
  this.p7 = period.p7;
}

Period.prototype.save = function(callback) {
  var period = {
    date: this.date,
    p1: this.p1,
    p2: this.p2,
    p3: this.p3,
    p4: this.p4,
    p5: this.p5,
    p6: this.p6,
    p7: this.p7
  };

  var newPeriod = new periodModel(period);

  newPeriod.save(function (err, period) {
    if (err) {
      return callback(err);
    }
    callback(null, period);
  });
};

Period.clean = function(callback) {
  periodModel.remove({}, function(){
    callback()
  })
};

Period.identify = function(birthday, target, callback) {
  var birth_month = new Date(birthday).getMonth() + 1,
    birth_date = new Date(birthday).getDate(),
    birth_str = birth_month + '/' + birth_date;
  var target_month = new Date(target).getMonth() + 1,
    target_date = new Date(target).getDate(),
    target_int = target_month * 100 + target_date;

  if (birth_str == '12/31') {
    var list = "由于您的生日非常特殊，所以系统自动为您进行数据排列，您是极为特殊的一类人，拥有常人所没有的灵性，属于谜中之谜。 ";
    callback(null, 1, list)
  } else {
    periodModel.findOne({date: birth_str}, function (err, periods) {
      var en = {
        1: 'Mercury',
        2: 'Venus',
        3: 'Mars',
        4: 'Jupiter',
        5: 'Saturn',
        6: 'Uranus',
        7: 'Neptune'
        },
        cn = {
          1: '水星',
          2: '金星',
          3: '火星',
          4: '木星',
          5: '土星',
          6: '天王星',
          7: '海王星'
        };
      if (err) {
        return callback(err);
      }
      var period = en[7], flag = 0, list = '', yesterdays = [];
      for (var i = 1; i <= 7; i++) {
        var p = periods['p' + i].split('/'),
          pm = parseInt(p[0]),
          pd = parseInt(p[1]),
          p_int = pm * 100 + pd;
        var yesterday = new Date(new Date("2015-" + p[0] + '-' + p[1]) - 86400000);
        yesterday = (yesterday.getMonth() + 1) + '/' + yesterday.getDate();
        if (i == 1) {
          yesterdays[7] = yesterday;
        } else {
          yesterdays[i - 1] = yesterday;
        }
        if (pm >= target_month) {
          flag = 1;
        } else if (flag == 1) {
          p_int += 1200;
        }
        if (target_int >= p_int) {
          period = en[i];
        }
      }
      for (i = 1; i <= 7; i++) {
        list += cn[i] + "周期: " + periods['p' + i] + "~" + yesterdays[i] + "\n";
      }
      callback(null, period, list)
    })
  }
};

module.exports = Period;