var express = require('express');
var router = express.Router();
var Version = require('../models/version.js');
var utils = require('../utils');


router.get('/', function(req, res) {
  res.send('this is an api~'+typeof(Date.now())+':'+Date.now());
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

router.get('/login', function(req, res) {
  utils.login(req, res)
});

router.get('/register', function(req, res) {
  tils.register(req, res)
});

router.get('/userInfo', function(req, res) {
  utils.userInfo(req, res)
});

router.get('/contactInfo', function(req, res) {
  utils.contactInfo(req, res)
});

router.post('/uploadAvatar', function(req, res) {
  utils.uploadAvatar(req, res)
});

router.get('/cardSolution', function(req, res) {
  utils.cardSolution(req, res)
});

router.get('/constellationInfo', function(req, res) {
  utils.constellationInfo(req, res)
});

router.get('/messages', function(req, res){
  utils.receiveMessage(req, res)
});

router.post('/messages', function(req, res){
  utils.sendMessage(req, res)
});

//initialization below
router.get('/init/deck', function(req, res) {
  utils.initDeck(req, res)
});

router.get('/init/characteristic', function(req, res) {
  utils.initCharacteristic(req, res)
});

router.get('/init/lifeGuardCard', function(req, res) {
  utils.initLifeGuardCard(req, res)
});

router.get('/init/solution', function(req, res) {
  utils.initSolution(req, res)
});

router.get('/init/constellation', function(req, res) {
  utils.initConstellation(req, res)
});

module.exports = router;