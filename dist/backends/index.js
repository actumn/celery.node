"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var url = require("url");
var redis_1 = require("./redis");
var amqp_1 = require("./amqp");
/**
 * Support backend protocols of celery.node.
 * @private
 * @constant
 */
var supportedProtocols = ["redis", "amqp"];
/**
 * takes url string and after parsing scheme of url, returns protocol.
 *
 * @private
 * @param {string} uri
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
 * @param {string} CELERY_BACKEND
 * @param {object} CELERY_BACKEND_OPTIONS
 * @returns {CeleryBackend}
 */
function newCeleryBackend(CELERY_BACKEND, CELERY_BACKEND_OPTIONS) {
    var brokerProtocol = getProtocol(CELERY_BACKEND);
    if (brokerProtocol === "redis") {
        return new redis_1.default(CELERY_BACKEND, CELERY_BACKEND_OPTIONS);
    }
    if (brokerProtocol === "amqp") {
        return new amqp_1.default(CELERY_BACKEND, CELERY_BACKEND_OPTIONS);
    }
    // do not reach here.
    throw new Error("unsupprted celery backend");
}
exports.newCeleryBackend = newCeleryBackend;
