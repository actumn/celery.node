"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var uuid_1 = require("uuid");
var message_1 = require("../message");
/**
 * codes from bull: https://github.com/OptimalBits/bull/blob/129c6e108ce67ca343c8532161d06742d92b651c/lib/queue.js#L296-L310
 * @private
 * @param {String} urlString
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
var RedisMessage = /** @class */ (function (_super) {
    __extends(RedisMessage, _super);
    function RedisMessage(payload) {
        var _this = _super.call(this, Buffer.from(payload["body"], "base64"), payload["content-type"], payload["content-encoding"], payload["properties"], payload["headers"]) || this;
        _this.raw = payload;
        return _this;
    }
    return RedisMessage;
}(message_1.Message));
var RedisBroker = /** @class */ (function () {
    /**
     * Redis broker class
     * @constructor RedisBroker
     * @param {string} url the connection string of redis
     * @param {object} opts the options object for redis connect of ioredis
     */
    function RedisBroker(url, opts) {
        this.channels = [];
        this.closing = false;
        this.redis = new Redis(__assign(__assign({}, redisOptsFromUrl(url)), opts));
    }
    /**
     * codes from here: https://github.com/OptimalBits/bull/blob/129c6e108ce67ca343c8532161d06742d92b651c/lib/utils.js#L21-L44
     * @method RedisBroker#isReady
     * @returns {Promise} promises that continues if redis connected.
     */
    RedisBroker.prototype.isReady = function () {
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
     * @method RedisBroker#disconnect
     * @returns {Promise} promises that continues if redis disconnected.
     */
    RedisBroker.prototype.disconnect = function () {
        var _this = this;
        this.closing = true;
        return Promise.all(this.channels).then(function () { return _this.redis.quit(); });
    };
    /**
     * @method RedisBroker#publish
     *
     * @returns {Promise}
     */
    RedisBroker.prototype.publish = function (body, exchange, routingKey, headers, properties) {
        var messageBody = JSON.stringify(body);
        var contentType = "application/json";
        var contentEncoding = "utf-8";
        var message = {
            body: Buffer.from(messageBody).toString("base64"),
            "content-type": contentType,
            "content-encoding": contentEncoding,
            headers: headers,
            properties: __assign({ body_encoding: "base64", delivery_info: {
                    exchange: exchange,
                    routing_key: routingKey
                }, delivery_mode: 2, delivery_tag: uuid_1.v4() }, properties)
        };
        return this.redis.lpush(routingKey, JSON.stringify(message));
    };
    /**
     * @method RedisBroker#subscribe
     * @param {string} queue
     * @param {Function} callback
     * @returns {Promise}
     */
    RedisBroker.prototype.subscribe = function (queue, callback) {
        var _this = this;
        var promiseCount = 1;
        return this.isReady().then(function () {
            var _loop_1 = function (index) {
                _this.channels.push(new Promise(function (resolve) { return _this.receive(index, resolve, queue, callback); }));
            };
            for (var index = 0; index < promiseCount; index += 1) {
                _loop_1(index);
            }
            return Promise.all(_this.channels);
        });
    };
    /**
     * @private
     * @param {number} index
     * @param {Fucntion} resolve
     * @param {string} queue
     * @param {Function} callback
     */
    RedisBroker.prototype.receive = function (index, resolve, queue, callback) {
        var _this = this;
        process.nextTick(function () {
            return _this.recieveOneOnNextTick(index, resolve, queue, callback);
        });
    };
    /**
     * @private
     * @param {number} index
     * @param {Function} resolve
     * @param {String} queue
     * @param {Function} callback
     * @returns {Promise}
     */
    RedisBroker.prototype.recieveOneOnNextTick = function (index, resolve, queue, callback) {
        var _this = this;
        if (this.closing) {
            resolve();
            return;
        }
        return this.receiveOne(queue)
            .then(function (body) {
            if (body) {
                callback(body);
            }
            Promise.resolve();
        })
            .then(function () { return _this.receive(index, resolve, queue, callback); })
            .catch(function (err) { return console.log(err); });
    };
    /**
     * @private
     * @param {string} queue
     * @return {Promise}
     */
    RedisBroker.prototype.receiveOne = function (queue) {
        return this.redis.brpop(queue, "5").then(function (result) {
            if (!result) {
                return null;
            }
            var queue = result[0], item = result[1];
            var rawMsg = JSON.parse(item);
            // now supports only application/json of content-type
            if (rawMsg["content-type"] !== "application/json") {
                throw new Error("queue " + queue + " item: unsupported content type " + rawMsg["content-type"]);
            }
            // now supports only base64 of body_encoding
            if (rawMsg.properties.body_encoding !== "base64") {
                throw new Error("queue " + queue + " item: unsupported body encoding " + rawMsg.properties.body_encoding);
            }
            // now supports only utf-8 of content-encoding
            if (rawMsg["content-encoding"] !== "utf-8") {
                throw new Error("queue " + queue + " item: unsupported content encoding " + rawMsg["content-encoding"]);
            }
            return new RedisMessage(rawMsg);
        });
    };
    return RedisBroker;
}());
exports.default = RedisBroker;
