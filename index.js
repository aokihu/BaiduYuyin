/**
 * Baidu 语音合成
 *
 * @author aokihu(aokihu@gmail.com)
 * @version 1.0.0
 * @description 需要自己提供API的key,网址http://yuyin.baidu.com
 *
 */
"use strict";

const eventEmitter = require("events").EventEmitter;
const util = require("util");
const URL = require('url').URL;
const http = require('http');
const querystring = require("querystring");
const crypto = require('crypto');
// const hash = crypto.createHash('md5');
const fs = require("fs");
const child_process = require("child_process");
const got = require('./request.js');

// 获取Token的url
const AccessUrl = "http://openapi.baidu.com/oauth/2.0/token";
// 百度语音合成url
const BDSpeechUrl = "http://tsn.baidu.com/text2audio";
// Session信息
const SessionFile = __dirname + "/session.json";
// Session超时设定为12小时
const TokenDeadline = 12 * 3600 * 1000;

const BDID = '123ff993dd';

/**
 * 百度语音
 */

class BDSpeech extends eventEmitter {
  /**
   * 构造方法
   * @method constructor
   * @param  {String}    apiKey        自己去看百度文档
   * @param  {String}    secrectKey    自己去看百度文档
   * @param  {String}    playCmd       the player command on your system 
   * @param  {String}    path          the voice saved data path
   * @param  {Boolean}   bufferd=false do you want save the voice data
   * @return {BDSpeech}                  [description]
   */

  constructor(apiKey, secrectKey, playCmd = "afplay", path, bufferd = false) {
    super();

    this.client_id = apiKey;
    this.client_secret = secrectKey;
    this.grant_type = "client_credentials";

    this.bufferd = bufferd; // 是否缓存音乐
    this.bufferdPath = __dirname + "/download";
    this.sessionToken = "";
    this.isLogin = false;
    this.sessionFile = __dirname + "/session.json";
    this.sessionTimestamp = null; // session token的缓存时间戳
    this.tempFile = (path ? path : __dirname) + "/temp.mp3";
    this.playCmd = playCmd;

    // 获取Token
    this.vaildToken()
        .then(this.tokenReady.bind(this))
        .catch(() => {
          const params = { 
            grant_type:this.grant_type,
            client_id:this.client_id,
            client_secret:this.client_secret
          };
          this.requestToken(params)
            .then(this.tokenReady.bind(this))
            .catch(console.error);
        })

    // 处理缓存
    if (this.bufferd) {
      // 检查缓存目录是否存在
      // 不存在就创建一个
      fs.access(this.bufferdPath, fs.F_OK, err => {
        if (err) {
          fs.mkdir(this.bufferdPath);
        }
      });
    }
  }

  /**
   * @method 初始化SessionToken
   * @abstract  这个方法是一个异步回掉方法
   *            为将来的async/await方式做准备
   */
  initToken() {
    return new Promise((resolve, reject) => {
      this.vaildToken()
          .then(resolve)
          .catch(() => {
            const params = { 
              grant_type:this.grant_type,
              client_id:this.client_id,
              client_secret:this.client_secret
            };

            this.requestToken(params)
              .then(resolve)
              .catch(reject);
          });

    })
  }

  /**
   * @method 验证Token的有效性
   * 因为token会过期，之前没有注意到
   * 因此当过期的token存的时候，无法正常获取语音文件
   */
  vaildToken() {
    return new Promise((resolve, reject) => {
      fs.access(SessionFile, fs.R_OK, err => {
        if (err) {
          // TODO: 如果没有Session文件，那么返回false
          reject();
        } else {
          // TODO: 如果有Session文件，然后检查是否已经过期
          const { token, timestamp } = JSON.parse(fs.readFileSync(SessionFile));
          const delta = new Date() - new Date(timestamp);
          delta > TokenDeadline ? reject() : resolve(token);
        }
      });
    });
  }

  /**
   * @method 获取新的token
   */
  requestToken(params) {
    // 从百度获取token session
    const _url = AccessUrl + "?" + querystring.stringify(params);

    return got(_url)
    .then(body => {
      const { access_token: token } = JSON.parse(body);
      return this.saveToken(token)
    })
    .catch(console.error);

  }

  /**
   * Token准备完毕
   * @param {String} token Session Token
   */
  tokenReady(token) {
    this.sessionToken = token;
    this.isLogin = true;
    this.emit("ready", token);
  }

