import { CeleryBackend } from "../backends";

type AsyncResultStatus = "PENDING" | "SUCCESS" | "FAILURE" | "TIMEOUT";

export class AsyncResult {
  taskId: string;
  backend: CeleryBackend;
  status: AsyncResultStatus;
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
    this.status = "PENDING";
    this.result = null;
  }

  /**
   * @method AsyncResult#get
   * @returns {Promise}
   */
  get(timeout?: number): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.result) {
        resolve(this.result);
      }

      let timeoutId: NodeJS.Timeout; // eslint-disable-line prefer-const
      let intervalId: NodeJS.Timeout; // eslint-disable-line prefer-const

      if (timeout) {
        timeoutId = setTimeout(() => {
          clearInterval(intervalId);
          this.status = "TIMEOUT";
          resolve(null);
        }, timeout);
      }

      intervalId = setInterval(() => {
        this.backend.getTaskMeta(this.taskId).then(msg => {
          if (msg) {
            if (timeout) {
              clearTimeout(timeoutId);
            }
            clearInterval(intervalId);

            this.status = msg.status;
            this.result = msg.result;
            resolve(this.result);
          }
        });
      }, 500);
    });
  }
}
