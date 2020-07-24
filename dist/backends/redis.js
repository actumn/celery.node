"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var Redis = require("ioredis");
var urllib = require("url");
/**
 * celery key preifx for redis result key
 * @private
 * @constant
 *
 * @type {string}
 */
var keyPrefix = "celery-task-meta-";
/**
 * codes from bull: https://github.com/OptimalBits/bull/blob/129c6e108ce67ca343c8532161d06742d92b651c/lib/queue.js#L296-L310
 * @private
 * @param {string} urlString
 */
function redisOptsFromUrl(urlString) {
    var _a;
    var redisOpts = {};
    try {
        var redisUrl = urllib.parse(urlString);
        redisOpts.port = +redisUrl.port || 6379;
        redisOpts.host = redisUrl.hostname;
        redisOpts.db = redisUrl.pathname ? +redisUrl.pathname.split("/")[1] : 0;
        if (redisUrl.auth) {
            _a = redisUrl.auth.split(":"), redisOpts.password = _a[1];
        }
    }
    catch (e) {
        throw new Error(e.message);
    }
    return redisOpts;
}
/**
 * @exports
 */
var RedisBackend = /** @class */ (function () {
    /**
     * Redis backend class
     * @constructor RedisBackend
     * @param {string} url the connection string of redis
     * @param {object} opts the options object for redis connect of ioredis
     */
    function RedisBackend(url, opts) {
        this.redis = new Redis(__assign(__assign({}, redisOptsFromUrl(url)), opts));
    }
    /**
     * codes from here: https://github.com/OptimalBits/bull/blob/129c6e108ce67ca343c8532161d06742d92b651c/lib/utils.js#L21-L44
     * @method RedisBackend#isReady
     * @returns {Promise} promises that continues if redis connected.
     */
    RedisBackend.prototype.isReady = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.redis.status === "ready") {
                resolve();
            }
            else {
                var handleError_1; // eslint-disable-line prefer-const
                var handleReady_1 = function () {
                    _this.redis.removeListener("error", handleError_1);
                    resolve();
                };
                handleError_1 = function (err) {
                    _this.redis.removeListener("ready", handleReady_1);
                    reject(err);
                };
                _this.redis.once("ready", handleReady_1);
                _this.redis.once("error", handleError_1);
            }
        });
    };
    /**
     * @method RedisBackend#disconnect
     * @returns {Promise} promises that continues if redis disconnected.
     */
    RedisBackend.prototype.disconnect = function () {
        return this.redis.quit();
    };
    /**
     * @method RedisBackend#storeResult
     * @param {string} taskId
     * @param {*} result
     * @param {string} state
     */
    RedisBackend.prototype.storeResult = function (taskId, result, state) {
        return this.set("" + keyPrefix + taskId, JSON.stringify({
            status: state,
            result: result,
            traceback: null,
            children: [],
            task_id: taskId,
            date_done: new Date().toISOString()
        }));
    };
    /**
     * @method RedisBackend#getTaskMeta
     * @param {string} taskId
     * @returns {Promise}
     */
    RedisBackend.prototype.getTaskMeta = function (taskId) {
        return this.get("" + keyPrefix + taskId).then(function (msg) { return JSON.parse(msg); });
    };
    /**
     * @method RedisBackend#set
     * @private
     * @param {String} key
     * @param {String} value
     * @returns {Promise}
     */
    RedisBackend.prototype.set = function (key, value) {
        return Promise.all([
            this.redis.setex(key, 86400, value),
            this.redis.publish(key, value) // publish command for subscribe
        ]);
    };
    /**
     * @method RedisBackend#get
     * @private
     * @param {string} key
     * @return {Promise}
     */
    RedisBackend.prototype.get = function (key) {
        return this.redis.get(key);
    };
    return RedisBackend;
}());
exports.default = RedisBackend;
