/**
 * Created by hh on 15/6/29.
 */

var crypto = require('crypto');
var fs= require('fs');
var xlsx = require('node-xlsx');

var Characteristic = require('./models/characteristic.js');
var Constellation = require('./models/constellation.js');
var Deck = require('./models/deck.js');
var LifeGuardCard = require('./models/life_guard_card.js');
var Message = require('./models/message.js');
var Solution = require('./models/solution.js');
var User = require('./models/user.js');
var Version = require('./models/version.js');

//data format/now
var get_age = function(birthday) {
  var birth = new Date(birthday),
    year = birth.getFullYear(),
    month = birth.getMonth()+ 1,
    date = birth.getDate(),
  //nowaday = Date.now(),
    nowaday = 1507318888388,
    now = new Date(nowaday),
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



exports.login = function(req, res){
  var username = req.header('username'),
    password = req.header('password'),
    ip = req['_remoteAddress'].split(':').pop();
  User.login(username, password, function (err, user) {
    console.log(user);
    if (user != null) {
      var userId = user['_id'],
        plaintext = user['username'] + Date.now(),
        token = crypto.createHash('md5').update(plaintext).digest('hex');
      User.setLogin(userId, token, ip, function () {
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

exports.register = function(req, res){
  var nickname = req.header('nickname'),
    birthday = parseInt(req.header('birthday')),
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
      });
    }
  })
};

exports.userInfo = function(req, res){
  var userId = req.header('userId'),
    token = req.header('token');
  User.auth(userId, token, function (err, user) {
    console.log(user);
    if (user != null) {
      var birthday = user['detail']['birthday'],
        age = get_age(birthday),
        secret_number = get_secret_number(birthday);
      Deck.getOne(user['detail']['life_card'], age, function (err, deck) {
        var response = {
          status: 'OK',
          data: {
            info: {
              detail: user['detail'],
              last_login: user['last_login']
            },
            secret_number: secret_number,
            age: age,
            deck: deck
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

exports.contactInfo = function(req, res){
  var userId = req.header('userId'),
    token = req.header('token'),
    contactId = req.header('contactId');
  User.auth(userId, token, function (err, user) {
    console.log(user);
    if (user != null) {
      User.info(contactId, function (err, contact) {
        var birthday = contact['detail']['birthday'],
          age = get_age(birthday);
        Deck.getOne(contact['detail']['life_card'], age, function (err, deck) {
          var response = {
            status: 'OK',
            data: {
              deck: deck
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

exports.uploadAvatar = function(req, res){
  var userId = req.header('userId'),
    token = req.header('token');
  User.info(userId, token, function (err, user) {
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

exports.cardSolution = function(req, res){
  var card = req.query['card'],
    spec =req.query['spec'];
  Solution.findOne(card, function(err, solution){
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

exports.constellationInfo = function(req, res){
  var constellation = '双鱼座';
  var userId = '5590b6e25eb9114602418311';
  Constellation.find(constellation, function(err, result){
    User.countConstellation(constellation, function(err, count) {
      User.countActiveInConstellation(constellation, function (err, active) {
        User.rankInConstellation(userId, constellation, function(err, rank){
          Message.sendFromConstellation(constellation, function(err, msg){
            User.brightestInConstellation(constellation, function(err, user){
              var brightest = user['detail']['nickname'];
              User.countGenderInConstellation(1, constellation, function(err, male){
                var male = male, female = count - male;
                var response = {
                  status: 'OK',
                  data: {
                    explanation: result,
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
           })
          });
        })
      })
    })
  })
};
/*
 constellationInfo(userId, constellation)
 星座解释explanation 星系人数count 活跃指数active/count
 能量排名rank 产生消息msg 最亮星体brightest 男女数量/比较
 */

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

exports.receiveMessage = function(req, res){
  var userId = req.header('userId'),
    token = req.header('token');
  User.auth(userId, token, function (err, user) {
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

exports.initDeck = function(req, res){
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

exports.initCharacteristic = function(req, res){
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

exports.initLifeGuardCard = function(req, res){
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

exports.initSolution = function(req, res){
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
      console.log(record)
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
      var record = cons[i]
      console.log(record)
      new Constellation(record).save(function (err, record) {
        console.log(record);
      });
    }
    res.send('星座解释 imported.')
  })
};