import Redis from 'ioredis';

/**
 * celery key preifx for redis result key
 * @private
 * @constant
 *
 * @type {String}
 */
const keyPrefix = 'celery-task-meta-';

export default class RedisBackend {
  /**
   * Redis backend class
   * @constructor RedisBackend
   * @param {object} opts the options object for redis connect of ioredis
   */
  constructor(opts) {
    this.redis = new Redis(opts);
  }

  /**
   * codes from here: https://github.com/OptimalBits/bull/blob/129c6e108ce67ca343c8532161d06742d92b651c/lib/utils.js#L21-L44
   * @method RedisBackend#isReady
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
   * @method RedisBackend#disconnect
   * @returns {Promise} promises that continues if redis disconnected.
   */
  disconnect() {
    return this.redis.quit();
  }

  /**
   * @method RedisBackend#storeResult
   * @param {String} taskId
   * @param {*} result
   * @param {String} state
   */
  storeResult(taskId, result, state) {
    return this.set(`${keyPrefix}${taskId}`, JSON.stringify({
      status: state,
      result,
      traceback: null,
      children: [],
      task_id: taskId,
      date_done: new Date().toISOString(),
    }));
  }

  /**
   * @method RedisBackend#getTaskMeta
   * @param {String} taskId
   * @returns {Promise}
   */
  getTaskMeta(taskId) {
    return this.get(`${keyPrefix}${taskId}`)
      .then(msg => JSON.parse(msg));
  }

  /**
   * @method RedisBackend#set
   * @private
   * @param {String} key
   * @param {String} value
   * @returns {Promise}
   */
  set(key, value) {
    return Promise.all([
      this.redis.setex(key, 86400, value),
      this.redis.publish(key, value), // publish command for subscribe
    ]);
  }

  /**
   * @method RedisBackend#get
   * @private
   * @param {String} key
   * @return {Promise}
   */
  get(key) {
    return this.redis.get(key);
  }
}
