"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const isFinalStatus = {
    SUCCESS: true,
    FAILURE: true,
    REVOKED: true,
};
const isErrorStatus = {
    TIMEOUT: true,
    FAILURE: true,
    REVOKED: true,
};
function createError(message, data) {
    const error = new Error(message);
    Object.assign(error, data);
    return error;
}
class AsyncResult {
    /**
     * Asynchronous Result
     * @constructor AsyncResult
     * @param {string} taskId task id
     * @param {CeleryBackend} backend celery backend instance
     */
    constructor(taskId, backend) {
        this.taskId = taskId;
        this.backend = backend;
        this._cache = null;
    }
    /**
     * @method AsyncResult#get
     * @returns {Promise}
     */
    get(timeout, interval = 500) {
        const waitFor = (resolve) => {
            let timeoutId; // eslint-disable-line prefer-const
            let intervalId; // eslint-disable-line prefer-const
            if (timeout) {
                timeoutId = setTimeout(() => {
                    clearInterval(intervalId);
                    resolve({ status: "TIMEOUT", result: {} });
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
            this._cache = new Promise((resolve) => {
                waitFor(resolve);
            });
        }
        else {
            const p = new Promise((resolve) => {
                this._cache.then(meta => {
                    if (meta && isFinalStatus[meta["status"]]) {
                        resolve(meta);
                    }
                    else {
                        waitFor(resolve);
                    }
                });
            });
            this._cache = p;
        }
        return this._cache.then((meta) => {
            if (isErrorStatus[meta["status"]]) {
                throw createError(meta["status"], meta["result"]);
            }
            else {
                return meta["result"];
            }
        });
    }
    getTaskMeta() {
        if (!this._cache) {
            this._cache = new Promise((resolve) => {
                this.backend.getTaskMeta(this.taskId)
                    .then(resolve);
            });
        }
        else {
            const p = new Promise((resolve) => {
                this._cache.then(meta => {
                    if (meta && isFinalStatus[meta["status"]]) {
                        resolve(meta);
                    }
                    else {
                        this.backend.getTaskMeta(this.taskId)
                            .then(resolve);
                    }
                });
            });
            this._cache = p;
        }
        return this._cache;
    }
    result() {
        return this.getTaskMeta()
            .then((meta) => {
            if (meta) {
                return meta["result"];
            }
            else {
                return null;
            }
        });
    }
    status() {
        return this.getTaskMeta()
            .then((meta) => {
            if (meta) {
                return meta["status"];
            }
            else {
                return null;
            }
        });
    }
}
exports.AsyncResult = AsyncResult;
