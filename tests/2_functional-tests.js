const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const { truncateTable } = require('../database/stockLikeService');

chai.use(chaiHttp);
const urlEndpoint = '/api/stock-prices';

suite('Functional Tests', function () {
  test('Viewing one stock: GET request to /api/stock-prices/', (done) => {
    const stock = 'a';
    const propery = 'stockData';

    chai
      .request(server)
      .get(urlEndpoint)
      .query({ stock})
      .then((res) => {
        console.log(res.body)
        assert.property(res.body, propery);
        const { stockData } = res.body;

        assert.typeOf(stockData.stock, 'string');
        assert.typeOf(stockData.price, 'number');
        assert.typeOf(stockData.likes, 'number');

        return truncateTable().then(() => done());
      });
  });

  test('Viewing one stock and liking it: GET request to /api/stock-prices/', (done) => {
    const stock = 'a';
    const propery = 'stockData';

    chai
      .request(server)
      .get(urlEndpoint)
      .query({ stock, like: 'true' })
      .then((res) => {
        assert.property(res.body, propery);
        const { stockData } = res.body;

        assert.typeOf(stockData.stock, 'string');
        assert.typeOf(stockData.price, 'number');
        assert.typeOf(stockData.likes, 'number');

        assert.isAbove(stockData.likes, 0);

        return truncateTable().then(() => {
          done();
        });
      });
  });

  test('Viewing the same stock and liking it again: GET request to /api/stock-prices/', (done) => {
    const stock = 't';
    const propery = 'stockData';

    chai
      .request(server)
      .get(urlEndpoint)
      .query({ stock, like: 'true' })
      .then(() => {
        return chai
          .request(server)
          .get(urlEndpoint)
          .query({ stock, like: 'true' });
      })
      .then((res) => {
        assert.property(res.body, propery);
        const { stockData } = res.body;

        assert.typeOf(stockData.stock, 'string');
        assert.typeOf(stockData.price, 'number');
        assert.typeOf(stockData.likes, 'number');

        assert.isAbove(stockData.likes, 0);
        assert.equal(stockData.likes, 1);

        return truncateTable().then(() => {
          done();
        });
      })
      .catch((e) => {
        console.log(e);
      });
  }).timeout(3000);

  test('Viewing two stocks: GET request to /api/stock-prices/', (done) => {
    const symbols = ['a', 't'];

    chai
      .request(server)
      .get(urlEndpoint)
      .query({ stock: symbols })
      .then((res) => {
        const {stockData} = res.body;
        assert.isArray(stockData);

        for (const data of stockData) {
          assert.typeOf(data.stock, 'string');
          assert.typeOf(data.price, 'number');
          assert.typeOf(data.rel_likes, 'number');
        }

        return truncateTable().then(() => {
          done();
        });
      })
      .catch((e) => {
        console.log(e);
      });
  });

  test('Viewing two stocks and liking them: GET request to /api/stock-prices/', (done) => {
    const symbols = ['a', 't'];

    chai
      .request(server)
      .get(urlEndpoint)
      .query({ stock: symbols, like: 'true' })
      .then((res) => {
        const {stockData} = res.body;
        assert.isArray(stockData);

        for (const data of stockData) {
          assert.typeOf(data.stock, 'string');
          assert.typeOf(data.price, 'number');
          assert.typeOf(data.rel_likes, 'number');
        }

        return truncateTable().then(() => {
          done();
        });
      })
      .catch((e) => {
        console.log(e);
      });
  });
}).timeout(3000);
