Baidu Yuyin 百度语音合成
-----------------------

使用Baidu的在线语音合成服务，需要自己申请API Key，申请网址http://yuyin.baidu.com

使用方法
-------
### 安装

npm install BaiduYuyin

### 使用
`var BDSpeech = require("BDSpeech");
var speech = new BDSpeech(apiKey, secretKey);
speech.speak("你好世界")`
