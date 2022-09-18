'use strict';
const {
  createLike,
  hasLike,
  getLikeCount,
} = require('../database/stockLikeService');
const { createHash, getStockData } = require('../utils/stocks');
const { AxiosError } = require('axios');

module.exports = function (app) {
  app.route('/api/stock-prices').get(async function (req, res) {
    try {
      const { symbol, like = 'false' } = req.query;
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const hash = createHash(ip);
      let stocks = [];
      let stocksData = [];
      let requests = [];
      let responses = [];
      let output = null;

      // check if symbol is array
      const notArray = !Array.isArray(symbol);

      if (notArray) {
        stocks.push(symbol);
      } else {
        stocks = symbol;
      }

      // get stock data
      for (const stock of stocks) {
        const notString = typeof stock !== 'string' || stock == '';

        if (notString) {
          return res
            .status(400)
            .send('symbol must be a string and cannot be empty');
        }

        requests.push(getStockData(stock));
      }

      // catch promises and store stock data
      stocksData = await Promise.all(requests);

      // reset requests array
      requests = [];

      // process likes
      if (like == 'true') {
        for (const stock of stocksData) {
          requests.push(hasLike(hash, stock.symbol));
        }

        // responses will be an array of booleans
        responses = await Promise.all(requests);
        requests = [];

        for (let i = 0; i < responses.length; i++) {
          const haventLiked = !responses[i];

          if (haventLiked) {
            const stock = stocksData[i].symbol;
            requests.push(createLike(hash, stock));
          }
        }
      }

      await Promise.all(requests);
      requests = [];

      // get stock like count
      // iterate through each stockdata to get like count in database
      for (const stock of stocksData) {
        requests.push(getLikeCount(stock.symbol));
      }

      responses = await Promise.all(requests);

      // if only 1 item in stock data, append "likes" property
      if (stocksData.length == 1) {
        output = stocksData[0];
        output.likes = responses[0];
      } else {
        // if more than 1 item in stock data, find difference in like count and
        // append rel_likes property to each
        const [like1, like2] = responses;
        const diff = like1 - like2;

        for (const stock of stocksData) {
          stock.rel_like = diff;
        }

        output = stocksData;
      }

      res.status(200).json({ stockData: output });
    } catch (error) {
      if (error instanceof AxiosError) {
        const {
          response: { status, data },
          code,
        } = error;

        console.log({ data, code, status });

        return res.status(status).json({ error: data });
      }

      console.log(error);

      if (typeof error === 'string') {
        return res.status(400).send({ error });
      }

      res.send({ error: error.message });
    }
  });
};
