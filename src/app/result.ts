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
  _promise: Promise<any>;

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
    this._promise = null;
  }

  /**
   * @method AsyncResult#get
   * @returns {Promise}
   */
  get(timeout?: number): Promise<any> {
    if (this._promise) {
      return this._promise;
    }

    const p = new Promise((resolve, reject) => {
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

            if (["FAILURE", "REVOKED"].includes(msg.status)) {
              reject(createError(msg.status, msg.result));
            } else {
              this.result = msg.result;
              resolve(this.result);
            }
          }
        });
      }, 500);
    });
    this._promise = p;
    return p;
  }
}
