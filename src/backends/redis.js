import Redis from 'ioredis';

const keyPrefix = 'celery-task-meta-';

export default class RedisBackend {
  constructor(opts) {
    this.redis = new Redis(opts);
  }

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

  getTaskMeta(taskId) {
    return this.get(`${keyPrefix}${taskId}`)
      .then(msg => JSON.parse(msg));
  }

  // codes from here: https://github.com/OptimalBits/bull/blob/129c6e108ce67ca343c8532161d06742d92b651c/lib/utils.js#L21-L44
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

  disconnect() {
    return Promise.all([
      this.redis.quit(),
    ]);
  }

  set(key, value) {
    return Promise.all([
      this.redis.setex(key, 86400, value),
      this.redis.publish(key, value), // publish command for subscribe
    ]);
  }

  get(key) {
    return this.redis.get(key);
  }
}
