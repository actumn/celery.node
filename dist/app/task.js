"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Task = /** @class */ (function () {
    /**
     * Asynchronous Task
     * @constructor Task
     * @param {Client} clinet celery client instance
     * @param {string} name celery task name
     */
    function Task(client, name) {
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
    Task.prototype.delay = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return this.applyAsync(__spreadArrays(args));
    };
    Task.prototype.applyAsync = function (args, kwargs) {
        if (args && !Array.isArray(args)) {
            throw new Error("args is not array");
        }
        if (kwargs && typeof kwargs !== "object") {
            throw new Error("kwargs is not object");
        }
        return this.client.sendTask(this.name, args || [], kwargs || {});
    };
    return Task;
}());
exports.default = Task;
