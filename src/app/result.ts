import { CeleryBackend } from "../backends";

export class AsyncResult {
  taskId: string;
  backend: CeleryBackend;
  result: any;

  /**
   * Asynchronous Result
   * @constructor AsyncResult
   * @param {string} taskId task id
   * @param {CeleryBackend} backend celery backend instance
   */
  constructor(taskId: string, backend: CeleryBackend) {
    this.taskId = taskId;
    this.backend = backend;
    this.result = null;
  }

  /**
   * @method AsyncResult#get
   * @returns {Promise}
   */
  get(): Promise<AsyncResult> {
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
