"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Redis = require("ioredis");
const urllib = require("url");
const uuid_1 = require("uuid");
const message_1 = require("../message");
/**
 * codes from bull: https://github.com/OptimalBits/bull/blob/129c6e108ce67ca343c8532161d06742d92b651c/lib/queue.js#L296-L310
 * @private
 * @param {String} urlString
 */
function redisOptsFromUrl(urlString) {
    const redisOpts = {};
    try {
        const redisUrl = urllib.parse(urlString);
        redisOpts.port = +redisUrl.port || 6379;
        redisOpts.host = redisUrl.hostname;
        redisOpts.db = redisUrl.pathname ? +redisUrl.pathname.split("/")[1] : 0;
        if (redisUrl.auth) {
            [, redisOpts.password] = redisUrl.auth.split(":");
        }
    }
    catch (e) {
        throw new Error(e.message);
    }
    return redisOpts;
}
class RedisMessage extends message_1.Message {
    constructor(payload) {
        super(Buffer.from(payload["body"], "base64"), payload["content-type"], payload["content-encoding"], payload["properties"], payload["headers"]);
        this.raw = payload;
    }
}
class RedisBroker {
    /**
     * Redis broker class
     * @constructor RedisBroker
     * @param {string} url the connection string of redis
     * @param {object} opts the options object for redis connect of ioredis
     */
    constructor(url, opts) {
        this.channels = [];
        this.closing = false;
        this.redis = new Redis(Object.assign(Object.assign({}, redisOptsFromUrl(url)), opts));
    }
    /**
     * codes from here: https://github.com/OptimalBits/bull/blob/129c6e108ce67ca343c8532161d06742d92b651c/lib/utils.js#L21-L44
     * @method RedisBroker#isReady
     * @returns {Promise} promises that continues if redis connected.
     */
    isReady() {
        return new Promise((resolve, reject) => {
            if (this.redis.status === "ready") {
                resolve();
            }
            else {
                let handleError; // eslint-disable-line prefer-const
                const handleReady = () => {
                    this.redis.removeListener("error", handleError);
                    resolve();
                };
                handleError = err => {
                    this.redis.removeListener("ready", handleReady);
                    reject(err);
                };
                this.redis.once("ready", handleReady);
                this.redis.once("error", handleError);
            }
        });
    }
    /**
     * @method RedisBroker#disconnect
     * @returns {Promise} promises that continues if redis disconnected.
     */
    disconnect() {
        this.closing = true;
        return Promise.all(this.channels).then(() => this.redis.quit());
    }
    /**
     * @method RedisBroker#publish
     *
     * @returns {Promise}
     */
    publish(body, exchange, routingKey, headers, properties) {
        const messageBody = JSON.stringify(body);
        const contentType = "application/json";
        const contentEncoding = "utf-8";
        const message = {
            body: Buffer.from(messageBody).toString("base64"),
            "content-type": contentType,
            "content-encoding": contentEncoding,
            headers,
            properties: Object.assign({ body_encoding: "base64", delivery_info: {
                    exchange: exchange,
                    routing_key: routingKey
                }, delivery_mode: 2, delivery_tag: uuid_1.v4() }, properties)
        };
        return this.redis.lpush(routingKey, JSON.stringify(message));
    }
    /**
     * @method RedisBroker#subscribe
     * @param {string} queue
     * @param {Function} callback
     * @returns {Promise}
     */
    subscribe(queue, callback) {
        const promiseCount = 1;
        return this.isReady().then(() => {
            for (let index = 0; index < promiseCount; index += 1) {
                this.channels.push(new Promise(resolve => this.receive(index, resolve, queue, callback)));
            }
            return Promise.all(this.channels);
        });
    }
    /**
     * @private
     * @param {number} index
     * @param {Fucntion} resolve
     * @param {string} queue
     * @param {Function} callback
     */
    receive(index, resolve, queue, callback) {
        process.nextTick(() => this.recieveOneOnNextTick(index, resolve, queue, callback));
    }
    /**
     * @private
     * @param {number} index
     * @param {Function} resolve
     * @param {String} queue
     * @param {Function} callback
     * @returns {Promise}
     */
    recieveOneOnNextTick(index, resolve, queue, callback) {
        if (this.closing) {
            resolve();
            return;
        }
        return this.receiveOne(queue)
            .then(body => {
            if (body) {
                callback(body);
            }
            Promise.resolve();
        })
            .then(() => this.receive(index, resolve, queue, callback))
            .catch(err => console.log(err));
    }
    /**
     * @private
     * @param {string} queue
     * @return {Promise}
     */
    receiveOne(queue) {
        return this.redis.brpop(queue, "5").then(result => {
            if (!result) {
                return null;
            }
            const [queue, item] = result;
            const rawMsg = JSON.parse(item);
            // now supports only application/json of content-type
            if (rawMsg["content-type"] !== "application/json") {
                throw new Error(`queue ${queue} item: unsupported content type ${rawMsg["content-type"]}`);
            }
            // now supports only base64 of body_encoding
            if (rawMsg.properties.body_encoding !== "base64") {
                throw new Error(`queue ${queue} item: unsupported body encoding ${rawMsg.properties.body_encoding}`);
            }
            // now supports only utf-8 of content-encoding
            if (rawMsg["content-encoding"] !== "utf-8") {
                throw new Error(`queue ${queue} item: unsupported content encoding ${rawMsg["content-encoding"]}`);
            }
            return new RedisMessage(rawMsg);
        });
    }
}
exports.default = RedisBroker;
