import { CeleryBackend } from "../backends";

function createError(message: string, data: object): Error {
  const error = new Error(message);
  Object.assign(error, data);
  return error;
}

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
          reject(createError("TIMEOUT", {}));
        }, timeout);
      }

      intervalId = setInterval(() => {
        this.backend.getTaskMeta(this.taskId).then(msg => {
          if (msg) {
            if (timeout) {
              clearTimeout(timeoutId);
            }
            clearInterval(intervalId);

            if (msg.status === "SUCCESS") {
              this.result = msg.result;
              resolve(this.result);
            } else {
              reject(createError(msg.status, msg.result));
            }
          }
        });
      }, 500);
    });
  }
}
