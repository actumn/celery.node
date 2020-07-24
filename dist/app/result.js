"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AsyncResult = /** @class */ (function () {
    /**
     * Asynchronous Result
     * @constructor AsyncResult
     * @param {string} taskId task id
     * @param {CeleryBackend} backend celery backend instance
     */
    function AsyncResult(taskId, backend) {
        this.taskId = taskId;
        this.backend = backend;
        this.result = null;
    }
    /**
     * @method AsyncResult#get
     * @returns {Promise}
     */
    AsyncResult.prototype.get = function (timeout) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.result) {
                resolve(_this.result);
            }
            var timeoutId; // eslint-disable-line prefer-const
            var intervalId; // eslint-disable-line prefer-const
            if (timeout) {
                timeoutId = setTimeout(function () {
                    clearInterval(intervalId);
                    resolve(null);
                }, timeout);
            }
            intervalId = setInterval(function () {
                _this.backend.getTaskMeta(_this.taskId).then(function (msg) {
                    if (msg) {
                        if (timeout) {
                            clearTimeout(timeoutId);
                        }
                        clearInterval(intervalId);
                        _this.result = msg.result;
                        resolve(_this.result);
                    }
                });
            }, 500);
        });
    };
    return AsyncResult;
}());
exports.AsyncResult = AsyncResult;
