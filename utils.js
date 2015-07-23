/**
 * Created by hh on 15/6/29.
 */

var apn = require('apn');
var async = require('async');
var crypto = require('crypto');
var fs= require('fs');
var xlsx = require('node-xlsx');

var Characteristic = require('./models/characteristic.js');
var Constellation = require('./models/constellation.js');
var Deck = require('./models/deck.js');
var LifeGuardCard = require('./models/life_guard_card.js');
var Match = require('./models/match.js');
var Message = require('./models/message.js');
var Solution = require('./models/solution.js');
var User = require('./models/user.js');
var Version = require('./models/version.js');


var if_contains = function(arr, obj) {
  var i = arr.length;
  while (i--) {
    if (arr[i] === obj) {
      return true;
    }
  }
  return false;
};

var get_age = function(birthday, today) {
  var birth = new Date(birthday),
    year = birth.getFullYear(),
    month = birth.getMonth()+ 1,
    date = birth.getDate(),
    now = new Date(today),
    y = now.getFullYear(),
    m = now.getMonth()+ 1,
    d = now.getDate(),
    age;
  if (d<date) m--;
  if (m<month) y--;
  age = y-year;
  return age;
};

var get_constellation = function(birthday) {

  /* 3.21-4.19
   4.20-5.20
   5.21-6.21
   6.22-7.22
   7.23-8.22
   8.23-9.22
   9.23-10.23
   10.24-11.22
   11.23-12.21
   12.22-1.19
   1.20-2.18
   2.19-3.20 */

  var constellation;
  if ((birthday < 120) || (birthday > 1221)) {
    constellation = '摩羯座';
  } else if (birthday < 219) {
    constellation = '水瓶座';
  } else if (birthday < 321) {
    constellation = '双鱼座';
  } else if (birthday < 420) {
    constellation = '白羊座';
  } else if (birthday < 521) {
    constellation = '金牛座';
  } else if (birthday < 622) {
    constellation = '双子座';
  } else if (birthday < 723) {
    constellation = '巨蟹座';
  } else if (birthday < 823) {
    constellation = '狮子座';
  } else if (birthday < 923) {
    constellation = '处女座';
  } else if (birthday < 1024) {
    constellation = '天秤座';
  } else if (birthday < 1123) {
    constellation = '天蝎座';
  } else if (birthday < 1222) {
    constellation = '射手座';
  }
  return constellation;
};

var get_secret_number = function(birthday) {
  var birth = new Date(birthday),
    year = birth.getFullYear(),
    month = birth.getMonth()+ 1,
    date = birth.getDate(),
    sum = year + month + date;
  while (sum>9) {
    var str = String(sum),
      len = str.length;
    sum = 0;
    for (var i=0;i<len;i++) {
      sum += parseInt(str[i])
    }
  }
  return sum;
};

var get_suit = {
  '黑': 'A',   //黑桃
  '红': 'B',   //红桃
  '草': 'C',   //草花
  '方': 'D'    //方块
};

var get_distance = function(lat1,lng1,lat2,lng2){

  var EARTH_RADIUS = 6378137.0;    //单位M
  var PI = Math.PI;

  function getRad(d){
    return d*PI/180.0;
  }

  var f = getRad((lat1 + lat2)/2);
  var g = getRad((lat1 - lat2)/2);
  var l = getRad((lng1 - lng2)/2);

  var sg = Math.sin(g);
  var sl = Math.sin(l);
  var sf = Math.sin(f);

  var s,c,w,r,d,h1,h2;
  var a = EARTH_RADIUS;
  var fl = 1/298.257;

  sg = sg*sg;
  sl = sl*sl;
  sf = sf*sf;

  s = sg*(1-sl) + (1-sf)*sl;
  c = (1-sg)*(1-sl) + sf*sl;

  if (c == 0) return 0;

  w = Math.atan(Math.sqrt(s/c));

  if (w == 0) return 0;
  r = Math.sqrt(s*c)/w;
  d = 2*w*a;
  h1 = (3*r -1)/2/c;
  h2 = (3*r +1)/2/s;

  return d*(1 + fl*(h1*sf*(1-sg) - h2*(1-sf)*sg));
};

