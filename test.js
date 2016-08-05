var BDSpeech = require("./index.js")

var speech = new BDSpeech("DAZTeCYAkuAQwtPvWDcBb9Ih", "adb28deb5103bde96bd9633dd437ff2d", 'afplay',null, true);
speech.on('ready', token => {

  // var now = new Date();
  // var time = now.getHours()+"点"+now.getMinutes()+"分"
  // let hour = now.getHours()
  // let daytime = ''
  //
  // if(hour < 12 && hour >= 9){
  //   daytime = '上午'
  // }
  // else if (hour < 9 && hour >= 0) {
  //   daytime = '早晨'
  // }
  // else if (hour < 19 && hour >= 12) {
  //   daytime = '下午'
  // }
  // else if (hour < 24 && hour >= 19) {
  //   daytime = '晚上'
  // }
  //
  // speech.speak(`${daytime}好,现在时间是${daytime}${time}`)
  //

  speech.speak('你好，欢迎光临利生宝公共广播系统')
  .then(() => {return speech.speak('我公司集合研发、生产、销售于一体')})
  .then(() => speech.speak('生产销售适用于公用场所、家居生活的音响设施'))


})
