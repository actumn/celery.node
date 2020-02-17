import { assert } from 'chai';
import RedisBroker from '../../../src/kombu/brokers/redis';

const redisUrl = 'redis://localhost:6379/1';


describe('redis broker', () => {
  describe('publish', () => {
    it('just publish', (done) => {
      const broker = new RedisBroker(redisUrl, {});

      broker.publish('publish', '{ "a": 1 }').then((reply) => {
        assert.isNumber(reply);
        broker.disconnect()
          .then(() => done());
      });
    });
  });

  describe('subscribe', () => {
    it('with publish', (done) => {
      const broker = new RedisBroker(redisUrl, {});

      broker.publish('subscribe', '{ "a": 1 }')
        .then(() => broker.subscribe('subscribe', (body) => {
          assert.deepEqual(body, { a: 1 });
          broker.disconnect()
            .then(() => done());
        }));
    });

    it('with empty queue', (done) => {
      const broker = new RedisBroker(redisUrl, {});

      broker.subscribe('empty', (body) => {
        assert.equal(body, null);

        broker.disconnect()
          .then(() => done());
      });
    });
  });
});
