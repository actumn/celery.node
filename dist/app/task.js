"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Task {
    /**
     * Asynchronous Task
     * @constructor Task
     * @param {Client} clinet celery client instance
     * @param {string} name celery task name
     */
    constructor(client, name) {
        this.client = client;
        this.name = name;
    }
    /**
     * @method Task#delay
     *
     * @returns {AsyncResult} the result of client.publish
     *
     * @example
     * client.createTask('task.add').delay(1, 2)
     */
    delay(...args) {
        return this.applyAsync([...args]);
    }
    applyAsync(args, kwargs) {
        if (args && !Array.isArray(args)) {
            throw new Error("args is not array");
        }
        if (kwargs && typeof kwargs !== "object") {
            throw new Error("kwargs is not object");
        }
        return this.client.sendTask(this.name, args || [], kwargs || {});
    }
}
exports.default = Task;
