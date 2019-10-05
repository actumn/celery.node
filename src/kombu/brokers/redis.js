import Redis from 'ioredis';
import uuid from 'uuid';
import logger from '../../logger';

export default class RedisBroker {
  /**
   * Redis broker class
   * @constructor RedisBroker
   * @param {object} opts the options object for redis connect of ioredis
   */
  constructor(opts) {
    this.redis = new Redis(opts);
  }

  /**
   * codes from here: https://github.com/OptimalBits/bull/blob/129c6e108ce67ca343c8532161d06742d92b651c/lib/utils.js#L21-L44
   * @method RedisBroker#isReady
   * @returns {Promise} promises that continues if redis connected.
   */
  isReady() {
    return new Promise((resolve, reject) => {
      if (this.redis.status === 'ready') {
        resolve();
      } else {
        let handleError;
        const handleReady = () => {
          this.redis.removeListener('error', handleError);
          resolve();
        };
        handleError = (err) => {
          this.redis.removeListener('ready', handleReady);
          reject(err);
        };

        this.redis.once('ready', handleReady);
        this.redis.once('error', handleError);
      }
    });
  }

  /**
   * @method RedisBroker#disconnect
   * @returns {Promise} promises that continues if redis disconnected.
   */
  disconnect() {
    return this.redis.quit();
  }

  /**
   * @method RedisBroker#publish
   * @param {String} queue
   * @param {String} message
   * @returns {Promise}
   */
  publish(queue, message) {
    return new Promise((resolve, reject) => {
      this.redis.lpush(queue, JSON.stringify({
        body: Buffer.from(message).toString('base64'),
        headers: {},
        'content-type': 'application/json',
        'content-encoding': 'utf-8',
        properties: {
          body_encoding: 'base64',
          delivery_info: {
            exchange: queue,
            priority: 0,
            routing_key: queue,
          },
          delivery_mode: 2,
          delivery_tag: uuid.v4(),
          reply_to: uuid.v4(),
        },
      }), (err, reply) => {
        if (err) {
          reject(err);
        } else {
          resolve(reply);
        }
      });
    });
  }

  /**
   * @method RedisBroker#subscribe
   * @param {String} queue
   * @param {Function} callback
   * @returns {Promise}
   */
  subscribe(queue, callback) {
    const promiseCount = 1;
    const promises = [];

    return this.isReady()
      .then(() => {
        for (let index = 0; index < promiseCount; index += 1) {
          promises.push(
            new Promise(() => this.consumeTasks(index, queue, callback)),
          );
        }

        return Promise.all(promises);
      });
  }

  /**
   * @private
   * @param {Number} index
   * @param {String} queue
   * @param {Function} callback
   */
  consumeTasks(index, queue, callback) {
    process.nextTick(() => this.consumeTaskOnNextTick(index, queue, callback));
  }

  /**
   * @private
   * @param {Number} index
   * @param {String} queue
   * @param {Function} callback
   * @returns {Promise}
   */
  consumeTaskOnNextTick(index, queue, callback) {
    return this.basicConsume(queue)
      .then((body) => {
        callback(body);
        Promise.resolve();
      })
      .then(() => this.consumeTasks(index, queue, callback))
      .catch(err => logger.error(err));
  }

  /**
   * @private
   * @param {String} queue
   * @return {Promise}
   */
  basicConsume(queue) {
    return new Promise((resolve, reject) => {
      this.redis.brpop(queue, 5, (err, item) => {
        if (err) {
          reject(err);
        } else if (item) {
          const task = JSON.parse(item[1]);
          // now supports only application/json of content-type
          if (task['content-type'] !== 'application/json') {
            throw new Error(`unsupported content type ${task['content-type']}`);
          }
          // now supports only base64 of body_encoding
          if (task.properties.body_encoding !== 'base64') {
            throw new Error(`unsupported body encoding ${task.properties.body_encoding}`);
          }
          // now supports only utf-9 of content-encoding
          if (task['content-encoding'] !== 'utf-8') {
            throw new Error(`unsupported content encoding ${task['content-encoding']}`);
          }

          const body = Buffer.from(task.body, 'base64').toString('utf-8');

          resolve(JSON.parse(body));
        } else {
          resolve(null);
        }
      });
    });
  }
}