var get_period = function(birthday, today) {
  //need to be verify
  var birth = new Date(birthday),
    month = birth.getMonth()+ 1,
    date = birth.getDate(),
    now = new Date(today),
    m = now.getMonth()+ 1,
    d = now.getDate(),
    p,
    period = {
      1: 'Mercury',
      2: 'Venus',
      3: 'Mars',
      4: 'Jupiter',
      5: 'Saturn',
      6: 'Uranus',
      7: 'Neptune'
    };
  if (month > m) m += 12;
  p = parseInt(((m - month) * 365 / 12 + d - date) / 52) + 1;
  return period[p];
};

var get_match_value = function(user, target) {

  var value, distance, card, number, contact, constellation;
  var sn_user, sn_target, dis;
  var comp = {
    1: 2,
    2: 8,
    3: 6,
    4: 7,
    5: 4,
    6: 3,
    7: 9,
    8: 5,
    9: 1
  };
  var deck = user['deck'];
  var period = get_period(user['detail']['birthday'], Date.now());

  if (if_contains(deck['long_term'], target['detail']['life_card'])) {
    card = 20;
  } else if (if_contains(deck['long_term'], target['detail']['guard_card'])) {
    card = 19;
  } else if (if_contains(deck['Pluto'], target['detail']['life_card'])) {
    card = 18;
  } else if (if_contains(deck['Pluto'], target['detail']['guard_card'])) {
    card = 17;
  } else if (if_contains(deck['result'], target['detail']['life_card'])) {
    card = 16;
  } else if (if_contains(deck['result'], target['detail']['guard_card'])) {
    card = 15;
  } else if (if_contains(deck[period], target['detail']['life_card'])) {
    card = 9;
  } else if (if_contains(deck[period], target['detail']['guard_card'])) {
    card = 8;
  } else {
    card = 0;
  }

  dis = get_distance(user['last_login']['x'], user['last_login']['y'],
    target['last_login']['x'], target['last_login']['y']);
  //100m 31, 1km 30, 10km 22, 20km 16, 40km 8, 50km 5, 100km 1
  distance = parseInt(Math.pow(2, 5 - (dis / 20000)));
  if (distance < 0) distance = 0;

  sn_user = get_secret_number(user['detail']['birthday']);
  sn_target = get_secret_number(target['detail']['birthday']);
  if (sn_user == sn_target) {
    number = 4;
  } else if (sn_target == comp[sn_user]) {
    number = 3;
  } else {
    number = 0;
  }

  if (if_contains(user['contact'], target['detail']['phone'])
    || if_contains(target['contact'], user['detail']['phone'])) {
    contact = 2;
  } else {
    contact = 0;
  }

  if (user['detail']['constellation'] == target['detail']['constellation']) {
    constellation = 1;
  } else {
    constellation = 0;
  }

  value = distance + card + number + contact + constellation;
  return value;
};

var random_array = function(arr) {
  var a = arr;
  var rand_arr = [], rand;
  for (var i = 0; i < arr.length; i++) {
    rand = parseInt(Math.random() * (arr.length - i));
    rand_arr[i] = a[rand];
    a = a.slice(0, rand).concat(a.slice(rand + 1));
  }
  return rand_arr;
};

var sleep = function(sleepTime) {
  for(var start = +new Date; +new Date - start <= sleepTime; ) { }
};

var apple_push = function(device, content) {
  var token = device; //长度为64的设备Token
  var options = {"gateway": "gateway.sandbox.push.apple.com"};
  var apnConnection = new apn.Connection(options),
    device = new apn.Device(token),
    note = new apn.Notification();
  note.expiry = Math.floor(Date.now() / 1000) + 60;
  note.badge = 1;
  note.sound = "ping.aiff";
  note.alert = {
    t: "ttt",
    body: content
  };
  note.payload = {'messageFrom': '123'};
  apnConnection.pushNotification(note, device);
};

exports.test = function(req, res) {
  res.send('sent');
};

