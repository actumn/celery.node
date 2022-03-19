import { CeleryBackend } from "../backends";

const isFinalStatus = {
  SUCCESS: true,
  FAILURE: true,
  REVOKED: true,
}
const isErrorStatus = {
  TIMEOUT: true,
  FAILURE: true,
  REVOKED: true,
}

function createError(message: string, data: object): Error {
  const error = new Error(message);
  Object.assign(error, data);
  return error;
}

export class AsyncResult {
  taskId: string;
  backend: CeleryBackend;
  private _cache: Promise<any>;

  /**
   * Asynchronous Result
   * @constructor AsyncResult
   * @param {string} taskId task id
   * @param {CeleryBackend} backend celery backend instance
   */
  constructor(taskId: string, backend: CeleryBackend) {
    this.taskId = taskId;
    this.backend = backend;
    this._cache = null;
  }

  /**
   * @method AsyncResult#get
   * @returns {Promise}
   */
  public get(timeout?: number, interval = 500): Promise<any> {
    const waitFor = (resolve: (value?: object) => void) => {
      let timeoutId: NodeJS.Timeout; // eslint-disable-line prefer-const
      let intervalId: NodeJS.Timeout; // eslint-disable-line prefer-const

      if (timeout) {
        timeoutId = setTimeout(() => {
          clearInterval(intervalId);
          resolve({status: "TIMEOUT", result: {}});
        }, timeout);
      }

      intervalId = setInterval(() => {
        this.backend.getTaskMeta(this.taskId).then(meta => {
          if (meta && isFinalStatus[meta["status"]]) {
            if (timeout) {
              clearTimeout(timeoutId);
            }
            clearInterval(intervalId);
            resolve(meta);
          }
        });
      }, interval);
    };

    if (!this._cache) {
      this._cache = new Promise<object>((resolve) => {
        waitFor(resolve);
      });
    } else {
      const p = new Promise<object>((resolve) => {
        this._cache.then(meta => {
          if (meta && isFinalStatus[meta["status"]]) {
            resolve(meta);
          } else {
            waitFor(resolve);
          }
        });
      });
      
      this._cache = p;
    }

    return this._cache.then((meta) => {
      if (isErrorStatus[meta["status"]]) {
        throw createError(meta["status"], meta["result"]);
      } else {
        return meta["result"];
      }
    });
  }

  private getTaskMeta(): Promise<object> {
    if (!this._cache) {
      this._cache = new Promise<object>((resolve) => {
        this.backend.getTaskMeta(this.taskId)
          .then(resolve);
      });
    } else {
      const p = new Promise<object>((resolve) => {
        this._cache.then(meta => {
            if (meta && isFinalStatus[meta["status"]]) {
              resolve(meta);
            } else {
              this.backend.getTaskMeta(this.taskId)
                .then(resolve);
            }
          })
      });
      this._cache = p;
    }

    return this._cache;
  }

  public result(): Promise<any> {
    return this.getTaskMeta()
      .then((meta) => {
        if (meta) {
          return meta["result"];
        } else {
          return null;
        }
      });
  }

  public status(): Promise<string> {
    return this.getTaskMeta()
      .then((meta) => {
        if (meta) {
          return meta["status"];
        } else {
          return null;
        }
      });
  }
}
