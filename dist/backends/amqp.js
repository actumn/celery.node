"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var amqplib = require("amqplib");
var AMQPBackend = /** @class */ (function () {
    /**
     * AMQP backend class
     * @constructor AMQPBackend
     * @param {string} url the connection string of amqp
     * @param {object} opts the options object for amqp connect of amqplib
     */
    function AMQPBackend(url, opts) {
        this.connect = amqplib.connect(url, opts);
        this.channel = this.connect
            .then(function (conn) { return conn.createChannel(); })
            .then(function (ch) {
            return ch
                .assertExchange("default", "direct", {
                durable: true,
                autoDelete: true,
                internal: false,
                // nowait: false,
                arguments: null
            })
                .then(function () { return Promise.resolve(ch); });
        });
    }
    /**
     * @method AMQPBackend#isReady
     * @returns {Promise} promises that continues if amqp connected.
     */
    AMQPBackend.prototype.isReady = function () {
        return this.connect;
    };
    /**
     * @method AMQPBackend#disconnect
     * @returns {Promise} promises that continues if amqp disconnected.
     */
    AMQPBackend.prototype.disconnect = function () {
        return this.connect.then(function (conn) { return conn.close(); });
    };
    /**
     * store result method on backend
     * @method AMQPBackend#storeResult
     * @param {String} taskId
     * @param {any} result result of task. i.e the return value of task handler
     * @param {String} state
     * @returns {Promise}
     */
    AMQPBackend.prototype.storeResult = function (taskId, result, state) {
        var queue = taskId.replace(/-/g, "");
        return this.channel
            .then(function (ch) {
            return ch
                .assertQueue(queue, {
                durable: true,
                autoDelete: true,
                exclusive: false,
                // nowait: false,
                arguments: {
                    "x-expires": 86400000
                }
            })
                .then(function () { return Promise.resolve(ch); });
        })
            .then(function (ch) {
            return ch.publish("", queue, Buffer.from(JSON.stringify({
                status: state,
                result: result,
                traceback: null,
                children: [],
                task_id: taskId,
                date_done: new Date().toISOString()
            })), {
                contentType: "application/json",
                contentEncoding: "utf-8"
            });
        });
    };
    /**
     * get result data from backend
     * @method AMQPBackend#getTaskMeta
     * @param {String} taskId
     * @returns {Promise}
     */
    AMQPBackend.prototype.getTaskMeta = function (taskId) {
        var queue = taskId.replace(/-/g, "");
        return this.channel
            .then(function (ch) {
            return ch
                .assertQueue(queue, {
                durable: true,
                autoDelete: true,
                exclusive: false,
                // nowait: false,
                arguments: {
                    "x-expires": 86400000
                }
            })
                .then(function () { return Promise.resolve(ch); });
        })
            .then(function (ch) {
            return ch.get(queue, {
                noAck: false
            });
        })
            .then(function (msg) {
            if (msg === false) {
                return null;
            }
            if (msg.properties.contentType !== "application/json") {
                throw new Error("unsupported content type " + msg.properties.contentType);
            }
            if (msg.properties.contentEncoding !== "utf-8") {
                throw new Error("unsupported content encoding " + msg.properties.contentEncoding);
            }
            var body = msg.content.toString("utf-8");
            return JSON.parse(body);
        });
    };
    return AMQPBackend;
}());
exports.default = AMQPBackend;
