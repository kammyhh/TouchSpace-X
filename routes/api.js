var express = require('express');
var router = express.Router();
var Version = require('../models/version.js');
var utils = require('../utils/utils');
var init = require('../utils/init');
var http = require('http');
var querystring = require('querystring');
var LifeGuardCard = require('../models/life_guard_card.js');
var Solution = require('../models/solution.js');
var Deck = require('../models/deck.js');
var Value = require('../utils/value.js');
var log = require('../utils/log').accessLogger;
var fs = require('fs');
var path = require('path');


var ip = '119.254.102.92';
log.info('API loaded.');

router.use(function accessLog(req, res, next) {
  var method = req.method;
  var url = req.baseUrl;
  var ip = '[' + req._remoteAddress.split(':').pop() + ']';
  log.info([method, url, ip].join(' '));
  next();
});

router.get('/', function(req, res) {
  res.send('Date:'+ new Date(Date.now()));
});

router.get('/ip', function(req, res) {
  res.send(ip);
});

router.post('/ip', function(req, res) {
  ip = req.body.ip;
  res.send(ip);
});

router.get('/testVersion', function(req, res) {
  var newVersion = new Version({
    date: Date.now(),
    platform: 'Android',
    version: '1.0.0'
  });
  newVersion.save(function (err, version) {
    console.log(version);
    res.send('new verison was added ~')
  });
});

router.get('/sms', function(req, res) {
  var code = (parseInt(Math.random() * 10)).toString()
    + (parseInt(Math.random() * 10)).toString()
    + (parseInt(Math.random() * 10)).toString()
    + (parseInt(Math.random() * 10)).toString()
    + (parseInt(Math.random() * 10)).toString()
    + (parseInt(Math.random() * 10)).toString();
  var postData = {
    uid:'DPTSim4QgMrt',
    pas:'5kc7xhhh',
    cid:'3mNQanxoO8Fo',
    p1:code,
    p2:'3',
    mob:'18652987903',
    type:'json'
  };
  console.log(postData);
  var content = querystring.stringify(postData);
  var options = {
    host:'api.weimi.cc',
    path:'/2/sms/send.html',
    method:'POST',
    agent:false,
    rejectUnauthorized : false,
    headers:{
      'Content-Type' : 'application/x-www-form-urlencoded',
      'Content-Length' :content.length
    }
  };
  req = http.request(options,function(resp){
    resp.setEncoding('utf8');
    resp.on('data', function (chunk) {
      console.log(JSON.parse(chunk));
      res.send(JSON.parse(chunk));
    });
    resp.on('end',function(){
      console.log('over');
    });
  });
  req.write(content);
  req.end();
});

router.get('/balance', function(req, res) {
  var postData = {
    uid:'DPTSim4QgMrt',
    pas:'5kc7xhhh',
    type:'json'
  };
  var content = querystring.stringify(postData);
  var options = {
    host:'api.weimi.cc',
    path:'/2/account/balance.html',
    method:'GET',
    agent:false,
    rejectUnauthorized : false,
    headers:{
      'Content-Type' : 'application/x-www-form-urlencoded',
      'Content-Length' :content.length
    }
  };
  req = http.request(options,function(resp){
    resp.setEncoding('utf8');
    resp.on('data', function (chunk) {
      console.log(JSON.parse(chunk));
      res.send(JSON.parse(chunk).toString());
    });
    resp.on('end',function(){
      console.log('over');
    });
  });
  req.write(content);
  req.end();
});


//user behavior
router.get('/key', function(req, res) {
  utils.key(req, res)
});

router.get('/register', function(req, res) {
  utils.register(req, res)
});

router.post('/login', function(req, res) {
  utils.login(req, res)
});

router.get('/logout', function(req, res) {
  utils.logout(req, res)
});

router.post('/locate', function(req, res) {
  utils.locate(req, res)
});

router.get('/topUp', function(req, res) {
  utils.topUp(req, res)
});

router.get('/bindEmail', function(req, res) {
  utils.bindEmail(req, res)
});

router.post('/editProfile', function(req, res) {
  utils.editProfile(req, res)
});

