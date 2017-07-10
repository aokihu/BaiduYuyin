Baidu Yuyin 百度语音合成
-----------------------

***依赖移除***
V2.2.0版本将不再依赖任何外部库😂
已经将代码的依赖降低到最低程度

***注意***
请使用合适的播放器，本模块不自带播放器功能了现在，并且建议使用Nodejs 7.0，最好是Nodejs 8.0以上的运行环境，
为了尽量减少对其他库的依赖，我使用了一些新的JS特性。

使用Baidu的在线语音合成服务，需要自己申请API Key，申请网址http://yuyin.baidu.com

更新日志查看这里[CHANGELOG](CHANGELOG.md)


使用方法
-------
### 安装

`npm install baidu_yuyin`

注意：现在使用外部播放器来播放语音文件，请指定正确的播放器的命令行参数

### 不需要回掉直接使用的方法
```javascript
const BDSpeech = require("baidu_yuyin");
const apiKey = "从这里：http://yuyin.baidu.com/app获取";
const secretKey = "从这里：http://yuyin.baidu.com/app获取";

const speech = new BDSpeech(apiKey, secretKey,'mplayer', '/tmp')
speech.speak('你好,世界')
```


### 传统回掉方式使用
```javascript
const BDSpeech = require("baidu_yuyin");
const apiKey = "从这里：http://yuyin.baidu.com/app获取";
const secretKey = "从这里：http://yuyin.baidu.com/app获取";

const speech = new BDSpeech(apiKey, secretKey,'mplayer', '/tmp')

speech.on('ready', () => {
  speech.speak("你好世界")
})

```

### async/await异步方式调用
```javascript
const BDSpeech = require("baidu_yuyin");
const apiKey = "从这里：http://yuyin.baidu.com/app获取";
const secretKey = "从这里：http://yuyin.baidu.com/app获取";

const speech = new BDSpeech(apiKey, secretKey,'mplayer', '/tmp')

async function speak(){
  await speech.initToken();
  speech.speak('你好世界');
}

speak();
```
