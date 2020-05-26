require('dotenv').config();
import Telegraf from 'telegraf';
import schedule from 'node-schedule';
import axios from 'axios';
import OpenAPI, {
  MarketInstrument,
  MarketInstrumentList,
  CandleStreaming,
} from '@tinkoff/invest-openapi-js-sdk';

const sandboxApiURL = 'https://api-invest.tinkoff.ru/openapi/sandbox/';
const socketURL = 'wss://api-invest.tinkoff.ru/openapi/md/v1/md-openapi/ws';
const sandboxToken = process.env.SANDBOX_TOKEN; // токен для сандбокса
const api = new OpenAPI({
  apiURL: sandboxApiURL,
  secretToken: sandboxToken as string,
  socketURL,
});

// prettier-ignore
const usList = ['AAPL']; // , 'TXN', 'NEE', 'UNH', 'LMT', 'ACN', 'HD', 'V', 'MCD', 'ROST'];
// prettier-ignore
const ruList = ['SBER']; // , 'TCSG', 'TATN', 'TATNP', 'DSKY', 'LKOH', 'MOEX', 'MTSS', 'CHMF', 'PHOR', 'GAZP', 'UPRO', 'FXWO'];

const candlesCache = new Map<string, CandleStreaming>();

const printPrices = function (inst: MarketInstrument) {
  console.log('getting candle for:' + inst.ticker);
  const figi = inst.figi;

  api.candle({ figi, interval: '2hour' }, (x) => {
    console.log(
      inst.ticker +
        ' ' +
        x.interval +
        ' low:' +
        x.l +
        ' high:' +
        x.h +
        ' vol:' +
        x.v +
        '\n'
    );

    candlesCache.set(inst.ticker + '|' + x.interval, x);
  });

  api.candle({ figi, interval: '4hour' }, (x) => {
    console.log(
      inst.ticker +
        ' ' +
        x.interval +
        ' low:' +
        x.l +
        ' high:' +
        x.h +
        ' vol:' +
        x.v +
        '\n'
    );

    candlesCache.set(inst.ticker + '|' + x.interval, x);
  });

  api.candle({ figi, interval: 'day' }, (x) => {
    console.log(
      inst.ticker +
        ' ' +
        x.interval +
        ' low:' +
        x.l +
        ' high:' +
        x.h +
        ' vol:' +
        x.v +
        '\n'
    );

    candlesCache.set(inst.ticker + '|' + x.interval, x);
  });

  api.candle({ figi, interval: 'week' }, (x) => {
    console.log(
      inst.ticker +
        ' ' +
        x.interval +
        ' low:' +
        x.l +
        ' high:' +
        x.h +
        ' vol:' +
        x.v +
        '\n'
    );
    candlesCache.set(inst.ticker + '|' + x.interval, x);
  });

};

!(async function run() {
  const stockList = await Promise.all(
    usList.map(
      async (stock): Promise<MarketInstrument> => {
        return (await api.searchOne({ ticker: stock })) as MarketInstrument;
      }
    )
  );

  stockList.forEach((inst) => console.log(inst.ticker + ';'));

  const figi  = stockList[0].figi;
  const unsubFromAAPL = api.orderbook({ figi }, (ob) => { console.log(stockList[0].ticker + ' bids: '  + ob.bids) });

  stockList.forEach((x) => {
    printPrices(x);
  });
})();

let bot = new Telegraf(process.env.TELEGRAM_TOKEN);
if (process.env.NODE_ENV !== 'production') {
  console.log('Dev mode, adding proxy');
  const HttpsProxyAgent = require('https-proxy-agent');
  const agent = new HttpsProxyAgent(process.env.PROXY);
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

  axios.get('http://localhost:5000/symbol/' + stock).then(function (response) {
    // handle success
    // console.log(response);
    ctx.reply(response.data.company.news[0]);
    // ctx.reply(response.data.company.news[1]);
    // ctx.reply(response.data.company.news[2]);
  }).catch(function (error) {
    // handle error
    ctx.reply('No news for :' + error);
  });
  // return ctx.reply(`Recognized: ${stock}`);
});

schedule.scheduleJob('10 * * * * *', function () {
  const msg = candlesCache.forEach((value: CandleStreaming, key: string) => {
    bot.telegram.sendMessage(
      -1001201523934,
      '🚀🚀🚀  ' + key.split('|')[0] + ' пробиваем ' + value.interval + ' уровень ' + value.h + '  Объем: ' + value.v
    );
  });

  // bot.telegram.sendMessage(
  //   -1001201523934,
  //   'Здарова черти, я еще живой. как там на рынке?'
  // );
});

bot.startPolling();
