/**
 * Baidu 语音合成
 *
 * @author aokihu(aokihu@gmail.com)
 * @version 1.0.0
 * @description 需要自己提供API的key,网址http://yuyin.baidu.com
 *
 */
'use strict'

const eventEmitter = require('events').EventEmitter
const util   = require('util')
const querystring = require('querystring')
const request = require('request')
const fs = require('fs')
const child_process = require('child_process')


/**
 * 百度语音
 */

class BDSpeech extends eventEmitter{

  /**
   * 构造方法
   * @method constructor
   * @param  {string}    apiKey        自己去看百度文档
   * @param  {string}    secrectKey    自己去看百度文档
   * @param  { string}   playCmd       播放器的命令
   * @param  {string}    path          保存数据的路径
   * @param  {boolean}   bufferd=false 是否要保存到本地缓存起来
   * @return {[type]}                  [description]
   */

  constructor (apiKey, secrectKey, playCmd="afplay", path, bufferd=false) {

    super()

    let __accessUrl__ = 'https://openapi.baidu.com/oauth/2.0/token';
    this.__url__ = 'http://tsn.baidu.com/text2audio'

    let client_id = apiKey
    let client_secret = secrectKey
    let grant_type = 'client_credentials'

    this.bufferd = bufferd // 是否缓存音乐
    this.sessionToken = ''
    this.isLogin = false
    this.sessionFile = __dirname + '/session.json'
    this.tempFile = (path ? path :  __dirname) + '/temp.mp3'
    this.playCmd = playCmd

    let params = {
      'grant_type':grant_type,
      'client_id':client_id,
      'client_secret':client_secret
    }

    fs.access(this.sessionFile, fs.F_OK, err => {

      if(err){

        // 从百度获取token session
        var _url = __accessUrl__ + "?" + querystring.stringify(params);

        request(_url, function(err, res, body){
          let json = JSON.parse(body)
          let _token = json.access_token

          this.sessionToken = _token
          this.isLogin = true

          // write session token to local file
          fs.writeFile(this.sessionFile, JSON.stringify({token:_token}), err => {
            if(err) throw err
          })

          this.emit('ready', _token)
        });

      }
      else{

        // read bufferd token session
        let _sessionJson = JSON.parse(fs.readFileSync(this.sessionFile));
        let sessionToken = _sessionJson.token;

        this.sessionToken = sessionToken
        this.isLogin = true

        this.emit('ready', sessionToken)
      }

    })

  }

  /**
   * [speak description]
   * @method speak
   * @param  {[type]} txt [description]
   * @param  {[type]} opt [description]
   * @return {[type]}     [description]
   */

  speak(txt, opt){

    var id = (new Date()).getTime();
    var params = {
      'tex':encodeURIComponent(txt),
      'lan':'zh',
      'tok':this.sessionToken,
      'ctp':1,
      'cuid':'BDS-'+id,
      'spd':5,
      'pit':5,
      'vol':5,
      'per':0
    }

    let url = this.__url__ + "?" + querystring.stringify(params)

    // download file pipeline
    let download = fs.createWriteStream(this.tempFile)

    download.on('finish', ()=>{

      child_process.spawn(this.playCmd,[this.tempFile])
      .on('exit', (code, signal) => {
        // remove temp muisc file
        fs.unlinkSync(this.tempFile)
      })

    })

    // download text audio file
    request(url).pipe(download)

  }

}

module.exports = BDSpeech