router.get('/changePassword', function(req, res) {
  utils.changePassword(req, res)
});

router.get('/findPassword', function(req, res) {
  utils.findPassword(req, res)
});

router.post('/uploadAvatar', function(req, res) {
  utils.uploadAvatar(req, res)
});

router.post('/uploadContact', function(req, res) {
  utils.uploadContact(req, res)
});

router.get('/checkContact', function(req, res) {
  utils.checkContact(req, res)
});

router.get('/alive', function(req, res){
  utils.alive(req, res)
});

router.get('/earnExp', function(req, res){
  utils.earnExp(req, res)
});


//info
router.post('/checkAttr', function(req, res){
  utils.checkAttr(req, res)
});

router.get('/anytimeDeck', function(req, res) {
  utils.anytimeDeck(req, res)
});

router.get('/somedayDeck', function(req, res) {
  utils.somedayDeck(req, res)
});

router.get('/userInfo', function(req, res) {
  utils.userInfo(req, res)
});

router.get('/contactInfo', function(req, res) {
  utils.contactInfo(req, res)
});

router.get('/contactList', function(req, res) {
  utils.contactList(req, res)
});

router.post('/cardSolution', function(req, res) {
  utils.cardSolution(req, res)
});

router.get('/secretNumberInfo', function(req, res) {
  utils.secretNumberInfo(req, res)
});

router.post('/constellationInfo', function(req, res) {
  utils.constellationInfo(req, res)
});

router.get('/loadStars', function(req, res) {
  utils.loadStars(req, res)
});

router.get('/starInfo', function(req, res) {
  utils.starInfo(req, res)
});

router.get('/timeLine', function(req, res) {
  utils.timeLine(req, res)
});

router.post('/longTerm', function(req, res) {
  utils.longTerm(req, res)
});

router.get('/deckIntro', function(req, res) {
  utils.deckIntro(req, res)
});

router.get('/promotion', function(req, res) {
  var birthday = new Date(req.query.birthday);
  utils.promotion(birthday, function(response){
    res.send(response)
  })
});


//message
router.get('/receiveMessages', function(req, res){
  utils.receiveMessage(req, res)
});

router.get('/historyMessages', function(req, res){
  utils.historyMessage(req, res)
});

router.get('/confirmMessages', function(req, res){
  utils.confirmMessage(req, res)
});

router.post('/sendMessages', function(req, res){
  utils.sendMessage(req, res)
});


//music
router.get('/purchaseMusic', function(req, res){
  utils.purchaseMusic(req, res)
});

router.get('/likeMusic', function(req, res){
  utils.likeMusic(req, res)
});

router.get('/fetchMusicList', function(req, res) {
  utils.fetchMusicList(req, res)
});

router.get('/musicInfo', function(req, res) {
  utils.musicInfo(req, res)
});


//match
router.get('/findMatch', function(req, res) {
  utils.findMatch(req, res)
});

router.get('/acceptMatch', function(req, res) {
  utils.acceptMatch(req, res)
});

router.get('/rejectMatch', function(req, res) {
  utils.rejectMatch(req, res)
});

router.post('/uploadStranger', function(req, res) {
  utils.uploadStranger(req, res)
});

router.get('/delStranger', function(req, res) {
  utils.delStranger(req, res)
});


//six degree

//router.get('/newSix', function(req, res) {
//  utils.newSix(req, res)
//});
//
//router.get('/allSix', function(req, res) {
//  utils.allSix(req, res)
//});
//
//router.get('/pickSix', function(req, res) {
//  utils.pickSix(req, res)
//});
//
//router.get('/readSix', function(req, res) {
//  utils.readSix(req, res)
//});
//
//router.post('/establishSix', function(req, res) {
//  utils.establishSix(req, res)
//});
//
//router.get('/passSix', function(req, res) {
//  utils.passSix(req, res)
//});
//
//router.get('/completeSix', function(req, res) {
//  utils.completeSix(req, res)
//});
//
//router.get('/generateInvitation', function(req, res) {
//  utils.generateInvitation(req, res)
//});
//
//router.get('/acceptInvitation', function(req, res) {
//  utils.acceptInvitation(req, res)
//});


