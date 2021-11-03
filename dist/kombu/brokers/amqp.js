"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const amqplib = require("amqplib");
const message_1 = require("../message");
class AMQPMessage extends message_1.Message {
    constructor(payload) {
        super(payload.content, payload.properties.contentType, payload.properties.contentEncoding, payload.properties, payload.properties.headers);
    }
}
class AMQPBroker {
    /**
     * AMQP broker class
     * @constructor AMQPBroker
     * @param {string} url the connection string of amqp
     * @param {object} opts the options object for amqp connect of amqplib
     * @param {string} queue optional. the queue to connect to.
     */
    constructor(url, opts, queue = "celery") {
        this.queue = queue;
        this.connect = amqplib.connect(url, opts);
        this.channel = this.connect.then(conn => conn.createChannel());
    }
    /**
     * @method AMQPBroker#isReady
     * @returns {Promise} promises that continues if amqp connected.
     */
    isReady() {
        return new Promise(resolve => {
            this.channel.then(ch => {
                Promise.all([
                    ch.assertExchange("default", "direct", {
                        durable: true,
                        autoDelete: true,
                        internal: false,
                        // nowait: false,
                        arguments: null
                    }),
                    ch.assertQueue(this.queue, {
                        durable: true,
                        autoDelete: false,
                        exclusive: false,
                        // nowait: false,
                        arguments: null
                    })
                ]).then(() => resolve());
            });
        });
    }
    /**
     * @method AMQPBroker#disconnect
     * @returns {Promise} promises that continues if amqp disconnected.
     */
    disconnect() {
        return this.connect.then(conn => conn.close());
    }
    /**
     * @method AMQPBroker#publish
     *
     * @returns {Promise}
     */
    publish(body, exchange, routingKey, headers, properties) {
        const messageBody = JSON.stringify(body);
        const contentType = "application/json";
        const contentEncoding = "utf-8";
        return this.channel
            .then(ch => ch
            .assertQueue(routingKey, {
            durable: true,
            autoDelete: false,
            exclusive: false,
            // nowait: false,
            arguments: null
        })
            .then(() => Promise.resolve(ch)))
            .then(ch => ch.publish(exchange, routingKey, Buffer.from(messageBody), Object.assign({ contentType,
            contentEncoding,
            headers, deliveryMode: 2 }, properties)));
    }
    /**
     * @method AMQPBroker#subscribe
     * @param {String} queue
     * @param {Function} callback
     * @returns {Promise}
     */
    subscribe(queue, callback) {
        return this.channel
            .then(ch => ch
            .assertQueue(queue, {
            durable: true,
            autoDelete: false,
            exclusive: false,
            // nowait: false,
            arguments: null
        })
            .then(() => Promise.resolve(ch)))
            .then(ch => ch.consume(queue, rawMsg => {
            ch.ack(rawMsg);
            // now supports only application/json of content-type
            if (rawMsg.properties.contentType !== "application/json") {
                throw new Error(`unsupported content type ${rawMsg.properties.contentType}`);
            }
            // now supports only utf-8 of content-encoding
            if (rawMsg.properties.contentEncoding !== "utf-8") {
                throw new Error(`unsupported content encoding ${rawMsg.properties.contentEncoding}`);
            }
            callback(new AMQPMessage(rawMsg));
        }));
    }
}
exports.default = AMQPBroker;
