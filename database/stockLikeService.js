const supabase = require('./index');
const table = 'stock_likes';
const axios = require('axios').default;
const crypto = require('crypto');

exports.createHash = function (ip) {
  const secret = process.env.HASH_SECRET;
  const hash = crypto.createHmac('sha256', secret).update(ip).digest('hex');

  return hash;
};

exports.getStockData = async function (symbol) {
  console.log('getting stock data for ', symbol);
  const url = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol}/quote`;
  const { data } = await axios.get(url);

  if (typeof data === 'string') {
    throw data;
  }

  const { symbol: sym, latestPrice } = data;

  return { symbol: sym, price: latestPrice };
};

exports.hasLike = async function (hash, symbol) {
  console.log('hasLike was called');
  const { data, error } = await supabase
    .from(table)
    .select('hash', 'symbol')
    .match({
      hash,
      symbol,
    });

  if (error) throw error;

  console.log(`has like data:`, data);
  const hasLikes = Array.isArray(data) && data.length !== 0;

  return hasLikes;
};

exports.createLike = async function (hash, symbol) {
  console.log('create like');
  const { data, error } = await supabase.from(table).insert([{ hash, symbol }]);

  if (error) throw error;

  console.log(`created like for stock `, symbol);
};

exports.getLikeCount = async function (symbol) {
  console.log('get like count for ', symbol);
  const { data, error } = await supabase
    .from(table)
    .select('symbol')
    .eq('symbol', symbol);

  console.log('like count data', data);

  if (error) throw error;

  if (data === null) throw 'like count error';

  console.log(`like count of ${symbol} =`, data);
  return data.length;
};
