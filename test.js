var BDSpeech = require("./index.js")

var speech = new BDSpeech("DAZTeCYAkuAQwtPvWDcBb9Ih", "adb28deb5103bde96bd9633dd437ff2d");
speech.on('ready', function(token){

  var now = new Date();
  var time = now.getHours()+":"+now.getMinutes()+":"+now.getSeconds();

  speech.speak('快点接电话，快点接电话')
})
