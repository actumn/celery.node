"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("./app/client");
var worker_1 = require("./app/worker");
/**
 * @description Basic function for creating celery client
 *
 * @function
 * @returns {Client}
 */
function createClient(broker, backend, queue) {
    if (broker === void 0) { broker = "amqp://"; }
    if (backend === void 0) { backend = "amqp://"; }
    if (queue === void 0) { queue = "celery"; }
    return new client_1.default(broker, backend, queue);
}
exports.createClient = createClient;
/**
 * @description Basic function for creating celery worker
 *
 * @function
 * @returns {Worker}
 */
function createWorker(broker, backend, queue) {
    if (broker === void 0) { broker = "amqp://"; }
    if (backend === void 0) { backend = "amqp://"; }
    if (queue === void 0) { queue = "celery"; }
    return new worker_1.default(broker, backend, queue);
}
exports.createWorker = createWorker;
