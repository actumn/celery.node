import * as Redis from "ioredis";
import { CeleryBackend } from ".";

/**
 * celery key preifx for redis result key
 * @private
 * @constant
 *
 * @type {string}
 */
const keyPrefix = "celery-task-meta-";

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
    this.redis = new Redis(url, {...opts});
  }

  /**
   * codes from here: https://github.com/OptimalBits/bull/blob/129c6e108ce67ca343c8532161d06742d92b651c/lib/utils.js#L21-L44
   * @method RedisBackend#isReady
   * @returns {Promise} promises that continues if redis connected.
   */
  public isReady(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.redis.status === "ready") {
        resolve();
      } else {
        let handleError; // eslint-disable-line prefer-const
        const handleReady = () => {
          this.redis.removeListener("error", handleError);
          resolve();
        };
        handleError = err => {
          this.redis.removeListener("ready", handleReady);
          reject(err);
        };

        this.redis.once("ready", handleReady);
        this.redis.once("error", handleError);
      }
    });
  }

  /**
   * @method RedisBackend#disconnect
   * @returns {Promise} promises that continues if redis disconnected.
   */
  public disconnect(): Promise<string> {
    return this.redis.quit();
  }

  /**
   * @method RedisBackend#storeResult
   * @param {string} taskId
   * @param {*} result
   * @param {string} state
   */
  public storeResult(
    taskId: string,
    result: any,
    state: string
  ): Promise<["OK", number]> {
    return this.set(
      `${keyPrefix}${taskId}`,
      JSON.stringify({
        status: state,
        result: state == 'FAILURE' ? null : result,
        traceback: result,
        children: [],
        task_id: taskId,
        date_done: new Date().toISOString()
      })
    );
  }

  /**
   * @method RedisBackend#getTaskMeta
   * @param {string} taskId
   * @returns {Promise}
   */
  public getTaskMeta(taskId: string): Promise<object> {
    return this.get(`${keyPrefix}${taskId}`).then(msg => JSON.parse(msg));
  }

  /**
   * @method RedisBackend#set
   * @private
   * @param {String} key
   * @param {String} value
   * @returns {Promise}
   */
  private set(key: string, value: string): Promise<["OK", number]> {
    return Promise.all([
      this.redis.setex(key, 86400, value),
      this.redis.publish(key, value) // publish command for subscribe
    ]);
  }

  /**
   * @method RedisBackend#get
   * @private
   * @param {string} key
   * @return {Promise}
   */
  private get(key: string): Promise<string> {
    return this.redis.get(key);
  }
}
