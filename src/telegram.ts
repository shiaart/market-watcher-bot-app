const HttpsProxyAgent = require('https-proxy-agent');
import { Telegram } from 'telegraf';

const DefaultOptions = {
    apiRoot: 'https://api.telegram.org',
    webhookReply: true,
    agent: new HttpsProxyAgent({
      host: process.env.PROXY_HOST,
      port: process.env.PROXY_PORT,
      keepAlive: true,
      keepAliveMsecs: 10000
    })
  };

const telegram = new Telegram(process.env.TELEGRAM_TOKEN, DefaultOptions);
export default telegram;
