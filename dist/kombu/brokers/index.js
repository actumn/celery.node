"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const url = require("url");
const redis_1 = require("./redis");
const amqp_1 = require("./amqp");
/**
 * Support broker protocols of celery.node.
 * @private
 * @constant
 */
const supportedProtocols = ["redis", "amqp"];
/**
 * takes url string and after parsing scheme of url, returns protocol.
 *
 * @private
 * @param {String} uri
 * @returns {String} protocol string.
 * @throws {Error} when url has unsupported protocols
 */
function getProtocol(uri) {
    const protocol = url.parse(uri).protocol.slice(0, -1);
    if (supportedProtocols.indexOf(protocol) === -1) {
        throw new Error(`Unsupported type: ${protocol}`);
    }
    return protocol;
}
/**
 *
 * @param {String} CELERY_BROKER
 * @param {object} CELERY_BROKER_OPTIONS
 * @param {string} CELERY_QUEUE
 * @returns {CeleryBroker}
 */
function newCeleryBroker(CELERY_BROKER, CELERY_BROKER_OPTIONS, CELERY_QUEUE = "celery") {
    const brokerProtocol = getProtocol(CELERY_BROKER);
    if (brokerProtocol === "redis") {
        return new redis_1.default(CELERY_BROKER, CELERY_BROKER_OPTIONS);
    }
    if (brokerProtocol === "amqp") {
        return new amqp_1.default(CELERY_BROKER, CELERY_BROKER_OPTIONS, CELERY_QUEUE);
    }
    // do not reach here.
    throw new Error("unsupprted celery broker");
}
exports.newCeleryBroker = newCeleryBroker;