exports.findMatch = function(req, res) {
  User.get_all(function (results) {
    results = random_array(results);
    var matches = [];
    var l = results.length;
    for (var i = 0; i < parseInt(l / 2); i++) {
      var max=0, begin = 0, end = 1;
      for (var j = 1; j < l - 2 * i; j++) {
        var value = get_match_value(results[0], results[j]);
        if (value>max) {
          max = value;
          begin = 0;
          end = j;
        }
      }
      matches[i] = {
        begin: results[begin]['last_login']['device'],
        end: results[end]['last_login']['device'],
        value: max,
        status: 0
      };

      var newMatch = new Match({
        begin: results[begin]['last_login']['device'],
        end: results[end]['last_login']['device'],
        value: max,
        status: 0
      });
      newMatch.save(function (err, match) {

      });

      apple_push(results[begin]['last_login']['device'], 'begin: '+Date.now().toString());
      apple_push(results[end]['last_login']['device'], 'end: '+Date.now().toString());

      results = results.slice(0, end).concat(results.slice(end + 1));
      results = results.slice(1);
    }
    var response = {
      matches: matches
    };
    console.log(response);
    res.send(response)
  })
};

exports.login = function(req, res) {
  var username = req.header('username'),
    password = req.header('password'),
    device_token = req.header('device_token'),
    ip = req['_remoteAddress'].split(':').pop();
  User.login(username, password, function (err, user) {
    if (err) throw err;
    if (user != null) {
      var userId = user['_id'],
        plaintext = user['username'] + Date.now(),
        token = crypto.createHash('md5').update(plaintext).digest('hex');
      User.setLogin(userId, token, ip, device_token, function () {
        if (err) throw err;
        var response = {
          status: 'OK',
          data: {
            userId: userId,
            token: token
          }
        };
        res.send(response)
      });
    } else {
      var response = {
        status: 'Not found',
        data: {}
      };
      res.send(response)
    }
  })
};

exports.register = function(req, res) {
  var nickname = req.header('nickname'),
    birthday = req.header('birthday'),
    gender = req.header('gender'),
    phone = req.header('phone'),
    email = req.header('email'),
    password = req.header('password');

  User.checkEmail(email, function (err, user) {
    if (user != null) {
      var response = {
        status: 'User already exists',
        data: {}
      };
      res.send(response)
    } else {
      var birth = new Date(birthday),
        month = birth.getMonth() + 1,
        date = birth.getDate(),
        str_birth = String(month * 100 + date),
        int_birth = parseInt(str_birth),
        constellation = get_constellation(int_birth);

      LifeGuardCard.findOne(str_birth, function (err, life_guard_card) {
        if (err) throw err;
        if (life_guard_card!=null){
          var life_card = life_guard_card['life_card'],
            len = life_card.length,
            pre = life_card.substr(0, len - 2) + get_suit[life_card[len - 2]];
          User.countName(pre, function (err, count) {
            var username = String(get_secret_number(birthday)) +
              pre + String(count + 1);
            var newUser = new User({
              username: username,
              password: password,
              token: "empty",
              detail: {
                nickname: nickname,
                birthday: birthday,
                gender: gender,
                phone: phone,
                email: email,
                life_card: life_guard_card['life_card'],
                guard_card: life_guard_card['guard_card'],
                constellation: constellation,
                energy: 0,
                flag: 0
              },
              last_login: {
                ip: '1.1.1.1',
                x: 0,
                y: 0,
                z: 0,
                time: Date.now()
              }
            });
            newUser.save(function (err, user) {
              console.log(user);
              var response = {
                status: 'OK',
                data: {
                  username: user['username']
                }
              };
              res.send(response)
            });
          });
        } else {
          var response = {
            status: 'Invalid request',
            data: {}
          };
          res.send(response)
        }
      });
    }
  })
};

