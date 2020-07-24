"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var url = require("url");
var redis_1 = require("./redis");
var amqp_1 = require("./amqp");
/**
 * Support broker protocols of celery.node.
 * @private
 * @constant
 */
var supportedProtocols = ["redis", "amqp"];
/**
 * takes url string and after parsing scheme of url, returns protocol.
 *
 * @private
 * @param {String} uri
 * @returns {String} protocol string.
 * @throws {Error} when url has unsupported protocols
 */
function getProtocol(uri) {
    var protocol = url.parse(uri).protocol.slice(0, -1);
    if (supportedProtocols.indexOf(protocol) === -1) {
        throw new Error("Unsupported type: " + protocol);
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
function newCeleryBroker(CELERY_BROKER, CELERY_BROKER_OPTIONS, CELERY_QUEUE) {
    if (CELERY_QUEUE === void 0) { CELERY_QUEUE = "celery"; }
    var brokerProtocol = getProtocol(CELERY_BROKER);
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
