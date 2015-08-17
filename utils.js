/**
 * Created by hh on 15/6/29.
 */

var apn = require('apn');
var async = require('async');
var crypto = require('crypto');
var fs= require('fs');

var code_txt = 0;
exports.get_code_txt = function(req, res) {
  res.send(code_txt);
};
exports.get_code_img = function(req, res) {
  var ary = ccap.get();
  var buf = ary[1];
  code_txt = ary[0];
  res.send(buf, txt);
  console.log(ary);
};

var Characteristic = require('./models/characteristic.js');
var Constellation = require('./models/constellation.js');
var Deck = require('./models/deck.js');
var Invitation = require('./models/invitation.js');
var LifeGuardCard = require('./models/life_guard_card.js');
var Match = require('./models/match.js');
var Message = require('./models/message.js');
var Music = require('./models/music.js');
var Period = require('./models/period.js');
var Six = require('./models/six.js');
var Solution = require('./models/solution.js');
var User = require('./models/user.js');
var Version = require('./models/version.js');

var ccap = require('ccap')();//Instantiated ccap class


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

var apple_push = function(device_token, title, content) {
  var token = device_token; //长度为64的设备Token
  if (token == '1') {
    return;
  }
  var options = {"gateway": "gateway.sandbox.push.apple.com"};
  var apnConnection = new apn.Connection(options),
    device = new apn.Device(token),
    note = new apn.Notification();
  note.expiry = Math.floor(Date.now() / 1000) + 60;
  note.badge = 1;
  note.sound = "ping.aiff";
  note.alert = title;
  note.payload = content;
  apnConnection.pushNotification(note, device);
};

var cal_level = function(exp) {
  var lvl = [
    100,
    140,
    200,
    275,
    385,
    540,
    750,
    1055,
    1475,
    2065,
    2890,
    4050,
    5670
  ];
  var level = 1;
  for (var i = 0; i < lvl.length; i++) {
    if (exp >= lvl[i]) {
      level += 1;
      exp -= lvl[i]
    }
  }
  return {level: level, exp: exp};
};

var getSortFun = function(order, sortBy) {
  var ordAlpah = (order == 'asc') ? '>' : '<';
  var sortFun = new Function('a', 'b', 'return a.' + sortBy + ordAlpah + 'b.' + sortBy + '?1:-1');
  return sortFun;
};
//time_line.sort(getSortFun('asc', 'time'));

var target_list = [
  "55b1a1e2b409cb5c1a783702",
  "55991ed0e7b4533805e1c5a5"
];

exports.test = function(req, res) {
  res.send(new Date(Date.now()))
};