exports.userInfo = function(req, res) {
  var userId = req.header('userId'),
    token = req.header('token');
  User.auth(userId, token, function (err, user) {
    if (err) throw err;
    if (user != null) {
      var birthday = user['detail']['birthday'],
        age = get_age(birthday, Date.now()),
        secret_number = get_secret_number(birthday);
      Deck.getOne(user['detail']['life_card'], age, function (err, deck) {
        if (err) throw err;
        if (deck!=null) {
          var response = {
            status: 'OK',
            data: {
              info: {
                detail: {
                  birthday: user['detail']['birthday'],
                  flag: user['detail']['flag'],
                  energy: user['detail']['energy'],
                  constellation: user['detail']['constellation'],
                  guard_card: user['detail']['guard_card'],
                  life_card: user['detail']['life_card'],
                  email: user['detail']['email'],
                  phone: user['detail']['phone'],
                  gender: user['detail']['gender'],
                  nickname: user['detail']['nickname']
                },
                last_login: user['last_login']
              },
              secret_number: secret_number,
              age: age,
              deck: deck
            }
          };
          res.send(response)
        } else {
          response = {
            status: 'Invalid request',
            data: {}
          };
          res.send(response)
        }
      });
    } else {
      var response = {
        status: 'Not found',
        data: {}
      };
      res.send(response)
    }
  })
};

exports.contactInfo = function(req, res) {
  var userId = req.header('userId'),
    token = req.header('token'),
    contactId = req.header('contactId');
  User.auth(userId, token, function (err, user) {
    if (err) throw err;
    if (user != null) {
      User.info(contactId, function (err, contact) {
        if (err) throw err;
        if (contact!=null) {
          var birthday = contact['detail']['birthday'],
            age = get_age(birthday, Date.now());
          Deck.getOne(contact['detail']['life_card'], age, function (err, deck) {
            if (err) throw err;
            if (deck!=null) {
              var response = {
                status: 'OK',
                data: {
                  deck: deck
                }
              };
              res.send(response)
            } else {
              response = {
                status: 'Invalid request',
                data: {}
              };
              res.send(response)
            }
          })
        }  else {
          var response = {
            status: 'Invalid request',
            data: {}
          };
          res.send(response)
        }
      })
    } else {
      var response = {
        status: 'Not found',
        data: {}
      };
      res.send(response)
    }
  })
};

exports.uploadAvatar = function(req, res) {
  var userId = req.header('userId'),
    token = req.header('token');
  User.info(userId, token, function (err, user) {
    if (err) throw err;
    if (user != null) {
      var tmp_path = req.files.thumbnail.path,
        target_name = user['username'] + '.' + req.files.thumbnail.name.split('.')[1],
        target_path = './public/images/Avatar_' + target_name,
        avatar = '/images/Avatar_' + target_name;
      fs.rename(tmp_path, target_path, function (err) {
        if (err) throw err;
        fs.unlink(tmp_path, function () {
          if (err) throw err;
          User.setAvatar(user['_id'], avatar, function () {
            if (err) throw err;
            response = {
              status: 'OK',
              data: {
                target_path: avatar,
                size: req.files.thumbnail.size + 'bytes'
              }
            };
            res.send(response);
          });
        });
      });
    } else {
      var response = {
        status: 'Token error',
        data: {}
      };
      res.send(response)
    }
  });
};

exports.cardSolution = function(req, res) {
  var card = req.body.card,
    spec = req.body.spec;
  Solution.findOne(card, function (err, solution) {
    if (err) throw err;
    if (solution != null) {
      response = {
        status: 'OK',
        data: {
          solution: solution[spec]
        }
      };
      res.send(response);
    } else {
      var response = {
        status: 'Not found',
        data: {}
      };
      res.send(response)
    }
  })
};

