var express = require('express');
var router = express.Router();
var Version = require('../models/version.js');
var utils = require('../utils');
var init = require('../init');
var http = require('http');
var querystring = require('querystring');
var LifeGuardCard = require('../models/life_guard_card.js');
var Solution = require('../models/solution.js');
var Deck = require('../models/deck.js');

var ip = '10.1.6.225';

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
router.post('/login', function(req, res) {
  utils.login(req, res)
});

router.post('/locate', function(req, res) {
  utils.locate(req, res)
});



router.get('/register', function(req, res) {
  utils.register(req, res)
});

router.post('/editProfile', function(req, res) {
  utils.editProfile(req, res)
});

router.post('/uploadAvatar', function(req, res) {
  utils.uploadAvatar(req, res)
});

router.post('/uploadContact', function(req, res) {
  utils.uploadContact(req, res)
});

router.get('/alive', function(req, res){
  utils.alive(req, res)
});

router.get('/earnExp', function(req, res){
  utils.earnExp(req, res)
});

router.post('/checkAttr', function(req, res){
  utils.checkAttr(req, res)
});



//info
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

router.get('/checkContact', function(req, res) {
  utils.checkContact(req, res)
});

router.post('/cardSolution', function(req, res) {
  utils.cardSolution(req, res)
});

router.post('/constellationInfo', function(req, res) {
  utils.constellationInfo(req, res)
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

router.post('/delStranger', function(req, res) {
  utils.delStranger(req, res)
});


//six degree
router.get('/newSix', function(req, res) {
  utils.newSix(req, res)
});

router.get('/allSix', function(req, res) {
  utils.allSix(req, res)
});

router.get('/pickSix', function(req, res) {
  utils.pickSix(req, res)
});

router.get('/readSix', function(req, res) {
  utils.readSix(req, res)
});

router.post('/establishSix', function(req, res) {
  utils.establishSix(req, res)
});

router.get('/passSix', function(req, res) {
  utils.passSix(req, res)
});

router.get('/completeSix', function(req, res) {
  utils.completeSix(req, res)
});

router.get('/generateInvitation', function(req, res) {
  utils.generateInvitation(req, res)
});

router.get('/acceptInvitation', function(req, res) {
  utils.acceptInvitation(req, res)
});


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

var log4js = require('log4js');
log4js.configure({
  appenders: [
    { type: 'console' }, //控制台输出
    {
      type: 'file', //文件输出
      filename: '/tmp/tsx_access.log',
      maxLogSize: 1024,
      backups:3,
      category: 'normal'
    }
  ]
});

var logger = log4js.getLogger('normal');
logger.setLevel('INFO');

var wechat = require('wechat');
var wechatApi = require('wechat-api');
var config = {
  token: 'apidiantouchspacexdiancom',
  appid: 'wxbc63a04bd2c0bfb9',
  appSecret: 'd11095c53dc51144dab65d0daa8db8eb',
  encodingAESKey: 'CdP2ZYYv5PDdML2iYIw2GTdHjmrbdcRH3zSxzb6BZN1'
};

//var api = new wechatApi(config['appid'], config['appSecret']);

var fs = require('fs');
var api = new wechatApi(config['appid'], config['appSecret'], function (callback) {
      fs.read('/tmp/access_token.txt', 'utf8', function (err, txt) {
        if (err) {return callback(err);}
        callback(null, JSON.parse(txt));
      });
    }, function (token, callback) {
      fs.write('/tmp/access_token.txt', JSON.stringify(token), callback);
    });

router.use('/wechat', wechat(config, function (req, res, next) {
  // 微信输入信息都在req.weixin上
  var message = req.weixin;
  if (message.MsgType === 'text') {
    var msg = message['Content'];
    var dateReg = /^\d{8}$/;

    if ((msg.indexOf('最帅') > -1 )||(msg.indexOf('最屌') > -1 )){
      res.reply('黄日天')
    } else if (dateReg.test(msg)) {
      msg = msg.substr(0, 4) + '-' + msg.substr(4, 2) + '-' + msg.substr(6, 2);
      var birthday = new Date(msg);
      utils.promotion(birthday, function(response){
        res.reply(response)
      })
    } else {
      res.reply({
        type: 'transfer_customer_service'
      })
    }
  }

}));

router.use('/wechat_menu', function (req, res) {
  var menu = {
    "button": [
      {
        "name": "App下载",
        "sub_button": [
          {
            "type": "view",
            "name": "App前瞻",
            "url": "http://m.touchspacex.com"
          }
        ]
      },
      {
        "type": "view",
        "name": "官方微博",
        "url": "http://weibo.com/touchspacex"
      },
      {
        "type": "view",
        "name": "官网",
        "url": "http://www.touchspacex.com"
      }
    ]
  };
  api.createMenu(menu, function(err, result) {
    if (result.errcode != 0) {
      console.info(result);
    }
    console.info(result);
  });
});


module.exports = router;