require('dotenv').config();
import Telegraf from 'telegraf';
import schedule from 'node-schedule';
import axios from 'axios';

let bot = new Telegraf(process.env.TELEGRAM_TOKEN);
if (process.env.NODE_ENV !== 'production') {
  console.log('Dev mode, adding proxy');
  const HttpsProxyAgent = require('https-proxy-agent');
  const agent = new HttpsProxyAgent('http://45.132.18.106:8888');
  const DefaultOptions = {
    telegram: {
      agent: agent,
    },
  };

  bot = new Telegraf(process.env.TELEGRAM_TOKEN, DefaultOptions);
}

bot.hears(/[$]([A-Z]+)/, (ctx) => {
  const stock = ctx.message.text.trim().substring(1);
  console.log(stock);

  axios.get('http://45.132.18.106:5000/symbol/' + stock).then(function (response) {
    // handle success
    // console.log(response);
    ctx.reply(response.data.company.news[0]);
    // ctx.reply(response.data.company.news[1]);
    // ctx.reply(response.data.company.news[2]);
  }).catch(function (error) {
    // handle error
    ctx.reply('No news for :' + stock);
  });
  // return ctx.reply(`Recognized: ${stock}`);
});

// schedule.scheduleJob('30 * * * * *', function () {
//   bot.telegram.sendMessage(
//     -1001201523934,
//     'Здарова черти, я еще живой. как там на рынке?'
//   );
// });

bot.startPolling();