exports.constellationInfo = function(req, res) {
  var constellation = req.body.constellation,
    userId = req.body.userId;
  console.log(constellation, userId);
  console.log(typeof (userId));
  Constellation.find(constellation, function (err, result) {
    if (err) throw err;
    if (result!=null) {
      User.countConstellation(constellation, function (err, count) {
        if (err) throw err;
        if (count!=null) {
          User.countActiveInConstellation(constellation, function (err, active) {
            if (err) throw err;
            if (active!=null) {
              User.rankInConstellation(userId, constellation, function (err, rank) {
                if (err) throw err;
                if (rank!=null) {
                  Message.sendFromConstellation(constellation, function (err, msg) {
                    if (err) throw err;
                    if (msg!=null) {
                      User.brightestInConstellation(constellation, function (err, user) {
                        if (err) throw err;
                        if (user != null) {
                          var brightest = user['detail']['nickname'];
                          User.countGenderInConstellation(1, constellation, function (err, man) {
                            var male = man, female = count - male;
                            var response = {
                              status: 'OK',
                              data: {
                                constellation: constellation,
                                duration: result.duration,
                                content: result.content,
                                count: count,
                                active: active,
                                rank: rank,
                                msg: msg,
                                brightest: brightest,
                                male: male,
                                female: female
                              }
                            };
                            console.log(response);
                            res.send(response)
                          })
                        } else {
                          var response = {
                            status: 'Not found',
                            data: {}
                          };
                          res.send(response)
                        }
                      })
                    } else {
                      var response = {
                        status: 'Invalid request',
                        data: {}
                      };
                      res.send(response)
                    }
                  });
                } else {
                  var response = {
                    status: 'Invalid request',
                    data: {}
                  };
                  res.send(response)
                }
              })
            } else {
              var response = {
                status: 'Invalid request',
                data: {}
              };
              res.send(response)
            }
          })
        } else {
          var response = {
            status: 'Invalid request',
            data: {}
          };
          res.send(response)
        }
      })
    } else {
      var response = {
        status: 'Invalid request',
        data: {}
      };
      res.send(response)
    }
    User.countConstellation(constellation, function (err, count) {
      if (err) throw err;
      if (count!=null) {
        User.countActiveInConstellation(constellation, function (err, active) {
          if (err) throw err;
          if (active!=null) {
            User.rankInConstellation(userId, constellation, function (err, rank) {
              if (err) throw err;
              if (rank!=null) {
                Message.sendFromConstellation(constellation, function (err, msg) {
                  if (err) throw err;
                  if (msg!=null) {
                    User.brightestInConstellation(constellation, function (err, user) {
                      if (err) throw err;
                      if (user != null) {
                        var brightest = user['detail']['nickname'];
                        User.countGenderInConstellation(1, constellation, function (err, man) {
                          var male = man, female = count - male;
                          var response = {
                            status: 'OK',
                            data: {
                              constellation: constellation,
                              duration: result.duration,
                              content: result.content,
                              count: count,
                              active: active,
                              rank: rank,
                              msg: msg,
                              brightest: brightest,
                              male: male,
                              female: female
                            }
                          };
                          console.log(response);
                          res.send(response)
                        })
                      } else {
                        var response = {
                          status: 'Not found',
                          data: {}
                        };
                        res.send(response)
                      }
                    })
                  } else {
                    var response = {
                      status: 'Invalid request',
                      data: {}
                    };
                    res.send(response)
                  }
                });
              } else {
                var response = {
                  status: 'Invalid request',
                  data: {}
                };
                res.send(response)
              }
            })
          } else {
            var response = {
              status: 'Invalid request',
              data: {}
            };
            res.send(response)
          }
        })
      } else {
        var response = {
          status: 'Invalid request',
          data: {}
        };
        res.send(response)
      }

    })
  })
};

exports.sendMessage = function(req, res) {
  var userId = req.header('userId'),
    token = req.header('token');
  User.auth(userId, token, function (err, user) {
    if (user != null) {
      var username = user['username'],
        constellation = user['detail']['constellation'],
        to = req.body.to,
        msg = req.body.msg;
      var message = {
        from: {
          username: username,
          constellation: constellation
        },
        to: to,
        message: msg,
        isRead: 0,
        date: Date.now()
      };
      new Message(message).save(function (err, record) {
        console.log(record);
      });
      var response = {
        status: 'OK',
        data: {}
      };
      res.send(response)
    } else {
      response = {
        status: 'Token error',
        data: {}
      };
      res.send(response)
    }
  });
};

exports.receiveMessage = function(req, res) {
  var userId = req.header('userId'),
    token = req.header('token');
  User.auth(userId, token, function (err, user) {
    if (err) throw err;
    if (user != null) {
      var username = user['username'];
      Message.receive(username, function (err, record) {
        console.log(record);
        var response = {
          status: 'OK',
          data: record
        };
        res.send(response)
      })
    } else {
      var response = {
        status: 'Token error',
        data: {}
      };
      res.send(response)
    }
  })
};

