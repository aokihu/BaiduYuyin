### 注意
### 因为Player的依赖库对Nodejs 4.0支持不好，请不要随意升级到新版本
## 如果你是Mac用户的话，我已经使用本地播放器来播放语音文件了，不过话说回来，如果是Mac的话本身就有语音库了

Baidu Yuyin 百度语音合成
-----------------------

使用Baidu的在线语音合成服务，需要自己申请API Key，申请网址http://yuyin.baidu.com
更新日志查看这里[CHANGELOG](CHANGELOG.md)


使用方法
-------
### 安装

`npm install baidu_yuyin`

注意：播放声音需要安装mplayer

### 使用
```javascript
var BDSpeech = require("baidu_yuyin");
var apiKey = "从这里：http://yuyin.baidu.com/app获取";
var secretKey = "从这里：http://yuyin.baidu.com/app获取";

var speech = new BDSpeech(apiKey, secretKey,'mplayer', '/tmp')

speech.on('ready', () => {
  speech.speak("你好世界")
})

```
