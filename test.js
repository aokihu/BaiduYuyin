var BDSpeech = require("./index.js")

var speech = new BDSpeech("DAZTeCYAkuAQwtPvWDcBb9Ih", "adb28deb5103bde96bd9633dd437ff2d", 'afplay');
speech.on('ready', token => {

  var now = new Date();
  var time = now.getHours()+"点"+now.getMinutes()+"分"

<<<<<<< HEAD
  speech.speak('快点接电话，快点接电话')
=======
  let hour = now.getHours()
  let daytime = ''

  if(hour < 12 && hour >= 9){
    daytime = '上午'  
  }
  else if (hour < 9 && hour >= 0) {
    daytime = '早晨'
  }
  else if (hour < 19 && hour >= 12) {
    daytime = '下午'
  }
  else if (hour < 24 && hour >= 19) {
    daytime = '晚上'
  }

  speech.speak(`${daytime}好,现在时间是${daytime}${time}`)
>>>>>>> 1a8574ff11cbc0c36090a4dbcaee1373eeae4c62
})