exports.longTerm = function(req, res) {
  var birthday = new Date(req.body.birthday),
    someday = new Date(req.body.someday),
    age = get_age(birthday, someday),
    month = birthday.getMonth() + 1,
    date = birthday.getDate(),
    str_birth = String(month * 100 + date);

  LifeGuardCard.findOne(str_birth, function(err, life_guard_card) {
    if (err) throw err;
    if (life_guard_card!=null) {
      var life_card = life_guard_card['life_card'];
      Deck.getOne(life_card, age, function (err, deck) {
        if (err) throw err;
        if (deck!=null) {
          var spec = 'long_term',
            card = deck['cards'][spec][0];
          Solution.findOne(card, function (err, solution) {
            if (err) throw err;
            if (solution!=null) {
              var response = {
                'birthday': birthday,
                'someday': someday,
                'age': age,
                'life_card': life_card,
                'card': card,
                'explanation': solution[spec]
              };
              res.send(response)
            } else {
              response = {
                status: 'Invalid request',
                data: {}
              };
              res.send(response)
            }
          })
        } else {
          var response = {
            status: 'Invalid request',
            data: {}
          };
          res.send(response)
        }
      })
    }  else {
      var response = {
        status: 'Invalid request',
        data: {}
      };
      res.send(response)
    }
  })
};

exports.promotion = function(req, res) {
  var birthday = new Date(req.query.birthday),
    someday = new Date(Date.now()),
    age = get_age(birthday, someday),
    month = birthday.getMonth() + 1,
    date = birthday.getDate(),
    str_birth = String(month * 100 + date);
  LifeGuardCard.findOne(str_birth, function(err, life_guard_card) {
    var life_card = life_guard_card['life_card'];
    Deck.getOne(life_card, age, function (err, deck) {
      var spec = 'long_term',
        card = deck['cards'][spec][0];
      if (err) throw err;
      if (deck!=null) {
        Solution.findOne(card, function (err, solution) {
          var txt = '我们知道你的\n年龄：' + age + '\n星座：' + get_constellation(month * 100 + date)
            + '\n生命数字：' + get_secret_number(birthday) + '\n我们还知道你今年所面临的\n一些事情：\n\n' + solution[spec];
          res.send(txt + '\n（此处还有一万字已略去）')
        })
      }  else {
        var response = {
          status: 'Invalid request',
          data: {}
        };
        res.send(response)
      }
    })
  })
};



//initialization

exports.initDeck = function(req, res) {
  Deck.clean(function () {
    var paths = [
      '/Users/hh/Downloads/cards/♠️.xlsx',
      '/Users/hh/Downloads/cards/❤️.xlsx',
      '/Users/hh/Downloads/cards/♣️.xlsx',
      '/Users/hh/Downloads/cards/♦️.xlsx'
    ];
    for (var n = 0; n < paths.length; n++) {
      var obj = xlsx.parse(paths[n]),
        data = obj[0]['data'];
      for (var i = 1; i < data.length; i++) {
        var record = {};
        if (data[i][0] == '花色') {
          record['card'] = data[i][1];
          record['cards'] = [];
          for (var j = i + 2; j < i + 202; j += 2) {
            var card = {
              age: data[j][0],
              cards: {
                Mercury: [data[j][1], data[j + 1][1]],
                Venus: [data[j][2], data[j + 1][2]],
                Mars: [data[j][3], data[j + 1][3]],
                Jupiter: [data[j][4], data[j + 1][4]],
                Saturn: [data[j][5], data[j + 1][5]],
                Uranus: [data[j][6], data[j + 1][6]],
                Neptune: [data[j][7], data[j + 1][7]],
                long_term: [data[j][8], data[j + 1][8]],
                Pluto: [data[j][9], data[j + 1][9]],
                result: [data[j][10], data[j + 1][10]],
                environment: [data[j][11], data[j + 1][11]],
                substitution: [data[j][12], data[j + 1][12]]
              }
            };
            record['cards'].push(card);
          }
          new Deck(record).save(function (err, record) {
            console.log(record);
          });
        }
      }
    }
    res.send('Deck imported.')
  })
};