//test
router.get('/test', function(req, res) {
  utils.test(req, res)
});

router.get('/get_code_txt', function(req, res) {
  utils.get_code_txt(req, res)
});

router.get('/get_code_img', function(req, res) {
  utils.get_code_img(req, res)
});


//initialization below
router.get('/init/deck', function(req, res) {
  init.initDeck(req, res)
});

router.get('/init/characteristic', function(req, res) {
  init.initCharacteristic(req, res)
});

router.get('/init/lifeGuardCard', function(req, res) {
  init.initLifeGuardCard(req, res)
});

router.get('/init/solution', function(req, res) {
  init.initSolution(req, res)
});

router.get('/init/constellation', function(req, res) {
  init.initConstellation(req, res)
});

router.get('/init/period', function(req, res) {
  init.initPeriod(req, res)
});

router.get('/init/music', function(req, res) {
  init.updateMusicList(req, res)
});


var config = {
  token: 'apidiantouchspacexdiancom',
  appid: 'wxbc63a04bd2c0bfb9',
  appSecret: 'd11095c53dc51144dab65d0daa8db8eb',
  encodingAESKey: 'CdP2ZYYv5PDdML2iYIw2GTdHjmrbdcRH3zSxzb6BZN1'
};

var wechat = require('wechat');
router.use('/wechat', wechat(config, function (req, res, next) {
  // 微信输入信息都在req.weixin上
  var message = req.weixin;
  var auto_reply = Value.auto_reply_list;
  if (message.MsgType === 'text') {
    var msg = message['Content'];
    var dateReg = /^\d{8}$/;

    for (var i = 1; i < auto_reply.length; i++) {
      if ((msg.indexOf(auto_reply[i].keyword) > -1)) {
        res.reply(auto_reply[i].reply);
        return;
      }
    }

    if (dateReg.test(msg)) {
      msg = msg.substr(0, 4) + '-' + msg.substr(4, 2) + '-' + msg.substr(6, 2);
      var birthday = new Date(msg);
      utils.promotion(birthday, function (response) {
        res.reply(response);
      })
    } else {
      res.reply({
        type: 'transfer_customer_service'
      })
    }

  } else if (message.MsgType === 'event') {
    if (message.Event == 'subscribe') {
      res.reply(auto_reply[0].reply)
    }
  }

}));

var wechatApi = require('wechat-api');
//var api = new wechatApi(config['appid'], config['appSecret']);
var file_path = path.join(__dirname,'./../access_token.txt');
var api = new wechatApi(config['appid'], config['appSecret'], function (callback) {
  fs.exists(file_path, function(exists) {
    if (exists) {
      fs.readFile(path.join(__dirname,'./../access_token.txt'), {encoding:'utf8',flag:'r'}, function (err, txt) {
        if (err) throw err;
        callback(null, JSON.parse(txt));
      });
    } else {
      callback(null, this.store);
    }
  });
}, function (token, callback) {
  // 请将token存储到全局，跨进程、跨机器级别的全局，比如写到数据库、redis等
  // 这样才能在cluster模式及多机情况下使用，以下为写入到文件的示例
  fs.writeFile(file_path, JSON.stringify(token));
  callback(null);
});
router.use('/wechat_menu', function (req, res) {
  var menu = {
    "button": [
      //{
      //  "name": "App下载",
      //  "sub_button": [
      //    {
      //      "type": "view",
      //      "name": "App前瞻",
      //      "url": "http://m.touchspacex.com"
      //    }
      //  ]
      //},
      {
        "type": "view",
        "name": "官方微博",
        "url": "http://weibo.com/touchspacex"
      },
      {
        "type": "view",
        "name": "官网",
        "url": "http://www.touchspacex.com"
      },
      {
        "type": "view",
        "name": "欢迎入群",
        "url": "http://mp.weixin.qq.com/s?__biz=MzA5NzE5NDc0OQ==&mid=209635926&idx=3&sn=8688b5432df2506186950487c4324ccb#rd"
      }
    ]
  };
  api.createMenu(menu, function(err, result) {
    res.send(result)
  });
});


module.exports = router;