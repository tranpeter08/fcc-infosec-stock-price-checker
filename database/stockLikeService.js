const supabase = require('./index');
const table =
  process.env.NODE_ENV === 'test' ? 'stock_likes_test' : 'stock_likes';

function stockLikesService(tableName) {
  const table = tableName;

  return {
    hasLike: async function (hash, symbol) {
      // console.log('hasLike was called');
      const { data, error } = await supabase
        .from(table)
        .select('hash', 'symbol')
        .match({
          hash,
          symbol,
        });

      if (error) throw error;

      // console.log(`has like data:`, data);
      const hasLikes = Array.isArray(data) && data.length !== 0;

      return hasLikes;
    },
    createLike: async function (hash, symbol) {
      // console.log('create like');
      const { data, error } = await supabase
        .from(table)
        .insert([{ hash, symbol }]);

      if (error) throw error;

      // console.log(`created like for stock `, symbol);
    },

    getLikeCount: async function (symbol) {
      // console.log('get like count for ', symbol);
      const { data, error } = await supabase
        .from(table)
        .select('symbol')
        .eq('symbol', symbol);

      // console.log('like count data', data);

      if (error) throw error;

      if (data === null) throw 'like count error';

      // console.log(`like count of ${symbol} =`, data);
      return data.length;
    },

    truncateTable: async function () {
      await supabase.from(table).delete().neq('hash', 'null');
    },
  };
}

exports.stockLikesService = stockLikesService;
module.exports = stockLikesService(table);