exports.initCharacteristic = function(req, res) {
  Characteristic.clean(function () {
    var obj = xlsx.parse('/Users/hh/Downloads/cards/数字性格.xlsx'),
      data = obj[0]['data'];
    for (var i = 0; i < data[0].length; i++) {
      var record = {
        digit: data[0][i],
        characteristic: data[1][i]
      };
      new Characteristic(record).save(function (err, record) {
        console.log(record)
      })
    }
    res.send('数字性格 imported.')
  })
};

exports.initLifeGuardCard = function(req, res) {
  LifeGuardCard.clean(function () {
    var obj = xlsx.parse('/Users/hh/Downloads/cards/生命牌与行星守护牌.xlsx'),
      data = obj[0]['data'];
    for (var i = 0; i < data.length; i++) {
      if (typeof(data[i][0]) == 'number') {
        var record = {
          birthday: data[i][0] * 100 + data[i][1],
          life_card: data[i][2],
          guard_card: data[i][3]
        };
        console.log(record);
        new LifeGuardCard(record).save(function (err, record) {
          console.log(record);
        });
      }
    }
    res.send('生命牌与行星守护牌 imported.')
  })
};

exports.initSolution = function(req, res) {
  Solution.clean(function () {
    var obj = xlsx.parse('/Users/hh/Downloads/cards/牌阵解读20150530.xlsx'),
      data = obj[0]['data'];
    for (var i = 1; i < data.length; i++) {
      var record = {
        card: data[i][0],
        Mercury: data[i][2],
        Venus: data[i][3],
        Mars: data[i][4],
        Jupiter: data[i][5],
        Saturn: data[i][6],
        Uranus: data[i][7],
        Neptune: data[i][8],
        Pluto: data[i][9],
        result: data[i][10],
        long_term: data[i][11],
        environment: data[i][12],
        substitution: data[i][13]
      };
      console.log(record);
      new Solution(record).save(function (err, record) {
        console.log(record);
      });
    }
    res.send('牌阵解读 imported.')
  })
};

