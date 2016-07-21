var BDSpeech = require("./index.js")

var speech = new BDSpeech("DAZTeCYAkuAQwtPvWDcBb9Ih", "adb28deb5103bde96bd9633dd437ff2d");
speech.on('ready', function(token){

  var now = new Date();
  var time = now.getHours()+":"+now.getMinutes()+":"+now.getSeconds();

  speech.speak('胡佳南,下午好,现在时间'+time)
})