//info
exports.checkAttr = function(req, res) {
  var key = req.body.key,
    value = req.body.value;
  if (key == 'nickname') {
    User.checkNick(value, function(err, user){
      if (user!=null) {
        var response = 'not available';
      } else {
        response = 'available';
      }
      res.send(response)
    })
  }
  if (key == 'phone') {
    User.checkPhone(value, function(err, user){
      if (user!=null) {
        var response = 'not available';
      } else {
        response = 'available';
      }
      res.send(response)
    })
  }
  if (key == 'email') {
    User.checkEmail(value, function(err, user){
      if (user!=null) {
        var response = 'not available';
      } else {
        response = 'available';
      }
      res.send(response)
    })
  }
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
      Period.identify(birthday, Date.now(), function (err, period, list) {
        if (err) throw err;
        var content = '1、每个人都有两张伴随其一生的牌，从出生那天起这两张牌所赋予的智慧与情感就融于每个人的命运之中。其中一张牌叫做【生命牌】，是我们每个人的灵魂特征，也是最重要的一张牌；另外一张叫【行星守护牌】，是我们每个人生活中的特征表现，仅次于生命牌。（本版中我们不对两张牌做详细解释。)\n'
          + '2、【生命牌】与【行星守护牌】从0-99岁，都有一套完整的牌阵，每年的牌阵都不相同。每个牌阵又分7个行星周期（水星、金星、火星、木星、土星、 天王星、海王星），每个行星周期到下个行星周期的天数为52天，7个周期为52*7=364天，构成一整年（12月31日出生的人，没有行星周期，但这天出生的人，生命牌可以是任意一张。）每个行星周期周期对应1或者2张牌，每张行星周期牌都有不同的解释，告诉你这个周期你需要面对哪些重要的事情。\n'
          + '3、每个人的行星周期从水星开始，到海王星结束一整年。水星的起始日期是每个人的生日当天，海王星的结束日期是下个生日的前一天。并非我们通常认为的从1月1日到12月31日。\n'
          + '4、除此之外，每年的牌阵中，还会有影响这一整年的5张牌，分别为【年度牌】【挑战牌】【结果牌】【祝福牌】【努力牌】，详细牌阵中会有其相关解释。\n'
          + '5、以下是你自己的行星周期列表:\n'
          + list;
        Deck.getOne(user['detail']['life_card'], age, function (err, deck1) {
          if (err) throw err;
          Deck.getOne(user['detail']['guard_card'], age, function (err, deck2) {
            if (err) throw err;
            if ((deck1 != null) && (deck2 != null)) {
              var level = cal_level(user['detail']['experience'])['level'],
                p = {
                  1: 1,
                  2: 1,
                  3: 1,
                  4: 2,
                  5: 2,
                  6: 2,
                  7: 3,
                  8: 3,
                  9: 4,
                  10: 5,
                  11: 6,
                  12: 7
                },
                cost = {
                  1: 2,
                  2: 2,
                  3: 2,
                  4: 2,
                  5: 2,
                  6: 2,
                  7: 1.5,
                  8: 1.5,
                  9: 1,
                  10: 0.5,
                  11: 0.5,
                  12: 0
                },
                cn = {
                  Mercury: '水星',
                  Venus: '金星',
                  Mars: '火星',
                  Jupiter: '木星',
                  Saturn: '土星',
                  Uranus: '天王星',
                  Neptune: '海王星'
                },
                allow_period = p[level],
                allow_end_time = new Date(Date.now() + allow_period * 4492800000);
              var response = {
                status: 'OK',
                data: {
                  info: {
                    detail: {
                      birthday: user['detail']['birthday'],
                      flag: user['detail']['flag'],
                      energy: user['detail']['energy'],
                      experience: user['detail']['experience'],
                      constellation: user['detail']['constellation'],
                      guard_card: user['detail']['guard_card'],
                      life_card: user['detail']['life_card'],
                      email: user['detail']['email'],
                      phone: user['detail']['phone'],
                      gender: user['detail']['gender'],
                      nickname: user['detail']['nickname']
                    },
                    last_login: user['last_login'],
                    purchased_music: user['purchased_music'],
                    contact: user['contact'],
                    stranger: user['stranger'],
                    time_line: user['time_line'],
                    online_duration: user['online_duration']
                  },
                  level: level,
                  allow_end_time: allow_end_time,
                  cost: cost[level],
                  secret_number: secret_number,
                  age: age,
                  period: period,
                  cn_period: cn[period],
                  content: content,
                  deck: {
                    life_card: deck1['cards'],
                    guard_card: deck2['cards']
                  }
                }
              };
              console.log(response);
              res.send(response)
            } else {
              response = {
                status: 'Invalid request',
                data: {}
              };
              res.send(response)
            }
          })
        });
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

exports.anytimeDeck = function(req, res) {
  var userId = req.header('userId'),
    token = req.header('token'),
    someday = req.header('someday');
  User.auth(userId, token, function (err, user) {
    if (user != null) {
      var birthday = user['detail']['birthday'],
        age = get_age(birthday, someday);
      Period.identify(birthday, someday, function (err, period) {
        if (err) throw err;
        var cn = {
          Mercury: '水星',
          Venus: '金星',
          Mars: '火星',
          Jupiter: '木星',
          Saturn: '土星',
          Uranus: '天王星',
          Neptune: '海王星'
        };
        var level = cal_level(user['detail']['experience'])['level'],
          p = {
            1: 1,
            2: 1,
            3: 1,
            4: 2,
            5: 2,
            6: 2,
            7: 3,
            8: 3,
            9: 4,
            10: 5,
            11: 6,
            12: 7,
            13: 7,
            14: 7
          },
          allow_period = p[level],
          allow_end_time = new Date(Date.now() + allow_period * 4492800000);
        if (new Date(someday) > allow_end_time) {
          var msg = '您将要查看的日期处于' + cn[period] + '周期，您当前的等级为' + level + ',没有权限查看';
          response = {
            status: 'OK',
            data: {
              content: msg
            }
          };
          res.send(response)
        } else {
          msg = '您的解读年龄为' + age + '您目前处于' + cn[period] + '行星周期，您目前等级为' + level + '，可以查看最多' + allow_period + '个周期牌阵，以下是当前周期牌阵解读';
          Deck.getOne(user['detail']['life_card'], age, function (err, deck1) {
            if (err) throw err;
            Deck.getOne(user['detail']['guard_card'], age, function (err, deck2) {
              if (err) throw err;
              if ((deck1 != null) && (deck2 != null)) {
                var response = {
                  status: 'OK',
                  data: {
                    age: age,
                    period: period,
                    cn_period: cn[period],
                    info: {
                      detail: {
                        life_card: user['detail']['life_card'],
                        guard_card: user['detail']['guard_card']
                      }
                    },
                    deck: {
                      life_card: deck1['cards'],
                      guard_card: deck2['cards']
                    },
                    content: msg
                  }
                };
                console.log(response);
                res.send(response)
              } else {
                response = {
                  status: 'Invalid request',
                  data: {}
                };
                res.send(response)
              }
            })
          })
        }
        console.log(msg);
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

exports.somedayDeck = function(req, res) {
  var userId = req.header('userId'),
    token = req.header('token'),
    someday = req.header('someday');
  User.auth(userId, token, function (err, user) {
    if (err) throw err;
    if (user != null) {
      var age = get_age(someday, Date.now());
      var birth = new Date(someday),
        month = birth.getMonth() + 1,
        date = birth.getDate(),
        str_birth = String(month * 100 + date);
      var cn = {
        Mercury: '水星',
        Venus: '金星',
        Mars: '火星',
        Jupiter: '木星',
        Saturn: '土星',
        Uranus: '天王星',
        Neptune: '海王星'
      };

      LifeGuardCard.findOne(str_birth, function (err, life_guard_card) {
        if (err) throw err;
        if (life_guard_card != null) {
          Period.identify(someday, Date.now(), function(err, period) {
            if (err) throw err;
            var msg = '您所查看的朋友年龄为' + age + '，当前处于' + cn[period] + '行星周期，您只可查看其当前周期牌阵与5张年度派';
            var life_card = life_guard_card['life_card'].split('或')[0],
              guard_card = life_guard_card['life_card'].split('或')[0];
            Deck.getOne(life_card, age, function (err, deck1) {
              if (err) throw err;
              Deck.getOne(guard_card, age, function (err, deck2) {
                if (err) throw err;
                if ((deck1 != null) && (deck2 != null)) {
                  var response = {
                    status: 'OK',
                    data: {
                      age: age,
                      period: period,
                      cn_period: cn[period],
                      info: {
                        detail: {
                          life_card: life_guard_card['life_card'],
                          guard_card: life_guard_card['guard_card']
                        }
                      },
                      deck: {
                        life_card: deck1['cards'],
                        guard_card: deck2['cards']
                      },
                      content: msg
                    }
                  };
                  console.log(response);
                  res.send(response)
                } else {
                  response = {
                    status: 'Invalid request',
                    data: {}
                  };
                  res.send(response)
                }
              })
            })
          })
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
          Period.identify(birthday, Date.now(), function (err, period, list) {
            if (err) throw err;
            Deck.getOne(contact['detail']['life_card'], age, function (err, deck1) {
              if (err) throw err;
              Deck.getOne(contact['detail']['guard_card'], age, function (err, deck2) {
                if (err) throw err;
                if ((deck1 != null) && (deck2 != null)) {
                  var level = cal_level(contact['detail']['experience'])['level'],
                    p = {
                      1: 1,
                      2: 1,
                      3: 1,
                      4: 2,
                      5: 2,
                      6: 2,
                      7: 3,
                      8: 3,
                      9: 4,
                      10: 5,
                      11: 6,
                      12: 7
                    },
                    cost = {
                      1: 2,
                      2: 2,
                      3: 2,
                      4: 2,
                      5: 2,
                      6: 2,
                      7: 1.5,
                      8: 1.5,
                      9: 1,
                      10: 0.5,
                      11: 0.5,
                      12: 0
                    },
                    cn = {
                      Mercury: '水星',
                      Venus: '金星',
                      Mars: '火星',
                      Jupiter: '木星',
                      Saturn: '土星',
                      Uranus: '天王星',
                      Neptune: '海王星'
                    },
                    allow_period = p[level],
                    allow_end_time = new Date(Date.now() + allow_period * 4492800000);
                  Message.lastOne(userId, contactId, function(err, message) {
                    if (err) throw err;
                    if (message == undefined) {
                      message = null;
                    }
                    var response = {
                      status: 'OK',
                      data: {
                        info: {
                          detail: {
                            birthday: contact['detail']['birthday'],
                            flag: contact['detail']['flag'],
                            energy: contact['detail']['energy'],
                            experience: contact['detail']['experience'],
                            constellation: contact['detail']['constellation'],
                            guard_card: contact['detail']['guard_card'],
                            life_card: contact['detail']['life_card'],
                            email: contact['detail']['email'],
                            phone: contact['detail']['phone'],
                            gender: contact['detail']['gender'],
                            nickname: contact['detail']['nickname']
                          },
                          last_login: user['last_login'],
                          purchased_music: user['purchased_music'],
                          contact: user['contact'],
                          stranger: user['stranger'],
                          time_line: user['time_line'],
                          online_duration: user['online_duration']
                        },
                        level: level,
                        allow_end_time: allow_end_time,
                        cost: cost[level],
                        age: age,
                        period: period,
                        cn_period: cn[period],
                        deck: {
                          life_card: deck1['cards'],
                          guard_card: deck2['cards']
                        },
                        last_message: message

                      }
                    };
                    console.log(response);
                    res.send(response)
                  })
                } else {
                  response = {
                    status: 'Invalid request',
                    data: {}
                  };
                  res.send(response)
                }
              })
            })
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

exports.contactList = function(req, res) {
  var userId = req.header('userId'),
    token = req.header('token');
  User.auth(userId, token, function (err, user) {
    if (err) throw err;
    if (user != null) {
      User.contactList(userId, function (err, list) {
        Message.lastTime(userId, function (err, lastTime) {
          if (err) throw err;
          var tmp = [];
          for (var i = 0; i < list.length; i++) {
            tmp[i] = {
              _id: list[i]['_id'],
              nickname: list[i]['detail']['nickname'],
              last_time: lastTime[list[i]['_id']]
            }
          }
          tmp.sort(getSortFun('dasc', 'last_time'));
          var response = {
            status: 'OK',
            data: {
              list: tmp
            }
          };
          res.send(response)
        })
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
      var life_card = life_guard_card['life_card'].split('或')[0];
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

exports.promotion = function(birthday, callback) {
  var someday = new Date(Date.now()),
    age = get_age(birthday, someday),
    month = birthday.getMonth() + 1,
    date = birthday.getDate(),
    str_birth = String(month * 100 + date);
  LifeGuardCard.findOne(str_birth, function(err, life_guard_card) {
    var life_card = life_guard_card['life_card'].split('或')[0];
    Deck.getOne(life_card, age, function (err, deck) {
      var spec = 'long_term',
        card = deck['cards'][spec][0];
      if (err) throw err;
      if (deck!=null) {
        Solution.findOne(card, function (err, solution) {
          var txt = '我们知道你的\n年龄：' + age + '\n星座：' + get_constellation(month * 100 + date)
            + '\n生命数字：' + get_secret_number(birthday) + '\n我们还知道你今年所面临的\n一些事情：\n\n' + solution[spec];
          callback(txt + '\n（此处还有一万字已略去）')
        })
      }  else {
        callback('error')
      }
    })
  })
};

exports.deckIntro = function(req, res) {
  var content = '1、每个人都有两张伴随其一生的牌，从出生那天起这两张牌所赋予的智慧与情感就融于每个人的命运之中。其中一张牌叫做【生命牌】，是我们每个人的灵魂特征，也是最重要的一张牌；另外一张叫【行星守护牌】，是我们每个人生活中的特征表现，仅次于生命牌。（本版中我们不对两张牌做详细解释。)\n'
    + '2、【生命牌】与【行星守护牌】从0-99岁，都有一套完整的牌阵，每年的牌阵都不相同。每个牌阵又分7个行星周期（水星、金星、火星、木星、土星、 天王星、海王星），每个行星周期到下个行星周期的天数为52天，7个周期为52*7=364天，构成一整年（12月31日出生的人，没有行星周期，但这天出生的人，生命牌可以是任意一张。）每个行星周期周期对应1或者2张牌，每张行星周期牌都有不同的解释，告诉你这个周期你需要面对哪些重要的事情。\n'
    + '3、每个人的行星周期从水星开始，到海王星结束一整年。水星的起始日期是每个人的生日当天，海王星的结束日期是下个生日的前一天。并非我们通常认为的从1月1日到12月31日。\n'
    + '4、除此之外，每年的牌阵中，还会有影响这一整年的5张牌，分别为【年度牌】【挑战牌】【结果牌】【祝福牌】【努力牌】，详细牌阵中会有其相关解释。\n'
    + '5、以下是你自己的行星周期列表';
  res.send(content);
};

exports.cardSolution = function(req, res) {
  var card = req.body.card,
    spec = req.body.spec;
  card = card.split(',');
  console.log(card);
  var sol="";
  Solution.findOne(card[0], function (err, solution) {
    if (err) throw err;
    if (solution != null) {
      sol += card[0] + ':\n' + solution[spec] + '\n';
      if (card.length>1) {
        Solution.findOne(card[1], function (err, solution) {
          if (err) throw err;
          if (solution != null) {
            sol += card[1] + ':\n' + solution[spec] + '\n';
          }
          var response = {
            status: 'OK',
            data: {
              solution: sol
            }
          };
          res.send(response)
        })
      } else {
        response = {
          status: 'OK',
          data: {
            solution: sol
          }
        };
        res.send(response);
      }
      //sol = sol.replace(/[0-9,]*/g,"");
      console.log(sol)
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
                        } else {
                          brightest = '无'
                        }
                        User.countGenderInConstellation(1, constellation, function (err, man) {
                          var male = man, female = count - male;
                          var response = {
                            status: 'OK',
                            data: {
                              constellation: constellation,
                              duration: result.duration,
                              content: result.content,
                              count: count.toString(),
                              active: active.toString(),
                              rank: rank.toString(),
                              msg: msg.toString(),
                              brightest: brightest,
                              male: male.toString(),
                              female: female.toString()
                            }
                          };
                          console.log(response);
                          res.send(response)
                        })
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
  })
};


//user behavior
exports.login = function(req, res) {
  var username = req.body.username,
    password = req.body.password,
    x = req.body.x,
    y = req.body.y,
    z = req.body.z,
    city = req.body.city,
    device_token = req.body.device_token,
    ip = req['_remoteAddress'].split(':').pop();

  if (device_token == undefined) {
    device_token = '1';
  }
  if ((x == undefined)||(y == undefined)||(z == undefined)) {
    x = 0; y = 0; z = 0;
  }

  User.login(username, password, function (err, user) {
    if (err) throw err;
    if (user != null) {
      var userInfo = {
        city: city,
        device: device_token,
        avatar: user['detail']['avatar'],
        nickname:user['detail']['nickname']
      };
      Six.update(user['_id'].toString(), userInfo, function(){
        var addition = user['last_login']['alive_time'] - user['last_login']['time'],
          duration = user['online_duration'] + addition;
        var userId = user['_id'],
          plaintext = user['username'] + Date.now(),
          token = crypto.createHash('md5').update(plaintext).digest('hex');
        var last_login = {
          token: token,
          online_duration: duration,
          'last_login.ip': ip,
          'last_login.x': x,
          'last_login.y': y,
          'last_login.z': z,
          'last_login.city': city,
          'last_login.time': Date.now(),
          'last_login.alive_time': Date.now(),
          'last_login.device': device_token
        };
        if (user['last_login']['time'] == null) {
          var virgin = 'true';
        } else {
          virgin = 'false';
        }
        User.setLogin(userId, last_login, function () {
          if (err) throw err;
          var response = {
            status: 'OK',
            data: {
              userId: userId,
              token: token,
              virgin: virgin
            }
          };
          console.log(response);
          res.send(response)
        });
      });

    } else {
      var response = {
        status: 'Not found',
        data: {}
      };
      console.log(response);
      res.send(response)
    }
  })
};

exports.locate = function(req, res) {
  var userId = req.body.userId,
    token = req.body.token,
    x = req.body.x,
    y = req.body.y,
    z = req.body.z,
    city = req.body.city;

  var userInfo = {
    city: city
  };

  User.auth(userId, token, function (err, user) {
    if (err) throw err;
    if (user != null) {
      Six.update(userId, userInfo, function () {
        var last_login = {
          'last_login.x': x,
          'last_login.y': y,
          'last_login.z': z,
          'last_login.city': city
        };
        User.setLogin(userId, last_login, function () {
          if (err) throw err;
          var response = {
            status: 'OK',
            data: {
              userId: userId
            }
          };
          console.log(response);
          res.send(response)
        });
      });
    } else {
      var response = {
        status: 'Not found',
        data: {}
      };
      res.send(response)
    }
  })
}

exports.register = function(req, res) {
  var nickname = req.header('nickname'),
    birthday = req.header('birthday'),
    gender = req.header('gender'),
    phone = req.header('phone'),
    email = req.header('email'),
    password = req.header('password');
  User.checkNick(nickname, function (err, user) {
    if (user != null) {
      var response = {
        status: 'Nickname already exists',
        data: {}
      };
      console.log(response);
      res.send(response)
    } else {
      User.checkPhone(phone, function (err, user) {
        if (user != null) {
          var response = {
            status: 'Phone already exists',
            data: {}
          };
          console.log(response);
          res.send(response)
        } else {
          User.checkEmail(email, function (err, user) {
            if (user != null) {
              var response = {
                status: 'Email already exists',
                data: {}
              };
              console.log(response);
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
                if (life_guard_card != null) {
                  var life_card = life_guard_card['life_card'].split('或')[0],
                    guard_card = life_guard_card['life_card'].split('或')[0],
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
                        life_card: life_card,
                        guard_card: guard_card,
                        constellation: constellation,
                        energy: 0,
                        experience: 0,
                        balance: 0,
                        flag: 1
                      },
                      time_line: [],
                      purchased_music: [],
                      contact: [],
                      stranger: [],
                      last_login: {
                        ip: '1.1.1.1',
                        x: 0,
                        y: 0,
                        z: 0,
                        time: null,
                        alive_time: null,
                        device: ''
                      },
                      left_chance: 2,
                      online_duration: 0
                    });
                    newUser.save(function (err, user) {
                      console.log(user);
                      var response = {
                        status: 'OK',
                        data: {
                          username: user['username']
                        }
                      };
                      console.log(response);
                      res.send(response)
                    });
                  });
                } else {
                  var response = {
                    status: 'Invalid request',
                    data: {}
                  };
                  console.log(response);
                  res.send(response)
                }
              });
            }
          })
        }
      })
    }
  })
};

exports.editProfile = function(req, res) {
  var userId = req.header('userId'),
    token = req.header('token'),
    nickname = req.body.nickname,
    birthday = req.body.birthday,
    gender = req.body.gender;

  var birth = new Date(birthday),
    month = birth.getMonth() + 1,
    date = birth.getDate(),
    str_birth = String(month * 100 + date),
    int_birth = parseInt(str_birth),
    constellation = get_constellation(int_birth);

  User.auth(userId, token, function(err, user){
    if (err) throw err;
    if (user != null) {
      if (user['detail']['flag'] == 1) {
        LifeGuardCard.findOne(str_birth, function (err, life_guard_card) {
          if (err) throw err;
          if (life_guard_card != null) {
            var life_card = life_guard_card['life_card'].split('或')[0];
            var detail = user['detail'];
            detail['nickname'] = nickname;
            detail['birthday'] = birthday;
            detail['gender'] = gender;
            detail['life_card'] = life_guard_card['life_card'];
            detail['guard_card'] = life_guard_card['guard_card'];
            detail['constellation'] = constellation;
            detail['flag'] = 0;
            User.modify(user['_id'], detail, function(err){
              if (err) throw err;
              var response = {
                status: 'OK',
                data: {
                  detail: detail
                }
              };
              console.log(response);
              res.send(response)
            });
          } else {
            var response = {
              status: 'Invalid request',
              data: {}
            };
            console.log(response);
            res.send(response)
          }
        });
      } else {
        var response = {
          status: 'No chance to edit',
          data: {}
        };
        res.send(response)
      }
    } else {
      response = {
        status: 'Token error',
        data: {}
      };
      res.send(response)
    }
  })
};

exports.uploadAvatar = function(req, res) {
  var userId = req.header('userId'),
    token = req.header('token');
  User.auth(userId, token, function (err, user) {
    if (err) throw err;
    if (user != null) {
      var tmp_path = req.files.avatar.path,
        target_name = user['username'] + '.' + req.files.avatar.name.split('.')[1],
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
                size: req.files.avatar.size + 'bytes'
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

exports.uploadContact = function(req, res) {
  var userId = req.header('userId'),
    token = req.header('token'),
    contact = req.header('contact').split(',');
  User.auth(userId, token, function (err, user) {
    if (err) throw err;
    if (user != null) {
      for (var i=0;i<contact.length;i++) {
        var phone_len = contact[i].length;
        if (phone_len> 11) {
          contact[i] = contact[i].slice(phone_len - 11, phone_len)
        }
      }
      for (i=0;i<user['contact'].length;i++) {
        if (if_contains(contact, user['contact'][i])) {
          console.log('pass')
        } else {
          contact[contact.length] = user['contact'][i];
        }
      }
      User.setContact(userId, contact, function () {
        if (err) throw err;
        response = {
          status: 'OK',
          data: {
            contact: contact
          }
        };
        res.send(response);
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

exports.checkContact = function(req, res) {
  var userId = req.header('userId'),
    token = req.header('token'),
    contact = req.header('contact').split(',');
  User.auth(userId, token, function (err, user) {
    if (err) throw err;
    if (user != null) {
      User.checkContact(contact, function (err, users) {
        if (err) throw err;
        var list =[];
        for (var i=0;i<users.length;i++){
          list[list.length] = {
            userId: users[i]['_id'],
            phone: users[i]['detail']['phone']
          }
        }
        var response = {
          status: 'OK',
          data: {
            contact: list
          }
        };
        res.send(response);
      })
    } else {
      var response = {
        status: 'Token error',
        data: {}
      };
      res.send(response)
    }
  });
};

exports.earnExp = function(req, res) {
  var userId = req.header('userId'),
    token = req.header('token'),
    action = req.header('action');
  var addition = {
    'attend': 10,
    'six': 30,
    'invite': 100,
    'accept': 20,
    'assist': 40
  };
  User.auth(userId, token, function(err) {
    if (err) throw err;
    User.addExp(userId, addition[action], function(err, experience){
      if (err) throw err;
      var response = {
        Amount: experience,
        Lvl: cal_level(experience)['level'],
        Exp: cal_level(experience)['exp']
      };
      res.send(response)
    })
  });
};

exports.alive = function(req, res) {
  var userId = req.header('userId'),
    token = req.header('token');
  User.auth(userId, token, function (err, user) {
    var last_alive = user['last_login']['alive_time'];

    if (err) throw err;
    if (user != null) {
      var verify_login_interval = function(callback) {
        if ((Date.now() - last_alive) > 600000) {
          var addition = last_alive - user['last_login']['time'],
            duration = user['online_duration'] + addition;
          var last_login = {
            'last_login.time': Date.now(),
            online_duration: duration
          };
          User.verifyInterval(user['_id'], last_login, function(err){
            if (err) throw err;
            callback()
          })
        } else {
          callback()
        }
      };
      verify_login_interval(function(){
        User.alive(userId, function (err) {
          if (err) throw err;
          var username = user['username'];
          Message.receive(username, function (err, record) {
            console.log(record);
            var response = {
              status: 'OK',
              data: {
                login: user['last_login'],
                messages: record
              }
            };
            res.send(response)
          })
        })
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


//message
exports.sendMessage = function(req, res) {
  var userId = req.body.userId,
    token = req.body.token;
  User.auth(userId, token, function (err, user) {
    if (user != null) {
      var constellation = user['detail']['constellation'],
        nickname = user['detail']['nickname'],
        to = req.body.to,
        msg = req.body.msg;
      console.log(msg)
      var message = {
        from: {
          userId: userId,
          nickname: nickname,
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
      Message.receive(userId, function (err, record) {
        if (err) throw err;
        if (record.length == 0) {
          record = null;
        }
        var response = {
          status: 'OK',
          data: {
            messages: record
          }
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

exports.historyMessage = function(req, res) {
  var userId = req.header('userId'),
    token = req.header('token'),
    contactId = req.header('contactId');
  User.auth(userId, token, function (err, user) {
    if (err) throw err;
    if (user != null) {
      Message.history(userId, contactId, function (err, record) {
        if (err) throw err;
        var response = {
          status: 'OK',
          data: {
            messages: record
          }
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

exports.confirmMessage = function(req, res) {
  var userId = req.header('userId'),
    token = req.header('token'),
    msgIds = req.header('msgIds').split(',');

  User.auth(userId, token, function (err, user) {
    if (err) throw err;
    if (user != null) {
      Message.confirm(userId, msgIds, function (err) {
        console.log(msgIds)
        if (err) throw err;
        var response = {
          status: 'OK',
          data: {}
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


//music
exports.purchaseMusic = function(req, res) {
  var userId = req.header('userId'),
    token = req.header('token'),
    musicId = req.header('musicId');
  User.auth(userId, token, function(err, user) {
    if (err) throw err;
    if (user != null) {
      var purchased = user['purchased_music'];
      if (if_contains(purchased, musicId)){
        console.log('pass')
      } else {
        purchased[purchased.length] = musicId;
      }
      User.purchaseMusic(userId, purchased, function(err){
        if (err) throw err;
        var response = {
          status: 'OK',
          data: {
            purchased: purchased
          }
        };
        res.send(response);
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

exports.likeMusic = function(req, res) {
  var userId = req.header('userId'),
    token = req.header('token'),
    musicId = req.header('musicId');
  User.auth(userId, token, function(err, user) {
    if (err) throw err;
    if (user != null) {
      Music.like(musicId, userId, function(err, list) {
        if (err) throw err;
        var response = {
          status: 'OK',
          data: {
            like: list
          }
        };
        res.send(response);
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

exports.fetchMusicList = function(req, res) {
  var userId = req.header('userId'),
    token = req.header('token');
  User.auth(userId, token, function (err, user) {
    if (err) throw err;
    if (user != null) {
      Music.list(user['_id'], function (err, list, like, purchased) {
        if (err) throw err;
        var response = {
          status: 'OK',
          data: {
            list: list,
            like: like,
            purchased: purchased
          }
        };
        res.send(response);
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


//match
exports.findMatch = function(req, res) {
  User.get_all(function (results) {
    results = random_array(results);
    var matches = [];
    var l = results.length;
    for (var i = 0; i < parseInt(l / 2); i++) {
      var get_match = function(callback){
        var max=0, begin = 0, end = 1;
        for (var j = 1; j < l - 2 * i; j++) {
          var value = get_match_value(results[0], results[j]);
          if ((if_contains(results[0]['stranger'], results[j]['_id'].toString()))
            ||(if_contains(results[j]['stranger'], results[0]['_id'].toString()))){
            value = 0;
          }
          if (value>max) {
            max = value;
            begin = 0;
            end = j;
          }
        }
        callback(begin, end, max)
      };
      get_match(function (begin, end, max) {
        if (max > 0) {
          const beginId = results[begin]['_id'],
            endId = results[end]['_id'];
          matches[matches.length] = {
            begin: results[begin]['_id'],
            end: results[end]['_id'],
            value: max,
            time: Date.now(),
            status: 0
          };
          var newMatch = new Match(matches.length);
          newMatch.save(function (err) {
            if (err) throw err;
            User.incChance(beginId, -1, function (err) {
              if (err) throw err;
              User.incChance(endId, -1, function (err) {
                if (err) throw err;
                User.addTimeLine(beginId, {event: 'new match', time: Date.now()}, function (err) {
                  if (err) throw err;
                  User.addTimeLine(endId, {event: 'new match', time: Date.now()}, function (err) {
                    if (err) throw err;
                  })
                })
              })
            });
          });
        }
        apple_push(results[begin]['last_login']['device'],
          'You got a new match!',
          {type: 'match', begin: Date.now().toString()});
        apple_push(results[end]['last_login']['device'],
          'You got a new match!',
          {type: 'match', end: Date.now().toString()});
        results = results.slice(0, end).concat(results.slice(end + 1));
        results = results.slice(1);
      })
    }
    var response = {
      status: 'OK',
      data: {
        matches: matches
      }
    };
    console.log(response);
    res.send(response)
  })
};

exports.acceptMatch = function(req, res) {
  var userId = req.header('userId'),
    token = req.header('token'),
    matchId = req.header('matchId');
  User.auth(userId, token, function(err, user){
    var deviceId = user['last_login']['device'];
    Match.accept(matchId, userId, function(err, targetId, status){
      if (status == 3) {
        User.info(targetId, function(err, target) {
          apple_push(deviceId, 'Match complete', {});
          apple_push(target['last_login']['device'], 'Match complete', {});
          var strangers = user['stranger'];
          if (strangers.length < 36) {
            if (if_contains(strangers, targetId)) {
            } else {
              strangers[strangers.length] = targetId;
              User.setStranger(userId, strangers, function(err) {
                if (err) throw err;
                var target_strangers = target['stranger'];
                if (target_strangers.length < 36) {
                  if (if_contains(target_strangers, userId)) {
                  } else {
                    target_strangers[target_strangers.length] = userId;
                    User.setStranger(targetId, target_strangers, function(err) {
                      if (err) throw err;
                      User.addTimeLine(targetId, {event: 'match complete', time: Date.now()}, function (err) {
                        if (err) throw err;
                        User.addTimeLine(userId, {event: 'match complete', time: Date.now()}, function (err) {
                          if (err) throw err;
                          var response = {
                            status: 'OK',
                            data: {
                              status: status
                            }
                          };
                          console.log(response);
                          res.send(response)
                        })
                      })
                    })
                  }
                }
              })
            }
          }
        });
      } else {
        User.addTimeLine(targetId, {event: 'match accepted', time: Date.now()}, function (err) {
          if (err) throw err;
          User.addTimeLine(userId, {event: 'match accepted', time: Date.now()}, function (err) {
            if (err) throw err;
            var response = {
              status: 'OK',
              data: {
                status: status
              }
            };
            console.log(response);
            res.send(response)
          })
        })
      }
    });
  });
};

exports.rejectMatch = function(req, res) {
  var userId = req.header('userId'),
    token = req.header('token'),
    matchId = req.header('matchId');
  User.auth(userId, token, function(err, user){
    var deviceId = user['last_login']['device'];
    Match.reject(matchId, userId, function(err, targetId, status){
      User.info(targetId, function(err, target) {
        apple_push(deviceId, 'Match denied', {});
        apple_push(target['last_login']['device'], 'Match denied', {});
        User.incChance(target['_id'], 1, function(err){
          if (err) throw err;
          console.log(target['_id']);
          User.addTimeLine(targetId, {event: 'match rejected', time: Date.now()}, function (err) {
            if (err) throw err;
            User.addTimeLine(userId, {event: 'match rejected', time: Date.now()}, function (err) {
              if (err) throw err;
              var response = {
                status: 'OK',
                data: {
                  status: status
                }
              };
              console.log(response);
              res.send(response)
            })
          })
        });
      })
    })
  })
};

exports.uploadStranger = function(req, res) {
  var userId = req.header('userId'),
    token = req.header('token'),
    strangerId = req.header('strangerId');
  User.auth(userId, token, function (err, user) {
    if (err) throw err;
    if (user != null) {
      var strangers = user['stranger'];
      if (strangers.length < 36) {
        if (if_contains(strangers, strangerId)) {
        } else {
          strangers[strangers.length] = strangerId;

          console.log(strangers);
          User.setStranger(userId, strangers, function(err) {
            if (err) throw err;
          })
        }
        var response = {
          status: 'OK',
          data: {
            strangers: strangers
          }
        };
        res.send(response)
      } else {
        response = {
          status: '36',
          data: {}
        };
        res.send(response)
      }
    } else {
      response = {
        status: 'Not found',
        data: {}
      };
      res.send(response)
    }
  })
};

exports.delStranger = function(req, res) {
  var userId = req.header('userId'),
    token = req.header('token'),
    strangerId = req.header('strangerId');
  User.auth(userId, token, function (err, user) {
    if (err) throw err;
    if (user != null) {
      var strangers = user['stranger'];
      if (if_contains(strangers, strangerId)) {
        for (var i=0;i<strangers.length;i++){
          if (strangerId==strangers[i]) {
            strangers = strangers.slice(0, i).concat(strangers.slice(i+1));
            User.setStranger(userId, strangers, function(err) {
              if (err) throw err;
            });
            break;
          }
        }
      }
      var response = {
        status: 'OK',
        data: {
          strangers: strangers
        }
      };
      res.send(response)
    } else {
      response = {
        status: 'Not found',
        data: {}
      };
      res.send(response)
    }
  })
};


//six degree
exports.newSix = function(req, res) {
  var userId = req.header('userId'),
    token = req.header('token');
  User.auth(userId, token, function (err, user) {
    if (err) throw err;
    if (user != null) {
      Six.fetchAll(userId, function(err, sixes) {
        var list = [];
        sixes.forEach(function(six) {
          var flag = 0;
          for (var i = 0; i < six['chain'].length; i++) {
            if ((six['chain'][i]['userId'] == userId) && (six['chain'][i]['isRead'] != 1)) {
              flag = 1;
            }
          }
          if (flag ==1) {
            list[list.length] = {
              sixId: six['_id'],
              status: six['status'],
              chain: six['chain']
            }
          }
        });
        if (err) throw err;
        var response = {
          status: 'OK',
          data: {
            list: list
          }
        };
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
};

exports.allSix = function(req, res) {
  var userId = req.header('userId'),
    token = req.header('token');
  User.auth(userId, token, function (err, user) {
    if (err) throw err;
    if (user != null) {
      Six.fetchAll(userId, function(err, sixes) {
        var list = [];
        sixes.forEach(function(six){
          list[list.length] = {
            sixId: six['_id'],
            status: six['status'],
            target: six['target'],
            chain: six['chain']
          }
        });
        if (err) throw err;
        if (list.length == 0) {
          list = null
        }
        var response = {
          status: 'OK',
          data: {
            list: list
          }
        };
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
};

exports.pickSix = function(req, res) {
  var userId = req.header('userId'),
    token = req.header('token');
  User.auth(userId, token, function (err, user) {
    if (err) throw err;
    if (user != null) {
      User.targetList(target_list, function(err, target_users){
        var response = {
          status: 'OK',
          data: {
            list: target_users
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

exports.readSix = function(req, res) {
  var userId = req.header('userId'),
    token = req.header('token'),
    sixId = req.header('sixId');
  User.auth(userId, token, function (err, user) {
    if (err) throw err;
    if (user != null) {
      Six.read(sixId, userId, function(err, chain){
        var response = {
          status: 'OK',
          data: {
            chain: chain
          }
        };
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
};

exports.establishSix = function(req, res) {
  var userId = req.header('userId'),
    token = req.header('token'),
    targetId = req.header('targetId'),
    context = req.body.context;
  User.auth(userId, token, function (err, user) {
    if (err) throw err;
    if (user != null) {
      User.info(targetId, function(err, target) {
        if (err) throw err;
        var newSix = new Six({
          establish: userId,
          target: {
            id: targetId,
            city: target['last_login']['city'],
            nickname: target['detail']['nickname'],
            avatar: target['detail']['avatar']
          },
          context: context,
          chain: [{
            position: 0,
            userId: userId,
            city: user['last_login']['city'],
            nickname: user['detail']['nickname'],
            avatar: user['detail']['avatar'],
            device: user['last_login']['device'],
            time: new Date(Date.now()),
            isRead: 1
          }],
          update_time: new Date(Date.now()),
          status: 0
        });
        newSix.save(function (err, six) {
          console.log(six);
          User.addTimeLine(userId, {event: 'six degree established', time: Date.now()}, function (err) {
            if (err) throw err;
            var response = {
              status: 'OK',
              data: {
                six: six
              }
            };
            res.send(response)
          })
        });
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

exports.passSix = function(req, res) {
  var userId = req.header('userId'),
    token = req.header('token'),
    sixId = req.header('sixId'),
    nextId = req.header('nextId');
  User.auth(userId, token, function (err, user) {
    if (err) throw err;
    if (user != null) {
      Six.fetch(sixId, function(err, six) {
        var chain = six['chain'],
          status = six['status'];
        console.log(chain);
        var pre = function (callback) {
          if (err) throw err;
          User.info(nextId, function(err, next){
            if (err) throw err;
            chain[chain.length] = {
              position: chain.length,
              userId: nextId,
              city: next['last_login']['city'],
              nickname: next['detail']['nickname'],
              avatar: next['detail']['avatar'],
              device: next['last_login']['device'],
              time: new Date(Date.now()),
              isRead: 0
            };
            for (var i = 0; i < chain.length - 2; i++) {
              User.addTimeLine(six['chain'][i]['userId'], {event: 'six degree pass', time: Date.now()}, function (err) {
                if (err) throw err;

              });
              apple_push(six['chain'][i]['device'],
                'You got a new six degree msg!',
                {type: 'six', chain: chain})
            }
            callback()
          });
        };
        pre(function(){
          Six.pass(sixId, chain, function (err) {
            if (err) throw err;
            var response = {
              status: 'OK',
              data: {
                chain: chain,
                status: status
              }
            };
            res.send(response)
          });
        })
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

exports.generateInvitation = function(req, res) {
  var userId = req.header('userId'),
    token = req.header('token'),
    sixId = req.header('sixId');
  User.auth(userId, token, function (err, user) {
    if (err) throw err;
    if (user != null) {
      Invitation.genCode(function(err, code){
        if (err) throw err;
        var newInvitation = new Invitation({
          code: code,
          sixId: sixId,
          time: new Date(Date.now())
        });
        newInvitation.save(function (err) {
          if (err) throw err;
          var response = {
            status: 'OK',
            data: {
              code: code
            }
          };
          res.send(response)
        });
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

exports.acceptInvitation = function(req, res) {
  var userId = req.header('userId'),
    token = req.header('token'),
    code = req.header('code');
  User.auth(userId, token, function (err, user) {
    if (err) throw err;
    if (user != null) {
      Invitation.acceptCode(code, function(err, invitation){
        if (err) throw err;
        Six.fetch(invitation['sixId'], function(err, six){
          if (err) throw err;
          var chain = six['chain'],
            status = six['status'];
          chain[chain.length] ={
            position: chain.length,
            userId: userId,
            time: new Date(Date.now())
          };
          Six.pass(six['_id'], chain, function(err){
            if (err) throw err;
            var response = {
              status: 'OK',
              data: {
                chain: chain,
                status: status
              }
            };
            res.send(response)
          });
        });
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

exports.completeSix = function(req, res) {
  var userId = req.header('userId'),
    token = req.header('token'),
    sixId = req.header('sixId');
  User.auth(userId, token, function (err, user) {
    if (err) throw err;
    if (user != null) {
      Six.fetch(sixId, function(err, six){
        if (err) throw err;
        var chain = six['chain'],
          status = six['status'];
        var pre = function(callback) {
          for (var i = 0; i < chain.length - 1; i++) {
            console.log(six['chain'][i]['userId']);
            User.addTimeLine(six['chain'][i]['userId'], {
              event: 'six degree complete',
              time: Date.now()
            }, function (err) {
              if (err) throw err;
            });
            apple_push(six['chain'][i]['device'],
              'Six degree complete!',
              {type: 'six', chain: chain})
          }
          callback()
        };
        pre(function() {
          Six.complete(sixId, function (err) {
            if (err) throw err;
            var response = {
              status: 'OK',
              data: {
                chain: chain,
                status: status
              }
            };
            res.send(response)
          });
        })
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



exports.get_age = get_age;
exports.if_contains = if_contains;