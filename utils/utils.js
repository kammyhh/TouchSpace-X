/**
 * Created by hh on 15/6/29.
 */
//Modules
var apn = require('apn');
var async = require('async');
var crypto = require('crypto');
var fs = require('fs');
var http = require('http');
var querystring = require('querystring');
var log = require('./log').errorLogger;
var nodemailer = require("nodemailer");
//Instantiated ccap class
//var ccap = require('ccap')();
//Models
var Value = require('./value.js');
var Chat_history = require('./../models/chat_history.js');
var Star_history = require('./../models/star_history.js');
var Characteristic = require('./../models/characteristic.js');
var Constellation = require('./../models/constellation.js');
var Deck = require('./../models/deck.js');
var Invitation = require('./../models/invitation.js');
var Identity = require('./../models/identity.js');
var LifeGuardCard = require('./../models/life_guard_card.js');
var Match = require('./../models/match.js');
var Message = require('./../models/message.js');
var Music = require('./../models/music.js');
var Notification = require('./../models/notification.js');
var Period = require('./../models/period.js');
var Six = require('./../models/six.js');
var Solution = require('./../models/solution.js');
var User = require('./../models/user.js');
var Version = require('./../models/version.js');

//Ccap for reg.html
//var code_txt = 0;
//
//exports.get_code_txt = function (req, res) {
//  res.send(code_txt);
//};
//
//exports.get_code_img = function (req, res) {
//  var ary = ccap.get();
//  var buf = ary[1];
//  code_txt = ary[0];
//  res.send(buf, txt);
//  console.log(ary);
//};


//=========================================================
//                       Push API
//=========================================================

