var BDSpeech = require("./index.js")

const buffer = false;
const player = 'mplayer';
const speech = new BDSpeech("DAZTeCYAkuAQwtPvWDcBb9Ih", 
                            "adb28deb5103bde96bd9633dd437ff2d", 
                            player, 
                            null, 
                            buffer);
// speech.on('ready', token => {
//   // var now = new Date();
//   // var time = now.getHours()+"点"+now.getMinutes()+"分"
//   // let hour = now.getHours()
//   // let daytime = ''
//   //
//   // if(hour < 12 && hour >= 9){
//   //   daytime = '上午'
//   // }
//   // else if (hour < 9 && hour >= 0) {
//   //   daytime = '早晨'
//   // }
//   // else if (hour < 19 && hour >= 12) {
//   //   daytime = '下午'
//   // }
//   // else if (hour < 24 && hour >= 19) {
//   //   daytime = '晚上'
//   // }
//   //
//   // speech.speak(`${daytime}好,现在时间是${daytime}${time}`)
//   //

//   speech.speak('欢迎光临').then(() => {speech.speak('你好')})

//   // speech.speak('切换到D L N A模式')
// })
speech.speak('今天天气不错?出去玩不,哈哈哈哈')
// speech.agentSpeak('gst-launch-1.0 filesrc location=${file} ! decodebin ! audioconvert ! autoaudiosink','天气不错')