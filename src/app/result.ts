export default class AsyncResult {
  /**
   * Asynchronous Result
   * @constructor AsyncResult
   * @param {String} taskId task id
   * @param {AMQPBackend | RedisBackend} backend celery backend instance
   */
  constructor(taskId, backend) {
    this.taskId = taskId;
    this.backend = backend;
    this.result = null;
  }

  /**
   * @method AsyncResult#get
   * @returns {Promise}
   */
  get() {
    return new Promise((resolve, reject) => {
      if (!this.result) {
        this.backend.getTaskMeta(this.taskId)
          .then((msg) => {
            this.result = msg;
            resolve(this.result);
          })
          .catch(reject);
      } else {
        resolve(this.result);
      }
    });
  }
}
