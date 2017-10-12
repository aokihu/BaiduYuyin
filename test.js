var BDSpeech = require("./index.js")

const buffer = false;
const player = 'mplayer';
const speech = new BDSpeech("DAZTeCYAkuAQwtPvWDcBb9Ih", 
                            "adb28deb5103bde96bd9633dd437ff2d", 
                            player, 
                            null, 
                            buffer);

speech.speak('OK的啦今天天气不错?出去玩不','zh',1,5,3,5,4)