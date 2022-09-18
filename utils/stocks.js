const axios = require('axios').default;
const crypto = require('crypto');

exports.createHash = function (ip) {
  const secret = process.env.HASH_SECRET;
  const hash = crypto.createHmac('sha256', secret).update(ip).digest('hex');

  return hash;
};

exports.getStockData = async function (symbol) {
  // console.log('getting stock data for ', symbol);
  const url = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol}/quote`;
  const { data } = await axios.get(url);

  if (typeof data === 'string') {
    throw data;
  }

  const { symbol: sym, latestPrice } = data;

  return { symbol: sym, price: latestPrice };
};
