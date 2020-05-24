require('dotenv').config();
import Telegraf from 'telegraf';
import schedule from 'node-schedule';

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

bot.start((ctx) => ctx.reply('Welcome'));

bot.help((ctx) => ctx.reply('Send me a sticker'));
bot.on('sticker', (ctx) => {
  console.log(
    'Message from: ' + ctx.message.chat.id + '; Content: ' + ctx.message.text
  );
  ctx.reply('Баян');
});
bot.hears('hi', (ctx) => {
  console.log(
    'Message from: ' + ctx.message.chat.id + '; Content: ' + ctx.message.text
  );
  ctx.reply('йо бро');
});

schedule.scheduleJob('30 * * * * *', function () {
  bot.telegram.sendMessage(
    -1001201523934,
    'Здарова черти, я еще живой. как там на рынке?'
  );
  // bot.telegram.sendMessage('', 'Здарова черти, я еще живой. как там на рынке?');
});

bot.startPolling();
