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
var amqplib = require("amqplib");
var message_1 = require("../message");
var AMQPMessage = /** @class */ (function (_super) {
    __extends(AMQPMessage, _super);
    function AMQPMessage(payload) {
        return _super.call(this, payload.content, payload.properties.contentType, payload.properties.contentEncoding, payload.properties, payload.properties.headers) || this;
    }
    return AMQPMessage;
}(message_1.Message));
var AMQPBroker = /** @class */ (function () {
    /**
     * AMQP broker class
     * @constructor AMQPBroker
     * @param {string} url the connection string of amqp
     * @param {object} opts the options object for amqp connect of amqplib
     * @param {string} queue optional. the queue to connect to.
     */
    function AMQPBroker(url, opts, queue) {
        if (queue === void 0) { queue = "celery"; }
        this.queue = queue;
        this.connect = amqplib.connect(url, opts);
        this.channel = this.connect.then(function (conn) { return conn.createChannel(); });
    }
    /**
     * @method AMQPBroker#isReady
     * @returns {Promise} promises that continues if amqp connected.
     */
    AMQPBroker.prototype.isReady = function () {
        var _this = this;
        return new Promise(function (resolve) {
            _this.channel.then(function (ch) {
                Promise.all([
                    ch.assertExchange("default", "direct", {
                        durable: true,
                        autoDelete: true,
                        internal: false,
                        // nowait: false,
                        arguments: null
                    }),
                    ch.assertQueue(_this.queue, {
                        durable: true,
                        autoDelete: false,
                        exclusive: false,
                        // nowait: false,
                        arguments: null
                    })
                ]).then(function () { return resolve(); });
            });
        });
    };
    /**
     * @method AMQPBroker#disconnect
     * @returns {Promise} promises that continues if amqp disconnected.
     */
    AMQPBroker.prototype.disconnect = function () {
        return this.connect.then(function (conn) { return conn.close(); });
    };
    /**
     * @method AMQPBroker#publish
     *
     * @returns {Promise}
     */
    AMQPBroker.prototype.publish = function (body, exchange, routingKey, headers, properties) {
        var messageBody = JSON.stringify(body);
        var contentType = "application/json";
        var contentEncoding = "utf-8";
        return this.channel
            .then(function (ch) {
            return ch
                .assertQueue(routingKey, {
                durable: true,
                autoDelete: false,
                exclusive: false,
                // nowait: false,
                arguments: null
            })
                .then(function () { return Promise.resolve(ch); });
        })
            .then(function (ch) {
            return ch.publish(exchange, routingKey, Buffer.from(messageBody), __assign({ contentType: contentType,
                contentEncoding: contentEncoding,
                headers: headers }, properties));
        });
    };
    /**
     * @method AMQPBroker#subscribe
     * @param {String} queue
     * @param {Function} callback
     * @returns {Promise}
     */
    AMQPBroker.prototype.subscribe = function (queue, callback) {
        return this.channel
            .then(function (ch) {
            return ch
                .assertQueue(queue, {
                durable: true,
                autoDelete: false,
                exclusive: false,
                // nowait: false,
                arguments: null
            })
                .then(function () { return Promise.resolve(ch); });
        })
            .then(function (ch) {
            return ch.consume(queue, function (rawMsg) {
                ch.ack(rawMsg);
                // now supports only application/json of content-type
                if (rawMsg.properties.contentType !== "application/json") {
                    throw new Error("unsupported content type " + rawMsg.properties.contentType);
                }
                // now supports only utf-9 of content-encoding
                if (rawMsg.properties.contentEncoding !== "utf-8") {
                    throw new Error("unsupported content encoding " + rawMsg.properties.contentEncoding);
                }
                callback(new AMQPMessage(rawMsg));
            });
        });
    };
    return AMQPBroker;
}());
exports.default = AMQPBroker;
