import * as Redis from 'ioredis';
import * as urllib from 'url';
import { CeleryBackend } from '.';

/**
 * celery key preifx for redis result key
 * @private
 * @constant
 *
 * @type {String}
 */
const keyPrefix = 'celery-task-meta-';

/**
 * codes from bull: https://github.com/OptimalBits/bull/blob/129c6e108ce67ca343c8532161d06742d92b651c/lib/queue.js#L296-L310
 * @private
 * @param {String} urlString
 */
function redisOptsFromUrl(urlString: string): Redis.RedisOptions {
  const redisOpts = {} as Redis.RedisOptions;
  try {
    const redisUrl = urllib.parse(urlString);
    redisOpts.port = +redisUrl.port || 6379;
    redisOpts.host = redisUrl.hostname;
    redisOpts.db = redisUrl.pathname ? +redisUrl.pathname.split('/')[1] : 0;
    if (redisUrl.auth) {
      [, redisOpts.password] = redisUrl.auth.split(':');
    }
  } catch (e) {
    throw new Error(e.message);
  }
  return redisOpts;
}

/**
 * @exports
 */
export default class RedisBackend implements CeleryBackend {
  redis: Redis.Redis;

  /**
   * Redis backend class
   * @constructor RedisBackend
   * @param {string} url the connection string of redis
   * @param {object} opts the options object for redis connect of ioredis
   */
  constructor(url: string, opts: object) {
    this.redis = new Redis({
      ...redisOptsFromUrl(url),
      ...opts,
    });
  }

  /**
   * codes from here: https://github.com/OptimalBits/bull/blob/129c6e108ce67ca343c8532161d06742d92b651c/lib/utils.js#L21-L44
   * @method RedisBackend#isReady
   * @returns {Promise} promises that continues if redis connected.
   */
  isReady(): Promise<void> {
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
  disconnect(): Promise<string> {
    return this.redis.quit();
  }

  /**
   * @method RedisBackend#storeResult
   * @param {String} taskId
   * @param {*} result
   * @param {String} state
   */
  storeResult(
    taskId: string, 
    result: any, 
    state: string
  ): Promise<["OK", number]> {
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
  getTaskMeta(taskId: string): Promise<any> {
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
  set(
    key: string, 
    value: string
  ): Promise<["OK", number]> {
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
  get(key: string): Promise<string> {
    return this.redis.get(key);
  }
}