//Apple push
var applePush = function (device_token, title, content) {
  var token = device_token; //长度为64的设备Token
  if (token == Value.empty_device_token) {
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


//=========================================================
//                       Email API
//=========================================================

//Send email
var sendEmail = function (address, subject, html) {
  // create reusable transporter object using SMTP transport
  var transporter = nodemailer.createTransport(Value.email_transporter);
  var mailOptions = {
    from: Value.email_transporter.address, // sender address
    to: address, // list of receivers
    subject: subject, // Subject line
    html: html // html body
  };
// send mail with defined transport object
  transporter.sendMail(mailOptions, function(error, info){
    if(error){
      return console.log(error);
    }
    log.info('Email sent to: ' + address + ' ' + info.response);
    return 'Email sent: ' + info.response
  });
};

//Activate email
var activateEmail = function (address, username, nickname) {
  var subject = '绑定邮箱',
    html = '<td style="font-family:"Microsoft Yahei"">' +
      '<p style="font-size:22px;font-family:"Microsoft Yahei"">亲爱的 ' + nickname + '，您好</p>' +
      '请点击以下链接来绑定您的 TouchSpaceX 邮箱：<br>' +
      '<a href="http://localhost:3000/api/bindEmail?username=' + username + '" target="_blank" style="color:#148cf1">http://localhost:3000/api/bindEmail?username=' + username + '</a>' +
      '<br>如果以上链接无法打开，请把上面网页地址复制到浏览器地址栏中打开（该链接在' + Value.bind_limit * 24 + '小时内有效）</p>' +
      '<p style="margin-top:40px; border-top:solid 1px #f2f2f2; padding-top:20px; font-size:12px; line-height:20px; color:#999;font-family:"Microsoft Yahei";">本邮件由TouchSpaceX系统自动发出，请勿直接回复哦。' +
      '<br>如果您有任何疑问或建议，可以通过邮箱<a href="mailto:service@touchspacex.com" style="color:#148cf1" target="_blank">service@touchspacex.com</a> 联系我们</p></p></td>';
  console.log(html);
  Identity.clear(username, function(){
    var newIdentity = new Identity({
      code: username,
      phone: address,
      time: new Date(Date.now())
    });
    newIdentity.save(function (err) {
      if (err) throw err;
    });
    sendEmail(address, subject, html);
  });
};

//Bind email
exports.bindEmail = function (req, res) {
  var username = req.query.username;
  Identity.bind(username, function (err, result) {
    if (err) throw err;
    if (result.status == 'OK') {
      User.changeEmail(username, result.address, function(){
        var response = {
          status: result.status,
          data: {}
        };
        res.send(response);
        Identity.clear(username, function(){});
      });
    } else {
      var response = {
        status: result.status,
        data: {}
      };
      res.send(response)
    }
  });
};


//=========================================================
//                    Array Operation
//=========================================================

//If an array contains obj
var ifContains = function (arr, obj) {
  var i = arr.length;
  while (i--) {
    if (arr[i] === obj) {
      return true;
    }
  }
  return false;
};

//Randomize an array
var randomArray = function (arr) {
  var a = arr;
  var rand_arr = [], rand;
  for (var i = 0; i < arr.length; i++) {
    rand = parseInt(Math.random() * (arr.length - i));
    rand_arr[i] = a[rand];
    a = a.slice(0, rand).concat(a.slice(rand + 1));
  }
  return rand_arr;
};

//time_line.sort(getSortFun('asc', 'time'));
var getSortFun = function (order, sortBy) {
  var ord_alpha = (order == 'asc') ? '>' : '<';
  return new Function('a', 'b', 'return a.' + sortBy + ord_alpha + 'b.' + sortBy + '?1:-1');
};


//=========================================================
//                   Value Calculation
//=========================================================

//Birthday: Date object
var get_age = function (birthday, today) {
  var birth = new Date(birthday),
    year = birth.getFullYear(),
    month = birth.getMonth() + 1,
    date = birth.getDate(),
    now = new Date(today),
    y = now.getFullYear(),
    m = now.getMonth() + 1,
    d = now.getDate(),
    age;
  if (d < date) m--;
  if (m < month) y--;
  age = y - year;
  return age;
};

//Birthday format: MMDD
var get_constellation = function (birthday) {
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

//Birthday: Date object
var get_secret_number = function (birthday) {
  var birth = new Date(birthday),
    year = birth.getFullYear(),
    month = birth.getMonth() + 1,
    date = birth.getDate(),
    sum = year + month + date;
  while (sum > 9) {
    var str = String(sum),
      len = str.length;
    sum = 0;
    for (var i = 0; i < len; i++) {
      sum += parseInt(str[i])
    }
  }
  return sum;
};

//==>Roughly<== distance without map API
var get_distance = function (lat1, lng1, lat2, lng2) {

  var EARTH_RADIUS = 6378137.0;    //单位M
  var PI = Math.PI;

  function getRad(d) {
    return d * PI / 180.0;
  }

  var f = getRad((lat1 + lat2) / 2);
  var g = getRad((lat1 - lat2) / 2);
  var l = getRad((lng1 - lng2) / 2);

  var sg = Math.sin(g);
  var sl = Math.sin(l);
  var sf = Math.sin(f);

  var s, c, w, r, d, h1, h2;
  var a = EARTH_RADIUS;
  var fl = 1 / 298.257;

  sg = sg * sg;
  sl = sl * sl;
  sf = sf * sf;

  s = sg * (1 - sl) + (1 - sf) * sl;
  c = (1 - sg) * (1 - sl) + sf * sl;

  if (c == 0) return 0;

  w = Math.atan(Math.sqrt(s / c));

  if (w == 0) return 0;
  r = Math.sqrt(s * c) / w;
  d = 2 * w * a;
  h1 = (3 * r - 1) / 2 / c;
  h2 = (3 * r + 1) / 2 / s;

  return d * (1 + fl * (h1 * sf * (1 - sg) - h2 * (1 - sf) * sg));
};

//==>Roughly<== period without dict
var get_period = function (birthday, today) {
  //need to be verify
  var birth = new Date(birthday),
    month = birth.getMonth() + 1,
    date = birth.getDate(),
    now = new Date(today),
    m = now.getMonth() + 1,
    d = now.getDate(),
    p;
  if (month > m) m += 12;
  p = parseInt(((m - month) * 365 / 12 + d - date) / 52) + 1;
  return Value.period_digit_to_en[p];
};

//Match value considering lots of things
var get_match_value = function (user, target) {

  var value, distance, card, number, contact, constellation;
  var sn_user, sn_target, dis;
  var deck = user.deck;
  var period = get_period(user.detail.birthday, Date.now());

  if (ifContains(deck.long_term, target.detail.life_card)) {
    card = 20;
  } else if (ifContains(deck.long_term, target.detail.guard_card)) {
    card = 19;
  } else if (ifContains(deck.Pluto, target.detail.life_card)) {
    card = 18;
  } else if (ifContains(deck.Pluto, target.detail.guard_card)) {
    card = 17;
  } else if (ifContains(deck.result, target.detail.life_card)) {
    card = 16;
  } else if (ifContains(deck.result, target.detail.guard_card)) {
    card = 15;
  } else if (ifContains(deck[period], target.detail.life_card)) {
    card = 9;
  } else if (ifContains(deck[period], target.detail.guard_card)) {
    card = 8;
  } else {
    card = 0;
  }

  dis = get_distance(user.last_login.x, user.last_login.y,
    target.last_login.x, target.last_login.y);
  //100m 31, 1km 30, 10km 22, 20km 16, 40km 8, 50km 5, 100km 1
  distance = parseInt(Math.pow(2, 5 - (dis / 20000)));
  if (distance < 0) distance = 0;

  sn_user = get_secret_number(user.detail.birthday);
  sn_target = get_secret_number(target.detail.birthday);
  if (sn_user == sn_target) {
    number = 4;
  } else if (sn_target == Value.digit_pair[sn_user]) {
    number = 3;
  } else {
    number = 0;
  }

  if (ifContains(user.contact, target.detail.phone)
    || ifContains(target.contact, user.detail.phone)) {
    contact = 2;
  } else {
    contact = 0;
  }

  if (user.detail.constellation == target.detail.constellation) {
    constellation = 1;
  } else {
    constellation = 0;
  }

  value = distance + card + number + contact + constellation;
  return value + 40;
};

//Exp to level
var cal_level = function (exp) {
  var level = 1;
  for (var i = 0; i < Value.level.length; i++) {
    if (exp >= Value.level[i]) {
      level += 1;
      exp -= Value.level[i]
    }
  }
  return {level: level, exp: exp};
};


//=========================================================
//                     Test Function
//=========================================================


//Test
exports.test = function (req, res) {
  var username = req.query.username;
  Identity.bind(username, function (err, result) {
    if (err) throw err;
    if (result.status == 'OK') {
      User.modify(username, {email: result.address}, function(){
        var response = {
          status: result.status,
          data: {}
        };
        res.send(response)
      });
    } else {
      var response = {
        status: result.status,
        data: {}
      };
      res.send(response)
    }
  });
};


//=========================================================
//                     User Behavior
//=========================================================


exports.checkAttr = function (req, res) {
  var key = req.body.key || '',
    value = req.body.value || '';
  if (key == 'nickname') {
    User.checkNick(value, function (err, user) {
      if (user != null) {
        var response = 'not available';
      } else {
        response = 'available';
      }
      res.send(response)
    })
  } else if (key == 'phone') {
    User.checkPhone(value, function (err, user) {
      if (user != null) {
        var response = 'not available';
      } else {
        response = 'available';
      }
      res.send(response)
    })
  } else if (key == 'email') {
    User.checkEmail(value, function (err, user) {
      if (user != null) {
        var response = 'not available';
      } else {
        response = 'available';
      }
      res.send(response)
    })
  } else {
    res.send();
  }
};

exports.key = function (req, res) {
  var phone = req.header('phone') || '';
  var code = (parseInt(Math.random() * 10)).toString()
    + (parseInt(Math.random() * 10)).toString()
    + (parseInt(Math.random() * 10)).toString()
    + (parseInt(Math.random() * 10)).toString()
    + (parseInt(Math.random() * 10)).toString()
    + (parseInt(Math.random() * 10)).toString();

  Identity.clear(phone, function (err) {
    if (err) throw err;
    var newIdentity = new Identity({
      code: code,
      phone: phone,
      time: new Date(Date.now())
    });
    newIdentity.save(function (err) {
      if (err) throw err;
    });
  });

  var postData = {
    uid: 'DPTSim4QgMrt',
    pas: '5kc7xhhh',
    cid: '3mNQanxoO8Fo',
    p1: code,
    p2: Value.identity_limit.toString(),
    mob: phone,
    type: 'json'
  };
  var content = querystring.stringify(postData);
  var options = {
    host: 'api.weimi.cc',
    path: '/2/sms/send.html',
    method: 'POST',
    agent: false,
    rejectUnauthorized: false,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': content.length
    }
  };
  req = http.request(options, function (resp) {
    resp.setEncoding('utf8');
    resp.on('data', function (chunk) {
      res.send(JSON.parse(chunk));
    });
    resp.on('end', function () {
      console.log('over');
    });
  });
  req.write(content);
  req.end();
};

exports.register = function (req, res) {
  var nickname = req.headers.nickname || '',
    birthday = req.headers.birthday || '',
    gender = req.headers.gender || '',
    phone = req.headers.phone || '',
    email = req.headers.email || '',
    code = req.headers.code || '',
    password = req.headers.password || '';

  Identity.verify(phone, code, function (err, result) {
    if (err) throw err;
    if (result == 'OK') {
      User.checkNick(nickname, function (err, user) {
        if (user != null) {
          response = {
            status: 'Nickname already exists',
            data: {}
          };
          res.send(response)
        } else {
          User.checkPhone(phone, function (err, user) {
            if (user != null) {
              response = {
                status: 'Phone already exists',
                data: {}
              };
              res.send(response)
            } else {
              User.checkEmail(email, function (err, user) {
                if (user != null) {
                  response = {
                    status: 'Email already exists',
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

                  //var x = Math.round((Value.constellation_division[constellation].start
                  //  + Value.constellation_division[constellation].range * Math.random()) * 100) / 100;
                  //var y = Math.round((Math.random() * 60 - 30) * 100) / 100;
                  //var z = Math.round((Math.random() * 40000 + 5000) * 100) / 100;

                  var a = Math.round((Math.random() * 360 / 180 * Math.PI) * 100) / 100,
                    b = Math.round((Math.random() * 180 / 180 * Math.PI) * 100) / 100,
                    c = Math.round((Math.random() * 1000) * 100) / 100;
                  var x = Math.round(Math.cos(a) * Math.sin(b) * c * 100) / 100,
                    y = Math.round(Math.sin(a) * Math.sin(b) * c * 100) / 100,
                    z = Math.round(Math.cos(b) * c * 100) / 100;

                  LifeGuardCard.findOne(str_birth, function (err, life_guard_card) {
                    if (err) throw err;
                    if (life_guard_card != null) {
                      var life_card = life_guard_card.life_card.split('或')[0],
                        guard_card = life_guard_card.guard_card.split('或')[0],
                        len = life_card.length,
                        pre = life_card.substr(0, len - 2) + Value.suit_character_to_letter[life_card[len - 2]];
                      User.countName(pre, function (err, count) {
                        var username = String(get_secret_number(birthday)) +
                          pre + String(count + 1);
                        var newUser = new User({
                          username: username,
                          password: password,
                          token: Value.default_token,
                          detail: {
                            nickname: nickname,
                            birthday: birthday,
                            gender: gender,
                            phone: phone,
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
                            device: '1',
                            city: '未知'
                          },
                          star: {
                            x: x,
                            y: y,
                            z: z
                          },
                          left_chance: 2,
                          online_duration: 0
                        });
                        newUser.save(function (err, user) {
                          response = {
                            status: 'OK',
                            data: {
                              username: user.username
                            }
                          };
                          res.send(response)
                        });
                        activateEmail(email, username, nickname);
                      });
                    } else {
                      response = {
                        status: 'Invalid request',
                        data: {}
                      };
                      res.send(response)
                    }
                  });
                }
              })
            }
          })
        }
      })
    } else {
      var response = {
        status: result,
        data: {}
      };
      res.send(response)
    }
  });
};

exports.login = function (req, res) {
  var username = req.body.username || '',
    password = req.body.password || '',
    x = req.body.x || 0,
    y = req.body.y || 0,
    z = req.body.z || 0,
    city = req.body.city || '',
    device_token = req.body.device_token || '1',
    ip = req._remoteAddress.split(':').pop();
  User.login(username, password, function (err, user) {
    if (err) throw err;
    if (user != null) {
      var userInfo = {
        city: city,
        device: device_token,
        avatar: user.detail.avatar,
        nickname: user.detail.nickname
      };
      Six.update(user._id.toString(), userInfo, function () {
        var addition = user.last_login.alive_time - user.last_login.time,
          duration = user.online_duration + addition;
        var userId = user._id,
          plaintext = user.username + Date.now(),
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
        if (user.last_login.time == null) {
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

exports.logout = function (req, res) {
  var userId = req.headers.userid || '',
    token = req.headers.token || '';
  User.auth(userId, token, function (err, user) {
    if (err) throw err;
    if (user != null) {
      User.logout(userId, token, function (err) {
        if (err) throw err;
        var response = {
          status: 'OK',
          data: {}
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

exports.locate = function (req, res) {
  var userId = req.body.userId || '',
    token = req.body.token || '',
    x = req.body.x || 0,
    y = req.body.y || 0,
    z = req.body.z || 0,
    city = req.body.city || '';

  User.auth(userId, token, function (err, user) {
    if (err) throw err;
    if (user != null) {
      Six.update(userId, {city: city}, function () {
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

exports.topUp = function (req, res) {
  var userId = req.headers.userid || '',
    token = req.headers.token || '',
    money = parseInt(req.headers.money) || 0;
  User.auth(userId, token, function (err, user) {
    if (err) throw err;
    if (user != null) {
      User.topUp(userId, money, function(err) {
        if (err) throw err;
        var response = {
          status: 'OK',
          data: {}
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

exports.editProfile = function (req, res) {
  var userId = req.headers.userid || '',
    token = req.headers.token || '',
    nickname = req.body.nickname || '',
    birthday = req.body.birthday || '',
    gender = req.body.gender || '1';

  var birth = new Date(birthday),
    month = birth.getMonth() + 1,
    date = birth.getDate(),
    str_birth = String(month * 100 + date),
    int_birth = parseInt(str_birth),
    constellation = get_constellation(int_birth);

  User.auth(userId, token, function (err, user) {
    if (err) throw err;
    if (user != null) {
      if (user.detail.flag == 1) {
        User.checkNick(nickname, function (err, exist) {
          if ((exist != null)&&(user.username != exist.username)) {
            response = {
              status: 'Nickname already exists',
              data: {}
            };
            res.send(response)
          } else {
            LifeGuardCard.findOne(str_birth, function (err, life_guard_card) {
              if (err) throw err;
              if (life_guard_card != null) {
                var detail = user.detail;
                detail.nickname = nickname;
                detail.birthday = birthday;
                detail.gender = gender;
                detail.life_card = life_guard_card.life_card;
                detail.guard_card = life_guard_card.guard_card;
                detail.constellation = constellation;
                detail.flag = 0;
                User.modify(user._id, detail, function (err) {
                  if (err) throw err;
                  var response = {
                    status: 'OK',
                    data: {
                      detail: detail
                    }
                  };
                  res.send(response)
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

var changePassword = function (req, res) {
  var userId = req.headers.userid || '',
    token = req.headers.token || '',
    old_password = req.headers.old_password || '',
    new_password = req.headers.new_password || '';

  User.auth(userId, token, function (err, user) {
    if (err) throw err;
    if (user != null) {
      if (user.password == old_password) {
        User.changePassword(userId, new_password, function (err) {
          if (err) throw err;
          var response = {
            status: 'OK',
            data: {}
          };
          res.send(response)
        })
      } else {
        var response = {
          status: 'Password error',
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

exports.findPassword = function (req, res) {
  var phone = req.headers.phone || '',
    code = req.headers.code || '';
  Identity.verify(phone, code, function (err, result) {
    if (err) throw err;
    if (result == 'OK') {
      changePassword(req, res);
    } else {
      var response = {
        status: result,
        data: {}
      };
      res.send(response)
    }
  });
};

exports.uploadAvatar = function (req, res) {
  var userId = req.headers.userid || '',
    token = req.headers.token || '';
  User.auth(userId, token, function (err, user) {
    if (err) throw err;
    if (user != null) {
      if (req.files.avatar != null) {
        var tmp_path = req.files.avatar.path,
          target_name = user.username + '.' + req.files.avatar.name.split('.')[1],
          target_path = './public/images/Avatar_' + target_name,
          avatar = '/images/Avatar_' + target_name;
        fs.rename(tmp_path, target_path, function (err) {
          if (err) throw err;
          fs.unlink(tmp_path, function () {
            if (err) throw err;
            User.setAvatar(user._id, avatar, function () {
              if (err) throw err;
              var userInfo = {
                city: user.last_login.city || '未知',
                device: user.last_login.device,
                avatar: avatar,
                nickname: user.detail.nickname
              };
              Six.update(user._id.toString(), userInfo, function () {
                response = {
                  status: 'OK',
                  data: {
                    target_path: avatar,
                    size: req.files.avatar.size + 'bytes'
                  }
                };
                res.send(response);
              })
            })
          })
        })
      } else {
        response = {
          status: 'No file',
          data: {}
        };
        res.send(response)
      }

    } else {
      var response = {
        status: 'Token error',
        data: {}
      };
      res.send(response)
    }
  });
};

exports.uploadContact = function (req, res) {
  var userId = req.headers.userid || '',
    token = req.headers.token || '',
    contact = req.headers.contact ? req.headers.contact.replace(' ', '').split(',') : [];
  User.auth(userId, token, function (err, user) {
    if (err) throw err;
    if (user != null) {
      for (var i = 0; i < contact.length; i++) {
        var phone_len = contact[i].length;
        if (phone_len > 11) {
          contact[i] = contact[i].slice(phone_len - 11, phone_len)
        }
      }
      for (i = 0; i < user.contact.length; i++) {
        if (!ifContains(contact, user.contact[i])) {
          contact[contact.length] = user.contact[i];
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

//Existing users from contact
exports.checkContact = function (req, res) {
  var userId = req.headers.userid || '',
    token = req.headers.token || '',
    contact = req.headers.contact ? req.headers.contact.replace(' ', '').split(',') : [];
  User.auth(userId, token, function (err, user) {
    if (err) throw err;
    if (user != null) {
      User.checkContact(contact, function (err, users) {
        if (err) throw err;
        var list = [];
        for (var i = 0; i < users.length; i++) {
          list[list.length] = {
            userId: users[i]._id,
            phone: users[i].detail.phone
          }
        }
        if (list.length == 0) {
          list = null
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

exports.earnExp = function (req, res) {
  var userId = req.headers.userid || '',
    token = req.headers.token || '',
    action = req.headers.action || '';
  User.auth(userId, token, function (err, user) {
    if (err) throw err;
    if (user != null) {
      User.addExp(userId, Value.exp_addition[action], function (err, experience) {
        if (err) throw err;
        var response = {
          Amount: experience,
          Lvl: cal_level(experience).level,
          Exp: cal_level(experience).exp
        };
        res.send(response)
      })
    } else {
      res.send()
    }
  });
};

exports.alive = function (req, res) {
  var userId = req.headers.userid || '',
    token = req.headers.token || '';
  User.auth(userId, token, function (err, user) {
    if (err) throw err;
    if (user != null) {
      var last_alive = user.last_login.alive_time;
      var verifyLoginInterval = function (callback) {
        //在线10分钟以上统计在线时间 更新last_login
        if ((Date.now() - last_alive) > 600000) {
          var addition = last_alive - user.last_login.time,
            duration = user.online_duration + addition;
          var last_login = {
            'last_login.time': Date.now(),
            online_duration: duration
          };
          User.verifyInterval(user._id, last_login, function (err) {
            if (err) throw err;
            callback()
          })
        } else {
          callback()
        }
      };
      verifyLoginInterval(function () {
        User.alive(userId, function (err) {
          if (err) throw err;
          //获取notification
          Notification.get(userId, function (err, notifications) {
            if (notifications.length == 0) {
              notifications = null
            }
            if (err) throw err;
            var response = {
              status: 'OK',
              data: {
                login: user.last_login,
                notifications: notifications
              }
            };
            res.send(response);
            Notification.clear(userId);
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


//=========================================================
//                    Info Functions
//=========================================================


exports.userInfo = function (req, res) {
  var userId = req.headers.userid || '',
    token = req.headers.token || '';
  User.auth(userId, token, function (err, user) {
    if (err) throw err;
    if (user != null) {
      var birthday = user.detail.birthday,
        age = get_age(birthday, Date.now()),
        secret_number = get_secret_number(birthday);
      Period.identify(birthday, Date.now(), function (err, period, list) {
        if (err) throw err;
        var content = Value.content_in_profile + list;
        Deck.getOne(user.detail.life_card, age, function (err, deck1) {
          if (err) throw err;
          Deck.getOne(user.detail.guard_card, age, function (err, deck2) {
            if (err) throw err;
            if ((deck1 != null) && (deck2 != null)) {
              var level = cal_level(user.detail.experience).level,
                allow_period = Value.future_periods_of_level[level],
                allow_end_time = new Date(Date.now() + allow_period * 4492800000);
              var response = {
                status: 'OK',
                data: {
                  info: {
                    detail: {
                      avatar: user.detail.avatar,
                      birthday: user.detail.birthday,
                      flag: user.detail.flag,
                      energy: user.detail.energy,
                      experience: user.detail.experience,
                      constellation: user.detail.constellation,
                      guard_card: user.detail.guard_card,
                      life_card: user.detail.life_card,
                      email: user.detail.email,
                      phone: user.detail.phone,
                      gender: user.detail.gender,
                      nickname: user.detail.nickname
                    },
                    last_login: user.last_login,
                    purchased_music: user.purchased_music,
                    contact: user.contact,
                    stranger: user.stranger,
                    time_line: user.time_line,
                    online_duration: user.online_duration
                  },
                  level: level,
                  allow_end_time: allow_end_time,
                  cost: Value.song_cost_of_level[level],
                  secret_number: secret_number,
                  age: age,
                  period: period,
                  cn_period: Value.period_en_to_cn[period],
                  content: content,
                  deck: {
                    life_card: deck1.cards,
                    guard_card: deck2.cards
                  }
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

//To query any day for users considering available periods
exports.anytimeDeck = function (req, res) {
  var userId = req.headers.userid || '',
    token = req.headers.token || '',
    someday = req.headers.someday || '';
  if (new Date(someday) == 'Invalid Date') {
    var response = {
      status: 'Invalid request',
      data: {}
    };
    res.send(response)
  } else {
    User.auth(userId, token, function (err, user) {
      if (user != null) {
        var birthday = user.detail.birthday,
          age = get_age(birthday, someday);
        Period.identify(birthday, someday, function (err, period) {
          if (err) throw err;
          var level = cal_level(user.detail.experience).level,
            allow_period = Value.future_periods_of_level[level],
            allow_end_time = new Date(Date.now() + allow_period * 4492800000);
          if (new Date(someday) > allow_end_time) {
            var msg = '您将要查看的日期处于' + Value.period_en_to_cn[period] + '周期，您当前的等级为' + level + ',没有权限查看';
            response = {
              status: 'OK',
              data: {
                content: msg
              }
            };
            res.send(response)
          } else {
            msg = '您的解读年龄为' + age + '您目前处于' + Value.period_en_to_cn[period] + '行星周期，您目前等级为' + level + '，可以查看最多' + allow_period + '个周期牌阵，以下是当前周期牌阵解读';
            Deck.getOne(user.detail.life_card, age, function (err, deck1) {
              if (err) throw err;
              Deck.getOne(user.detail.guard_card, age, function (err, deck2) {
                if (err) throw err;
                if ((deck1 != null) && (deck2 != null)) {
                  var response = {
                    status: 'OK',
                    data: {
                      age: age,
                      period: period,
                      cn_period: Value.period_en_to_cn[period],
                      info: {
                        detail: {
                          life_card: user.detail.life_card,
                          guard_card: user.detail.guard_card
                        }
                      },
                      deck: {
                        life_card: deck1.cards,
                        guard_card: deck2.cards
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
  }
};

//To query any birthday of a friend for users
exports.somedayDeck = function (req, res) {
  var userId = req.headers.userid || '',
    token = req.headers.token || '',
    someday = req.headers.someday || '';
  if (new Date(someday) == 'Invalid Date') {
    var response = {
      status: 'Invalid request',
      data: {}
    };
    res.send(response)
  } else {
    User.auth(userId, token, function (err, user) {
      if (err) throw err;
      if (user != null) {
        var age = get_age(someday, Date.now());
        var birth = new Date(someday),
          month = birth.getMonth() + 1,
          date = birth.getDate(),
          str_birth = String(month * 100 + date);

        LifeGuardCard.findOne(str_birth, function (err, life_guard_card) {
          if (err) throw err;
          if (life_guard_card != null) {
            Period.identify(someday, Date.now(), function (err, period) {
              if (err) throw err;
              var msg = '您所查看的朋友年龄为' + age + '，当前处于' + Value.period_en_to_cn[period] + '行星周期，您只可查看其当前周期牌阵与5张年度牌';
              var life_card = life_guard_card.life_card.split('或')[0],
                guard_card = life_guard_card.life_card.split('或')[0];
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
                        cn_period: Value.period_en_to_cn[period],
                        info: {
                          detail: {
                            life_card: life_guard_card.life_card,
                            guard_card: life_guard_card.guard_card
                          }
                        },
                        deck: {
                          life_card: deck1.cards,
                          guard_card: deck2.cards
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
  }
};

exports.contactInfo = function (req, res) {
  var userId = req.headers.userid || '',
    token = req.headers.token || '',
    contactId = req.headers.contactid || '';
  console.log(userId, token, contactId)
  User.auth(userId, token, function (err, user) {
    if (err) throw err;
    if (user != null) {
      User.info(contactId, function (err, contact) {
        if (err) throw err;
        if (contact != null) {
          var birthday = contact.detail.birthday,
            age = get_age(birthday, Date.now());
          Period.identify(birthday, Date.now(), function (err, period, list) {
            if (err) throw err;
            Deck.getOne(contact.detail.life_card, age, function (err, deck1) {
              if (err) throw err;
              Deck.getOne(contact.detail.guard_card, age, function (err, deck2) {
                if (err) throw err;
                if ((deck1 != null) && (deck2 != null)) {
                  var level = cal_level(contact.detail.experience).level,
                    allow_period = Value.future_periods_of_level[level],
                    allow_end_time = new Date(Date.now() + allow_period * 4492800000);
                  Message.lastOne(userId, contactId, function (err, message) {
                    if (err) throw err;
                    if (message == undefined) {
                      message = null;
                    }
                    Chat_history.query(userId, contactId, function (err, sent) {
                      Chat_history.query(contactId, userId, function (err, received) {
                        Message.count(userId, contactId, function (err, count1) {
                          Message.count(contactId, userId, function (err, count2) {
                            sent += count1;
                            received += count2;
                            var response = {
                              status: 'OK',
                              data: {
                                info: {
                                  detail: {
                                    avatar: user.detail.avatar,
                                    birthday: contact.detail.birthday,
                                    flag: contact.detail.flag,
                                    energy: contact.detail.energy,
                                    experience: contact.detail.experience,
                                    constellation: contact.detail.constellation,
                                    guard_card: contact.detail.guard_card,
                                    life_card: contact.detail.life_card,
                                    email: contact.detail.email,
                                    phone: contact.detail.phone,
                                    gender: contact.detail.gender,
                                    nickname: contact.detail.nickname
                                  },
                                  last_login: user.last_login,
                                  purchased_music: user.purchased_music,
                                  contact: user.contact,
                                  stranger: user.stranger,
                                  time_line: user.time_line,
                                  online_duration: user.online_duration
                                },
                                level: level,
                                allow_end_time: allow_end_time,
                                cost: Value.song_cost_of_level[level],
                                age: age,
                                period: period,
                                cn_period: Value.period_en_to_cn[period],
                                deck: {
                                  life_card: deck1.cards,
                                  guard_card: deck2.cards
                                },
                                last_message: message,
                                sent: sent,
                                received: received
                              }
                            };
                            console.log(response);
                            res.send(response)

                          })
                        })
                      });
                    });
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
        status: 'Not found',
        data: {}
      };
      res.send(response)
    }
  })
};

exports.contactList = function (req, res) {
  var userId = req.headers.userid || '',
    token = req.headers.token || '';
  User.auth(userId, token, function (err, user) {
    if (err) throw err;
    if (user != null) {
      User.contactList(userId, function (err, list) {
        Message.lastTime(userId, function (err, lastTime) {
          if (err) throw err;
          var tmp = [];
          for (var i = 0; i < list.length; i++) {
            tmp[i] = {
              _id: list[i]._id,
              nickname: list[i].detail.nickname,
              last_time: lastTime[list[i]._id]
            };
            if (list[i].detail.avatar != null) {
              tmp[i].avatar = list[i].detail.avatar;
            }
          }
          tmp.sort(getSortFun('desc', 'last_time'));
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

exports.longTerm = function (req, res) {
  var birthday = new Date(req.body.birthday || ''),
    someday = new Date(req.body.someday || ''),
    age = get_age(birthday, someday),
    month = birthday.getMonth() + 1,
    date = birthday.getDate(),
    str_birth = String(month * 100 + date);

  LifeGuardCard.findOne(str_birth, function (err, life_guard_card) {
    if (err) throw err;
    if (life_guard_card != null) {
      var life_card = life_guard_card.life_card.split('或')[0];
      Deck.getOne(life_card, age, function (err, deck) {
        if (err) throw err;
        if (deck != null) {
          var spec = 'long_term',
            card = deck.cards[spec][0];
          Solution.findOne(card, function (err, solution) {
            if (err) throw err;
            if (solution != null) {
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
    } else {
      var response = {
        status: 'Invalid request',
        data: {}
      };
      res.send(response)
    }
  })
};

exports.deckIntro = function (req, res) {
  res.send(Value.deck_intro);
};

exports.cardSolution = function (req, res) {
  var card = req.body.card || '',
    spec = req.body.spec || '';
  card = card.split(',');
  var sol = "";
  Solution.findOne(card[0], function (err, solution) {
    if (err) throw err;
    if (solution != null) {
      sol += card[0] + ':\n' + solution[spec] + '\n';
      if (card.length > 1) {
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

exports.secretNumberInfo = function (req, res) {
  var secret_number = req.headers.digit || 1;
  Characteristic.query(secret_number, function (err, result) {
    if (err) throw  err;
    if (result != null) {
      var response = {
        status: 'OK',
        data: {
          solution: result.characteristic
        }
      };
    } else {
      response = {
        status: 'Invalid request',
        data: {}
      };
    }
    res.send(response)
  })
};

exports.constellationInfo = function (req, res) {
  var constellation = req.body.constellation || '',
    userId = req.body.userId || '';
  console.log(constellation, userId);
  console.log(typeof (userId));
  Constellation.find(constellation, function (err, result) {
    if (err) throw err;
    if (result != null) {
      User.countConstellation(constellation, function (err, count) {
        if (err) throw err;
        if (count != null) {
          User.countActiveInConstellation(constellation, function (err, active) {
            if (err) throw err;
            if (active != null) {
              User.rankInConstellation(userId, constellation, function (err, rank) {
                if (err) throw err;
                if (rank != null) {
                  Message.sendFromConstellation(constellation, function (err, msg) {
                    if (err) throw err;
                    if (msg != null) {
                      User.brightestInConstellation(constellation, function (err, user) {
                        if (err) throw err;
                        if (user != null) {
                          var brightest = user;
                        } else {
                          brightest = null
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

exports.timeLine = function (req, res) {
  var userId = req.headers.userid || '',
    token = req.headers.token || '';
  User.auth(userId, token, function (err, user) {
    if (err) throw err;
    if (user != null) {
      var response = {
        status: 'OK',
        data: {
          time_line: user.time_line
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

exports.loadStars = function (req, res) {
  var userId = req.headers.userid || '',
    token = req.headers.token || '';
  User.auth(userId, token, function (err, user) {
    if (err) throw err;
    if (user != null) {
      User.loadStars(userId, user.detail.constellation, function (err, results) {
        if (err) throw err;
        var stars = [];
        for (var i = 0; i < results.length; i++) {
          stars[i] = {
            _id: results[i]._id,
            star: results[i].star,
            constellation: results[i].detail.constellation,
            level: cal_level(results[i].detail.experience).level
          }
        }
        var response = {
          status: 'OK',
          data: stars
        };
        res.send(response);
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

exports.starInfo = function (req, res) {
  var userId = req.headers.userid || '',
    token = req.headers.token || '',
    starId = req.headers.starid || '';
  User.auth(userId, token, function (err, user) {
    if (err) throw err;
    if (user != null) {
      User.info(starId, function (err, star) {
        if (err) throw err;
        User.rankInConstellation(userId, star.detail.constellation, function (err, rank) {
          if (err) throw err;
          if (rank != null) {
            var newStar_history = new Star_history({
              from: userId,
              to: starId,
              time: new Date(Date.now())
            });
            newStar_history.save(function () {
              Star_history.count(userId, starId, function (err, count) {
                if (err) throw err;
                console.log(count)
              })
            });
            var response = {
              status: 'OK',
              data: {
                avatar: star.detail.avatar,
                constellation: star.detail.constellation,
                gender: star.detail.gender,
                nickname: star.detail.nickname,
                life_card: star.detail.life_card,
                rank: rank
              }
            };
            res.send(response)
          }
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

exports.promotion = function (birthday, callback) {
  if (new Date(birthday) == 'Invalid Date') {
    callback('error');
  } else {
    var age = get_age(birthday, new Date(Date.now())),
      month = birthday.getMonth() + 1,
      date = birthday.getDate(),
      str_birth = String(month * 100 + date);
    LifeGuardCard.findOne(str_birth, function (err, life_guard_card) {
      var life_card = life_guard_card.life_card.split('或')[0];
      var guard_card = life_guard_card.guard_card.split('或')[0];
      Deck.getOne(life_card, age, function (err, deck) {
        var spec = 'long_term',
          card = deck.cards[spec][0];
        if (err) throw err;
        if (deck != null) {
          Solution.findOne(card, function (err, solution) {
            life_card.replace('红桃', '❤️').replace('黑桃', '♠️').replace('方块', '♦️').replace('草花', '♣️');
            var txt = '我们知道你的\n年龄：' + age + '\n星座：' + get_constellation(month * 100 + date)
              + '\n生命数字：' + get_secret_number(birthday) + '\n生命牌：' + life_card.replace('红桃', '❤️').replace('黑桃', '♠️').replace('方块', '♦️').replace('草花', '♣️') + '\n行星守护牌：' + guard_card.replace('红桃', '❤️').replace('黑桃', '♠️').replace('方块', '♦️').replace('草花', '♣️') + '\n\n我们还知道你今年所面临的\n一些事情：\n' + solution[spec];
            callback(txt + '\n（此处还有一万字已略去）')
          })
        } else {
          callback('error')
        }
      })
    })
  }
};


//=========================================================
//                    Match Functions
//=========================================================


exports.findMatch = function (req, res) {
  User.getAll(function (results) {
    results = randomArray(results);
    var matches = [];
    var l = results.length;
    for (var i = 0; i < parseInt(l / 2); i++) {
      var get_match = function (callback) {
        var max = 0, begin = 0, end = 1;
        for (var j = 1; j < l - 2 * i; j++) {
          var value = get_match_value(results[0], results[j]);
          if ((ifContains(results[0].stranger, results[j]._id.toString()))
            || (ifContains(results[j].stranger, results[0]._id.toString()))) {
            value = 0;
          }
          if (value > max) {
            max = value;
            begin = 0;
            end = j;
          }
        }
        callback(begin, end, max)
      };
      get_match(function (begin, end, max) {
        if (max > 0) {
          const beginId = results[begin]._id,
            beginNick = results[begin].detail.nickname,
            endNick = results[end].detail.nickname,
            endId = results[end]._id;
          var m = {
            begin: beginId,
            end: endId,
            value: max,
            time: Date.now(),
            status: 0
          };
          matches[matches.length] = m;
          var newMatch = new Match(m);
          newMatch.save(function (err, match) {
            if (err) throw err;
            User.incChance(beginId, -1, function (err) {
              if (err) throw err;
              User.incChance(endId, -1, function (err) {
                if (err) throw err;
                User.addTimeLine(beginId, {
                  type: 'match',
                  event: '与' + endNick + '匹配成功',
                  time: Date.now()
                }, function (err) {
                  if (err) throw err;
                  User.addTimeLine(endId, {
                    type: 'match',
                    event: '与' + beginNick + '匹配成功',
                    time: Date.now()
                  }, function (err) {
                    if (err) throw err;
                    var notification = {
                      id: match._id,
                      userId: beginId,
                      type: 'match',
                      percent: parseInt(Math.random() * 50 + 50),
                      notification: '与' + endNick + '匹配成功'
                    };
                    new Notification(notification).save(function (err, record) {
                      console.log(record);
                    });
                    notification = {
                      id: match._id,
                      userId: endId,
                      type: 'match',
                      percent: parseInt(Math.random() * 50 + 50),
                      notification: '与' + beginNick + '匹配成功'
                    };
                    new Notification(notification).save(function (err, record) {
                      console.log(record);
                    });
                  })
                })
              })
            });
          });
        }
        applePush(results[begin].last_login.device,
          'You got a new match!',
          {type: 'match', begin: Date.now().toString()});
        applePush(results[end].last_login.device,
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
    console.log(response.data.matches);
    res.send(response)
  })
};

exports.acceptMatch = function (req, res) {
  var userId = req.header('userId') || '',
    token = req.header('token') || '',
    matchId = req.header('matchId') || '';
  User.auth(userId, token, function (err, user) {
    var deviceId = user.last_login.device;
    Match.accept(matchId, userId, function (err, targetId, status) {
      User.info(targetId, function (err, target) {
        if (status == 3) {
          applePush(deviceId, 'Match complete', {});
          applePush(target.last_login.device, 'Match complete', {});
          var strangers = user.stranger;
          if (strangers.length < 36) {
            if (ifContains(strangers, targetId)) {
            } else {
              strangers[strangers.length] = targetId;
              User.setStranger(userId, strangers, function (err) {
                if (err) throw err;
                var target_strangers = target.stranger;
                if (target_strangers.length < 36) {
                  if (ifContains(target_strangers, userId)) {
                  } else {
                    target_strangers[target_strangers.length] = userId;
                    User.setStranger(targetId, target_strangers, function (err) {
                      if (err) throw err;
                      User.addTimeLine(targetId, {
                        type: 'match',
                        event: '已与' + user.detail.nickname + '成为好友',
                        time: Date.now()
                      }, function (err) {
                        if (err) throw err;
                        User.addTimeLine(userId, {
                          type: 'match',
                          event: '已与' + target.detail.nickname + '成为好友',
                          time: Date.now()
                        }, function (err) {
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
        } else {
          User.addTimeLine(targetId, {
            type: 'match',
            event: user.detail.nickname + '已接受与您的匹配',
            time: Date.now()
          }, function (err) {
            if (err) throw err;
            User.addTimeLine(userId, {
              type: 'match',
              event: '已接受与' + target.detail.nickname + '的匹配',
              time: Date.now()
            }, function (err) {
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
  });
};

exports.rejectMatch = function (req, res) {
  var userId = req.header('userId') || '',
    token = req.header('token') || '',
    matchId = req.header('matchId') || '';
  User.auth(userId, token, function (err, user) {
    var deviceId = user.last_login.device;
    Match.reject(matchId, userId, function (err, targetId, status) {
      User.info(targetId, function (err, target) {
        applePush(deviceId, 'Match denied', {});
        applePush(target.last_login.device, 'Match denied', {});
        User.incChance(target._id, 1, function (err) {
          if (err) throw err;
          console.log(target._id);
          User.addTimeLine(targetId, {
            type: 'match',
            event: user.detail.nickname + '已拒绝与您的匹配',
            time: Date.now()
          }, function (err) {
            if (err) throw err;
            User.addTimeLine(userId, {
              type: 'match',
              event: '已拒绝与' + target.detail.nickname + '的匹配',
              time: Date.now()
            }, function (err) {
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

exports.uploadStranger = function (req, res) {
  var userId = req.header('userId') || '',
    token = req.header('token') || '',
    strangerId = req.header('strangerId') || '';
  User.auth(userId, token, function (err, user) {
    if (err) throw err;
    if (user != null) {
      var strangers = user.stranger;
      if (strangers.length < 36) {
        if (ifContains(strangers, strangerId)) {
        } else {
          strangers[strangers.length] = strangerId;

          console.log(strangers);
          User.setStranger(userId, strangers, function (err) {
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

exports.delStranger = function (req, res) {
  var userId = req.header('userId') || '',
    token = req.header('token') || '',
    strangerId = req.header('strangerId') || '';
  User.auth(userId, token, function (err, user) {
    if (err) throw err;
    if (user != null) {
      var strangers = user.stranger;
      if (ifContains(strangers, strangerId)) {
        for (var i = 0; i < strangers.length; i++) {
          if (strangerId == strangers[i]) {
            strangers = strangers.slice(0, i).concat(strangers.slice(i + 1));
            User.setStranger(userId, strangers, function (err) {
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


//=========================================================
//                   Message Functions
//=========================================================


exports.sendMessage = function (req, res) {
  var userId = req.body.userId || '',
    token = req.body.token || '';
  User.auth(userId, token, function (err, user) {
    if (user != null) {
      var constellation = user.detail.constellation,
        nickname = user.detail.nickname,
        to = req.body.to || '',
        msg = req.body.msg || '';
      console.log(msg);
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
      var notification = {
        userId: to,
        type: 'message',
        notification: msg
      };
      new Notification(notification).save(function (err, record) {
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

exports.receiveMessage = function (req, res) {
  var userId = req.header('userId') || '',
    token = req.header('token') || '';
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

exports.historyMessage = function (req, res) {
  var userId = req.header('userId') || '',
    token = req.header('token') || '',
    contactId = req.header('contactId') || '';
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

exports.confirmMessage = function (req, res) {
  var userId = req.header('userId') || '',
    token = req.header('token') || '',
    msgIds = (req.header('msgIds') || '').split(',');
  User.auth(userId, token, function (err, user) {
    if (err) throw err;
    if (user != null) {
      Message.confirm(userId, msgIds, function (err) {
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


//=========================================================
//                    Music Functions
//=========================================================


exports.purchaseMusic = function (req, res) {
  var userId = req.header('userId') || '',
    token = req.header('token') || '',
    musicId = req.header('musicId') || '';
  User.auth(userId, token, function (err, user) {
    var level = cal_level(user.detail.experience).level,
      cost = Value.song_cost_of_level[level];
    if (err) throw err;
    if (user != null) {
      var purchased = user.purchased_music;
      if (ifContains(purchased, musicId)) {
        var response = {
          status: 'Existed',
          data: {}
        };
        res.send(response);
      } else {
        purchased[purchased.length] = musicId;
        if (user.detail.balance < cost) {
          response = {
            status: 'Failed',
            data: {
              balance: user.detail.balance
            }
          };
          res.send(response);
        } else {
          User.purchaseMusic(userId, purchased, cost, function (err) {
            if (err) throw err;
            response = {
              status: 'OK',
              data: {
                purchased: purchased
              }
            };
            res.send(response);
          });
        }
      }
    } else {
      response = {
        status: 'Token error',
        data: {}
      };
      res.send(response)
    }
  });
};

exports.likeMusic = function (req, res) {
  var userId = req.header('userId') || '',
    token = req.header('token') || '',
    musicId = req.header('musicId') || '';
  User.auth(userId, token, function (err, user) {
    if (err) throw err;
    if (user != null) {
      Music.like(musicId, userId, function (err, list) {
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

exports.fetchMusicList = function (req, res) {
  var userId = req.header('userId') || '',
    token = req.header('token') || '';
  User.auth(userId, token, function (err, user) {
    if (err) throw err;
    if (user != null) {
      Music.list(user._id, function (err, list, like, purchased) {
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

exports.musicInfo = function (req, res) {
  var userId = req.header('userId') || '',
    token = req.header('token') || '',
    musicId = req.header('musicId') || '';
  User.auth(userId, token, function (err, user) {
    if (err) throw err;
    if (user != null) {
      Music.query(musicId, function (err, music) {
        if (err) throw err;
        var response = {
          status: 'OK',
          data: {
            music: music
          }
        };
        res.send(response);
        console.log(response)
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


//=========================================================
//                  Six Degree Functions
//=========================================================


exports.newSix = function (req, res) {
  var userId = req.header('userId') || '',
    token = req.header('token') || '';
  User.auth(userId, token, function (err, user) {
    if (err) throw err;
    if (user != null) {
      Six.fetchAll(userId, function (err, sixes) {
        var list = [];
        sixes.forEach(function (six) {
          var flag = 0;
          for (var i = 0; i < six.chain.length; i++) {
            if ((six.chain[i].userId == userId) && (six.chain[i].isRead != 1)) {
              flag = 1;
            }
          }
          if (flag == 1) {
            list[list.length] = {
              sixId: six._id,
              status: six.status,
              chain: six.chain
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

exports.allSix = function (req, res) {
  var userId = req.header('userId') || '',
    token = req.header('token') || '';
  User.auth(userId, token, function (err, user) {
    if (err) throw err;
    if (user != null) {
      Six.fetchAll(userId, function (err, sixes) {
        var list = [];
        sixes.forEach(function (six) {
          list[list.length] = {
            sixId: six._id,
            status: six.status,
            target: six.target,
            chain: six.chain
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

exports.pickSix = function (req, res) {
  var userId = req.header('userId') || '',
    token = req.header('token') || '';
  User.auth(userId, token, function (err, user) {
    if (err) throw err;
    if (user != null) {
      User.targetList(Value.target_list, function (err, target_users) {
        if (target_users != null) {
          var list = [];
          for (var i = 0; i < target_users.length; i++) {
            var secret_number = get_secret_number(target_users[i].detail.birthday);
            list[list.length] = {
              userId: target_users[i]._id,
              nickname: target_users[i].detail.nickname,
              life_card: target_users[i].detail.life_card,
              constellation: target_users[i].detail.constellation,
              avatar: target_users[i].detail.avatar || '',
              city: target_users[i].last_login.city,
              secret_number: secret_number.toString()
            }
          }
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
        } else {
          response = {
            status: 'Not found',
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

exports.readSix = function (req, res) {
  var userId = req.header('userId') || '',
    token = req.header('token') || '',
    sixId = req.header('sixId') || '';
  User.auth(userId, token, function (err, user) {
    if (err) throw err;
    if (user != null) {
      Six.read(sixId, userId, function (err, chain) {
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

exports.establishSix = function (req, res) {
  var userId = req.body.userId || '',
    token = req.body.token || '',
    targetId = req.body.targetId || '',
    nextId = req.body.nextId || '',
    content = req.body.content || '';
  User.auth(userId, token, function (err, user) {
    if (err) throw err;
    if (user != null) {
      User.info(targetId, function (err, target) {
        if (err) throw err;
        User.info(nextId, function (err, next) {
          if (err) throw err;
          var newSix = new Six({
            establish: userId,
            target: {
              id: targetId,
              city: target.last_login.city,
              nickname: target.detail.nickname,
              avatar: target.detail.avatar
            },
            content: content,
            chain: [{
              position: 0,
              userId: userId,
              city: user.last_login.city || '未知',
              nickname: user.detail.nickname,
              avatar: user.detail.avatar,
              device: user.last_login.device,
              time: new Date(Date.now()),
              isRead: 1
            }, {
              position: 1,
              userId: next._id.toString(),
              city: next.last_login.city || '未知',
              nickname: next.detail.nickname,
              avatar: next.detail.avatar,
              device: next.last_login.device,
              time: new Date(Date.now()),
              isRead: 0
            }],
            update_time: new Date(Date.now()),
            status: 0
          });
          newSix.save(function (err, six) {
            applePush(six.chain[1].device,
              'You got a new six degree msg!',
              {type: 'six', chain: six.chain});
            User.addTimeLine(six.chain[1].userId, {
              type: 'six',
              event: 'six degree pass',
              time: Date.now()
            }, function (err) {
              if (err) throw err;
            });
            User.addTimeLine(userId, {type: 'six', event: 'six degree established', time: Date.now()}, function (err) {
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
          var notification = {
            userId: nextId,
            type: 'six',
            notification: '来自' + user.detail.nickname + '的六度请求'
          };
          new Notification(notification).save(function (err, record) {
            console.log(record);
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

exports.passSix = function (req, res) {
  var userId = req.header('userId') || '',
    token = req.header('token') || '',
    sixId = req.header('sixId') || '',
    nextId = req.header('nextId') || '';
  User.auth(userId, token, function (err, user) {
    if (err) throw err;
    if (user != null) {
      Six.fetch(sixId, function (err, six) {
        var chain = six.chain,
          status = six.status;
        console.log(chain);
        var pre = function (callback) {
          if (err) throw err;
          User.info(nextId, function (err, next) {
            if (err) throw err;
            chain[chain.length] = {
              position: chain.length,
              userId: next._id,
              city: next.last_login.city,
              nickname: next.detail.nickname,
              avatar: next.detail.avatar,
              device: next.last_login.device,
              time: new Date(Date.now()),
              isRead: 0
            };
            for (var i = 0; i < chain.length - 2; i++) {
              User.addTimeLine(six.chain[i].userId, {
                type: 'six',
                event: 'six degree pass',
                time: Date.now()
              }, function (err) {
                if (err) throw err;
              });
              applePush(six.chain[i].device,
                'You got a new six degree msg!',
                {type: 'six', chain: chain})
            }
            callback()
          });
        };
        pre(function () {
          Six.pass(sixId, chain, function (err) {
            if (err) throw err;
            var notification = {
              userId: nextId,
              type: 'six',
              notification: '来自' + user.detail.nickname + '的六度请求'
            };
            new Notification(notification).save(function (err, record) {
              console.log(record);
            });
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

exports.generateInvitation = function (req, res) {
  var userId = req.header('userId') || '',
    token = req.header('token') || '',
    sixId = req.header('sixId') || '',
    phone = req.header('phone') || '';
  User.auth(userId, token, function (err, user) {
    if (err) throw err;
    if (user != null) {
      Invitation.genCode(function (err, code) {
        if (err) throw err;
        var newInvitation = new Invitation({
          code: code,
          sixId: sixId,
          phone: phone,
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

exports.acceptInvitation = function (req, res) {
  var userId = req.header('userId') || '',
    token = req.header('token') || '',
    code = req.header('code') || '',
    phone = req.header('phone') || '';
  User.auth(userId, token, function (err, user) {
    if (err) throw err;
    if (user != null) {
      Invitation.acceptCode(phone, code, function (err, invitation) {
        if (err) throw err;
        if (invitation != null) {
          Six.fetch(invitation.sixId, function (err, six) {
            if (err) throw err;
            var chain = six.chain,
              status = six.status;
            chain[chain.length] = {
              position: chain.length,
              userId: userId,
              city: user.last_login.city,
              nickname: user.detail.nickname,
              avatar: user.detail.avatar,
              device: user.last_login.device,
              time: new Date(Date.now()),
              isRead: 1
            };
            Six.pass(six._id, chain, function (err) {
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
        } else {
          var response = {
            status: 'Invalid code',
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

exports.completeSix = function (req, res) {
  var userId = req.header('userId') || '',
    token = req.header('token') || '',
    sixId = req.header('sixId') || '';
  User.auth(userId, token, function (err, user) {
    if (err) throw err;
    if (user != null) {
      Six.fetch(sixId, function (err, six) {
        if (err) throw err;
        var chain = six.chain,
          status = six.status;
        var pre = function (callback) {
          for (var i = 0; i < chain.length - 1; i++) {
            console.log(six.chain[i].userId);
            User.addTimeLine(six.chain[i].userId, {
              type: 'six',
              event: 'six degree complete',
              time: Date.now()
            }, function (err) {
              if (err) throw err;
            });
            applePush(six.chain[i].device,
              'Six degree complete!',
              {type: 'six', chain: chain})
          }
          callback()
        };
        pre(function () {
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


//Following functions are used both in and out
exports.get_age = get_age;
exports.ifContains = ifContains;
exports.changePassword = changePassword;