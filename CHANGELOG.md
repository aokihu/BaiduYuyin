Change Log
==========

version 2.2.0 (2017.7.10)
-------------------------
移除所有的外部依赖库，只使用系统自带的库

version 2.0.16 (2017.6.25)
-------------------------
将配置参数改成了原始的参数模式

version 2.0.6 (2017.6.25)
-------------------------
修复默认语音参数没有设置正确，无法正常运行的问题

Version 2.0.3 (2017.6.25)
-------------------------
实现了不需要初始化session的方法😂

现在使用的时候只要初始化,然后就能直接speak了

使用方法如下
```javascript
const BDSpeech = require("baidu_yuyin");
const apiKey = "从这里：http://yuyin.baidu.com/app获取";
const secretKey = "从这里：http://yuyin.baidu.com/app获取";

const speech = new BDSpeech(apiKey, secretKey,'mplayer', '/tmp');
speech.speak('你好，世界')
```

Version 2.3.0 (2017.9.21)
-----------------------
Thanks ***buzai*** submit the bug report issue #3
Now I fixed the probelm, and add continuous voice play function;
you can easily use `speak` function, and the voice command will be saved into the queue,
and will play after one voice command over.

```javascript
const speech = new BDSpeech("*****", 
                            "*****", 
                            'mplayer', 
                            null, 
                            buffer);

async function speak(){
  try{
    speech.speak('你好世界');
  } catch(err) {
    console.log(err);
  }
  
}

speak();
speak();
speech.speak('byebye');

```

It will work well now!

Sencondly, I add a private method called `agentSpeak`
Before you use the method, you need write the play command with your self, but you have more power to control your play action, you can use GStreamer and plugins, like mixer or volume adjustment

the keyword `${file}` is the only param in `agentSpeak` command

```javascript
const myCommand = 'gst-launch-1.0 playbin url=${file} ! ...';
const speech = new BDSpeech("*****", 
                            "*****", 
                            'mplayer', 
                            null, 
                            buffer);

speech.agentSpeak('hello world');
```

Version 2.0 (2017.6.25)
-----------------------
该版本使用Nodejs v8.0开发，会使用到ES2015，甚至ES0217的一些语法，建议您使用Nodejs v7.0以上使用

1. 增加了session token的过期时间，现在12小时候会重新请求新的session token
2. 修复了无法正确删除临时文件的问题
3. 增加了一个新方法initToken(),这个方法是为了适应以后async/await异步方式调用

更新1.0.7[2016-7-22]
----------------------
1. 更改了播放器的调用方式，不再根据平台自行选择，需要使用者自己来判断使用播放mp3的命令，默认使用afplay
2. Nodejs最低版本为5.0，因为使用了ES6的Class形式，低版本不再支持，我想大家应该已经升级了吧
3. 增加了指定临时下载语音文件保存目录参数，如果不设定的话就保存在当前目录下
4. 更新了依赖项目，去掉了不使用的player库，（这货实在不实用啊）

更新1.0.3[2016-7-21]
----------------------
1. 增加了缓存sessionToken到本地的功能，免得每次都去请求一边，超过24小时重新请求
2. Linux系统使用mplayer命令播放语音文件,请自行安装哦
3. 自动删除下载的mp3文件

更新1.0.2[2015-9-19]
----------------------
1. 使用绝对地址保存零时语音文件

更新1.0.1[2015-9-18]
----------------------
1. Mac用户现在使用本地播放器来播放语音文件