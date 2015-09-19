/**
 * Baidu 语音合成
 *
 * @author aokihu(aokihu@gmail.com)
 * @version 1.0.0
 * @description 需要自己提供API的key,网址http://yuyin.baidu.com
 *
 */
var Player = require('player'),
    eventEmitter = require('events').EventEmitter,
    util   = require('util'),
    querystring = require('querystring'),
    request = require('request'),
    fs = require('fs')
    child_process = require('child_process')


function BDSpeech(apiKey, secrectKey){

  // restore this pointer
  var self = this;

  // baidu resource
  var __accessUrl__ = 'https://openapi.baidu.com/oauth/2.0/token';
  self.__url__ = 'http://tsn.baidu.com/text2audio'

  var client_id = apiKey,
      client_secret = secrectKey,
      grant_type="client_credentials"

  var sessionToken = "";
  self.isLogin = false;
  self.sessionFile = __dirname + '/session.json';
  self.tempFile = __dirname + "/temp.mp3";

  // if the platform is Mac, use 'afplay' instead of Plater module
  // because the Speaker module is not support new Nodejs 4.0 above
  // so I will use native player on each platform to instead of Player module
  if(process.platform != 'darwin')
  {
    self.player = new Player(self.tempFile);
    self.player.on('error', function(err){
      console.log("Player Error", err);
    })
  }


  self.init = function(){

    var params = {
      'grant_type':grant_type,
      'client_id':client_id,
      'client_secret':client_secret
    }

    // #TODO 这里要检查session文件是否存在
    //       做一个缓冲，免得每次都去请求一下
    // check session token is exist
    if(fs.accessSync(self.sessionFile, fs.F_OK))
    {
      var _sessionJson = JSON.parse(fs.readFileSync(self.sessionFile));
      sessionToken = _sessionJson.token;
      // check timeout
    }

    // #TODO 上面的还没有完工

    var _url = __accessUrl__ + "?" + querystring.stringify(params);

    request(_url, function(err, res, body){
      var json = JSON.parse(body)
      _token = json.access_token

      self.sessionToken = _token
      self.isLogin = true

      self.emit('ready', _token)
    });
  }

  // 继承EventEmitter
  eventEmitter.call(this);

  self.init();

}

util.inherits(BDSpeech, eventEmitter);

/**
 * 播放文本语音
 * @param  {string} txt 需要播放的文字
 * @param  {Object} opt [description]
 * @return {[type]}     [description]
 */
BDSpeech.prototype.speak = function(txt, opt){

  var self = this;

  var id = (new Date()).getTime();
  var params = {
    'tex':encodeURIComponent(txt),
    'lan':'zh',
    'tok':self.sessionToken,
    'ctp':1,
    'cuid':'BDS-'+id,
    'spd':5,
    'pit':5,
    'vol':5,
    'per':0
  }

  var url = self.__url__ + "?" + querystring.stringify(params)
  console.log(url)
  request(url, function(err, res, body){

    if(process.platform != 'darwin'){
      self.player.play();
    }
    else {
      //  use 'afplay' to play audio file on Mac
      child_process.spawn('afplay',[self.tempFile])
    }


  })
  .pipe(fs.createWriteStream(self.tempFile))

}


module.exports = BDSpeech