  /**
   * 保存Token
   * @param {String} token Session Token
   */
  saveToken(token) {
    return new Promise((resolve, reject) => {
      fs.writeFile(
        SessionFile,
        JSON.stringify({ token, timestamp: new Date() }),
        err => {
          if (err) {
            reject(err);
          } else {
            resolve(token);
          }
        }
      );
    });
  }

  /**
   * 大声朗读
   * @param {String} file 语音文件
   */
  loudSpeak(file) {
    return new Promise((resolve, reject) => {
      try {

        fs.access(file, fs.F_OK | fs.R_OK, err => {
          if (err) {
            reject();
          } 
          else {
            child_process.spawn(this.playCmd, [file]).on("exit", (code, signal) => {

              if (!this.bufferd) {
                fs.unlink(file, err => { if (err) { console.log(err) } })
              }
              resolve();

            });
          }
        });

      } catch (err) {
        reject(err);
      }

    });
  }

  /**
   * 下载语音文件
   * @param {String} file 下载的文件路径
   * @param {String} url  百度语音的语音文件url
   */
  downloadSpeechFile(file, url) {

    return new Promise((resolve, reject) => {

      const download = fs.createWriteStream(file);

      download.on("finish", () => {
        resolve(file);
      });

      download.on('error', err => {
        reject(err);
      })

      // download text audio file
      const req = http.request(new URL(url), (res) => {
        res.pipe(download);
      });

      req.end();

    })

  }

  /**
   * 给代理人命令包装一个Promise外衣
   * @param {String} cmd 代理人命令
   */
  agentWarp(cmd) {

    return function(file){
      return new Promise((resolve, reject) => {
        try {
          fs.access(file, fs.F_OK | fs.R_OK, err => {
            if (err) {
              reject();
            } 
            else {
              const _cmd = cmd.replace('${file}', file);
              child_process.exec(_cmd).on("exit", (code, signal) => {

                if (!this.bufferd) {
                  fs.unlink(file, err => { if (err) { console.log(err) } })
                }
                resolve();

              });
            }
          });

        } catch (err) {
          reject(err);
        }

      });
    }
    
  }

  /**
   * @public
   * @method 播报语音
   * @param {String} txt 播报的文字
   * @param {String} lan 语言
   * @param {String} ctp 忘记了
   * @param {Number} spd 播报速度
   * @param {Number} pit 忘记了
   * @param {Number} vol 音量
   * @param {Number} per 语音的人物
   * @param {CMD} agent 中间人命令
   */
  speak(txt, lan = "zh", ctp = 1, spd = 4, pit = 5, vol = 4, per = 0){
    return this.initToken()
    .then(() => {
      return this._speak({txt,lan,ctp,spd,pit,vol,per});
    })

  }

  /**
   * 代理人播报
   * @param {CMD} agent 代理人命令
   * @param {String} txt 语音播报文字
   * @param {Object} opt 选项
   */
  agentSpeak(agent, txt , lan = "zh", ctp = 1, spd = 4, pit = 5, vol = 4, per = 0){
    return this.initToken()
    .then(() => {
      return this._speak({txt,lan,ctp,spd,pit,vol,per,agent});
    })
  }

  /**
   * [speak description]
   * @method speak
   * @param  {[type]} txt [description]
   * @param  {[type]} opt [description]
   * @return {[type]}     [description]
   */

  _speak({txt, lan = "zh", ctp = 1, spd = 4, pit = 5, vol = 4, per = 0, agent }) {
    
    const id = BDID;
    const params = {
      tex: encodeURIComponent(txt),
      tok: this.sessionToken,
      cuid: "BDS-" + id,
      lan, ctp, spd, pit, vol, per
    };

    const url = `${BDSpeechUrl}?${querystring.stringify(params)}`;
    // @FIX 'Digest already calld' bug #issue 3
    const hash = crypto.createHash('md5');
    hash.update(url);
    const dl = hash.digest('hex');
    // console.log(dl);
    
    // 语音文件
    const bufferFile = this.bufferdPath + "/" + dl;
    const speechFile = this.bufferd ? bufferFile : this.tempFile;

    // 如果有代理人播报
    // 使用代理人命令
    const _loudSpeak = agent ? this.agentWarp(agent) : this.loudSpeak;

    if (this.bufferd) {
      // 需要缓存
      return this.loudSpeak(speechFile)
                 .catch(err => {
                    return this.downloadSpeechFile(speechFile, url)
                        .then(_loudSpeak.bind(this))
                        .catch(console.log)
                  });
    }
    else {
      // 不需要缓存
      return this.downloadSpeechFile(speechFile, url)
                 .then(_loudSpeak.bind(this))
                 .catch(console.log);
    }

  }

}

module.exports = BDSpeech;
