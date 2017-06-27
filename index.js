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
const request = require("request");
const querystring = require("querystring");
const md5 = require("md5");
const fs = require("fs");
const child_process = require("child_process");

// 获取Token的url
const AccessUrl = "https://openapi.baidu.com/oauth/2.0/token";
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
   * @param  {String}    playCmd       播放器的命令
   * @param  {String}    path          保存数据的路径
   * @param  {Boolean}   bufferd=false 是否要保存到本地缓存起来
   * @return {BDSpeech}                  [description]
   */

  constructor(apiKey, secrectKey, playCmd = "afplay", path, bufferd = false) {
    super();

    const client_id = apiKey;
    const client_secret = secrectKey;
    const grant_type = "client_credentials";

    this.bufferd = bufferd; // 是否缓存音乐
    this.bufferdPath = __dirname + "/download";
    this.sessionToken = "";
    this.isLogin = false;
    this.sessionFile = __dirname + "/session.json";
    this.tempFile = (path ? path : __dirname) + "/temp.mp3";
    this.playCmd = playCmd;

    // 获取Token
    this.vaildToken()
      .then(this.tokenReady.bind(this))
      .catch(() => {
        const params = { grant_type, client_id, client_secret };
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
   * @method 
   */
  initToken() {

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

    return new Promise((resolve, reject) => {
      request(_url, (err, res, body) => {
        const { access_token: token } = JSON.parse(body);
        this.saveToken(token).then(resolve).catch(reject);
      });
    });
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
      request(url).pipe(download);

    })

  }

  /**
   * [speak description]
   * @method speak
   * @param  {[type]} txt [description]
   * @param  {[type]} opt [description]
   * @return {[type]}     [description]
   */

  speak(txt, ...{ lan = "zh", ctp = 1, spd = 4, pit = 5, vol = 4, per = 0 }) {
    const id = BDID;
    const params = {
      tex: encodeURIComponent(txt),
      tok: this.sessionToken,
      cuid: "BDS-" + id,
      lan, ctp, spd, pit, vol, per
    };

    const url = `${BDSpeechUrl}?${querystring.stringify(params)}`;
    const dl = md5(url);

    // 语音文件
    const bufferFile = this.bufferdPath + "/" + dl;
    const speechFile = this.bufferd ? bufferFile : this.tempFile;

    if (this.bufferd) {
      // 需要缓存
      return this.loudSpeak(speechFile)
                 .catch(err => {
                    return this.downloadSpeechFile(speechFile, url)
                        .then(this.loudSpeak.bind(this))
                        .catch(console.log)
                  });
    }
    else {
      // 不需要缓存
      return this.downloadSpeechFile(speechFile, url)
                 .then(this.loudSpeak.bind(this))
                 .catch(console.log))
    }

  }

}

module.exports = BDSpeech;
