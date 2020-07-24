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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var base_1 = require("./base");
var Worker = /** @class */ (function (_super) {
    __extends(Worker, _super);
    function Worker() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.handlers = {};
        return _this;
    }
    /**
     * register task handler on worker handlers
     * @method Worker#register
     * @param {String} name the name of task for dispatching.
     * @param {Function} handler the function for task handling
     *
     * @example
     * worker.register('tasks.add', (a, b) => a + b);
     * worker.start();
     */
    Worker.prototype.register = function (name, handler) {
        if (!handler) {
            throw new Error("Undefined handler");
        }
        if (this.handlers[name]) {
            throw new Error("Already handler setted");
        }
        this.handlers[name] = function registHandler() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            try {
                return Promise.resolve(handler.apply(void 0, args));
            }
            catch (err) {
                return Promise.reject(err);
            }
        };
    };
    /**
     * start celery worker to run
     * @method Worker#start
     * @example
     * worker.register('tasks.add', (a, b) => a + b);
     * worker.start();
     */
    Worker.prototype.start = function () {
        console.info("celery.node worker start...");
        console.info("registed task: " + Object.keys(this.handlers));
        return this.run().catch(function (err) { return console.error(err); });
    };
    /**
     * @method Worker#run
     * @private
     *
     * @returns {Promise}
     */
    Worker.prototype.run = function () {
        var _this = this;
        return this.isReady().then(function () { return _this.processTasks(); });
    };
    /**
     * @method Worker#processTasks
     * @private
     *
     * @returns function results
     */
    Worker.prototype.processTasks = function () {
        var consumer = this.getConsumer(this.conf.CELERY_QUEUE);
        return consumer();
    };
    /**
     * @method Worker#getConsumer
     * @private
     *
     * @param {String} queue queue name for task route
     */
    Worker.prototype.getConsumer = function (queue) {
        var _this = this;
        var onMessage = this.createTaskHandler();
        return function () { return _this.broker.subscribe(queue, onMessage); };
    };
    Worker.prototype.createTaskHandler = function () {
        var _this = this;
        var onTaskReceived = function (message) {
            if (!message) {
                return Promise.resolve();
            }
            var payload = null;
            var taskName = message.headers["task"];
            if (!taskName) {
                // protocol v1
                payload = message.decode();
                taskName = payload["task"];
            }
            // strategy
            var body;
            var headers;
            if (payload == null && !("args" in message.decode())) {
                body = message.decode(); // message.body;
                headers = message.headers;
            }
            else {
                var args_1 = payload["args"] || [];
                var kwargs_1 = payload["kwargs"] || {};
                var embed = {
                    callbacks: payload["callbacks"],
                    errbacks: payload["errbacks"],
                    chord: payload["chord"],
                    chain: null
                };
                body = [args_1, kwargs_1, embed];
                headers = {
                    lang: payload["lang"],
                    task: payload["task"],
                    id: payload["id"],
                    rootId: payload["root_id"],
                    parantId: payload["parentId"],
                    group: payload["group"],
                    meth: payload["meth"],
                    shadow: payload["shadow"],
                    eta: payload["eta"],
                    expires: payload["expires"],
                    retries: payload["retries"] || 0,
                    timelimit: payload["timelimit"] || [null, null],
                    kwargsrepr: payload["kwargsrepr"],
                    origin: payload["origin"]
                };
            }
            // request
            var args = body[0], kwargs = body[1] /*, embed */;
            var taskId = headers["id"];
            var handler = _this.handlers[taskName];
            if (!handler) {
                throw new Error("Missing process handler for task " + taskName);
            }
            console.info("celery.node Received task: " + taskName + "[" + taskId + "], args: " + args + ", kwargs: " + JSON.stringify(kwargs));
            var timeStart = process.hrtime();
            var taskPromise = handler.apply(void 0, __spreadArrays(args, [kwargs]));
            return taskPromise
                .then(function (result) {
                var diff = process.hrtime(timeStart);
                console.info("celery.node Task " + taskName + "[" + taskId + "] succeeded in " + (diff[0] +
                    diff[1] / 1e9) + "s: " + result);
                _this.backend.storeResult(taskId, result, "SUCCESS");
            })
                .then(function () { return Promise.resolve(); });
        };
        return onTaskReceived;
    };
    /**
     * @method Worker#stop
     *
     * @todo implement here
     */
    // eslint-disable-next-line class-methods-use-this
    Worker.prototype.stop = function () {
        throw new Error("not implemented yet");
    };
    return Worker;
}(base_1.default));
exports.default = Worker;