exports.initConstellation = function(req, res) {
  Constellation.clean(function () {
    var cons = [
      {
        name: '白羊座',
        duration: '3月21日~4月20日',
        content: '白羊座代表着万物生长的开端，是自然的根本。追求自我，最纯粹的境界我故我存在。他们活力十足天赋异禀，极富动感爱冒险常怀着敬畏好奇之心去认知探索世界，直白坦诚常像孩子一样以自我为中心，追求新奇，希望能引起别人的注意，认可自己的价值。经常表露出强烈的领导欲望，认定的事一定会坚持到底，他们十分渴望成为人群中最耀眼的光芒。'
      }, {
        name: '金牛座',
        duration: '4月21日~5月21日',
        content: '金牛座代表着成长和发展，和谐稳定是他们的生活态度。固执不喜欢变化，热衷于将身边的环境改造的更美好，为所爱的人而生活。他们喜欢成为团队中的一员，习惯忍耐，当发生问题是，会先保护自己的利益。对周围的物质世界充满好奇，他们会当敏锐的观察者能细致的筹划一个活动，待机而动。他们有艺术细胞，具有高度欣赏任何艺术的品味。'
      }, {
        name: '双子座',
        duration: '5月22日~6月21日',
        content: '双子座代表着敏捷的思维和随和交流能力。不愿意墨守成规，喜欢千变万化带来的满足感。直言不讳，陶醉自己的张扬个性，喜欢刺激的生活，害怕无聊重复单一。勇于冒险，创新哪怕带来麻烦也会让自己高兴，这样会让生活变得丰富多彩。喜欢结伴而行对自我有提升的活动感兴趣，专注力不稳定，容易半途而废。追求自由，享受改变想法的过程。'
      }, {
        name: '巨蟹座',
        duration: '6月22日~7月22日',
        content: '巨蟹座代表着深刻的情感，保护力，家庭责任。情感细腻，重视家庭，对人有一定的防御性，不会直接提出要求，通常习惯让别人感受自己的情感变化。看重友谊带来的感情共鸣，享受彼此分享彼此信任带来的心里满足。喜欢在私人空间感受美好的一切，总能在定期的家人活动中获得心灵上的放松。对于要得到的变得有侵略性一定会坚持到底，不言放弃。'
      }, {
        name: '狮子座',
        duration: '7月23日~8月23日',
        content: '狮子座代表着万丈光芒集于一身的王者风范，有野心，自信，力量是这个星座的特点，他们希望通过强势直接的行动去领导他人，让他人服从。温暖，正直不容任何不公正，压迫的事发生，一旦发生会立刻对抗。他们慷慨，付出时会竭尽全力，忠于自己的家庭，朋友，伴侣照顾每个人的感受，希望自己能给人一种值得信赖的形象。'
      }, {
        name: '处女座',
        duration: '8月24日~9月22日',
        content: '处女座代表着生命需要一个有序严谨的方法来看到世界，做事严谨周密，有强力的求知欲。有旺盛的批判精神，自己追求事事完美而对他人有所挑剔。凡事喜欢保密，容易相信表面想象，他们的内心世界被分析、破解、衡量所占据。他们喜欢深思熟虑计划好一切再做出行动。因性格内对来自向外部的压力常采取消极回避的方式。'
      }, {
        name: '天秤座',
        duration: '9月23日~10月22日',
        content: '天秤座代表生命对平衡的需求。追求一切美的事物，执着公平的对待每个人。感性，体贴，有极佳的口才，是个很好的朋友能为他人着想，容易被美丽的外表所吸引，不喜欢别人的催促，时刻都要衡量每一点的平衡，常有拖延症。慷慨热情，却总无法避免在追求平等的过程中为保持中立而惹来自尊上的伤害。'
      }, {
        name: '天蝎座',
        duration: '10月23日~11月21日',
        content: '天蝎座代表着生命中强大的引导力量和掌控人生的能力。争强好胜，有强烈的防御性通常不主动与他人发生冲突，习惯凭着直觉行动，对身边的一切都想争取主导力量，强势不妥协，心怀坚定的目标，站得高看得远，有能屈能伸的能力，对待严肃性的事也能有自己成熟的看法，不盲目乐观，通过自己的幽默感自我解嘲面对一切苦难。'
      }, {
        name: '射手座',
        duration: '11月22日~12月21日',
        content: '射手座代表着生命中把控世界观的能力，心胸开阔，乐观，不拘小节。崇尚自由自在的生活，是个享乐主义者，他们率真，有感染他人的生命力，对探索周边的世界有强烈的热情，不断地寻找新方式表达自己，他们热爱运动，希望找到自己的节奏。他们始终在追求属于自己的生活环境，不会轻言放弃自己的希望和理想。'
      }, {
        name: '摩羯座',
        duration: '12月22日~1月20日',
        content: '摩羯座代表着生命中成熟的需求。他们节约，做事严谨，有强烈的责任感。常通过耐心持之以恒来完成目标，对容易达成的事持怀疑态度。常怀有远大的抱负，但内心比较内向忧郁，欠缺幽默感，常会用严厉的外表掩饰内心的消极。守旧派能顺势接受命运的安排，缺少改变的灵活性。是天生的权利追逐者，有独裁倾向。'
      }, {
        name: '水瓶座',
        duration: '1月21日~2月19日',
        content: '水瓶座代表着生命中的科学价值和超感能量。他们是理想主义者，爱好和平，以开放的心态接纳一切。推崇崇高的理想，富有创造性聪慧，能平等客观的对待周边的人。善变，喜欢打破常规发挥自己的潜能，敞开心怀时，对拒绝不能接受，但能坚持自己的立场，坚信世间自有公道，容易陷入莫名的人性黑暗面。'
      }, {
        name: '双鱼座',
        duration: '2月20日~3月20日',
        content: '双鱼座代表着生命中摆脱尘世负担和宇宙融为一体的精神。梦幻、单纯、敏感、乐于人分享的是他们的特质，他们极度敏感，富有较强的观察力但总会举棋不定，缺乏自信，又富有强烈的同情心，对周遭不公的事总会表现出怜悯心。他们随遇而安，对不幸的事也总能坦然接受。是天生的艺术天才，喜欢沉醉在浪漫的世界。'
      }
    ];
    for (var i = 0; i < cons.length; i++) {
      var record = cons[i];
      console.log(record);
      new Constellation(record).save(function (err, record) {
        console.log(record);
      });
    }
    res.send('星座解释 imported.')
  })
};

exports.get_age = get_age;
