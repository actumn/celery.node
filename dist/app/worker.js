"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("./base");
class Worker extends base_1.default {
    constructor() {
        super(...arguments);
        this.handlers = {};
        this.activeTasks = new Set();
    }
    /**
     * Register task handler on worker handlers
     * @method Worker#register
     * @param {String} name the name of task for dispatching.
     * @param {Function} handler the function for task handling
     *
     * @example
     * worker.register('tasks.add', (a, b) => a + b);
     * worker.start();
     */
    register(name, handler) {
        if (!handler) {
            throw new Error("Undefined handler");
        }
        if (this.handlers[name]) {
            throw new Error("Handler is already set");
        }
        this.handlers[name] = function registHandler(...args) {
            try {
                return Promise.resolve(handler(...args));
            }
            catch (err) {
                return Promise.reject(err);
            }
        };
    }
    /**
     * Start celery worker to run
     * @method Worker#start
     * @example
     * worker.register('tasks.add', (a, b) => a + b);
     * worker.start();
     */
    start() {
        console.info("celery.node worker starting...");
        console.info(`registered task: ${Object.keys(this.handlers)}`);
        return this.run().catch(err => console.error(err));
    }
    /**
     * @method Worker#run
     * @private
     *
     * @returns {Promise}
     */
    run() {
        return this.isReady().then(() => this.processTasks());
    }
    /**
     * @method Worker#processTasks
     * @private
     *
     * @returns function results
     */
    processTasks() {
        const consumer = this.getConsumer(this.conf.CELERY_QUEUE);
        return consumer();
    }
    /**
     * @method Worker#getConsumer
     * @private
     *
     * @param {String} queue queue name for task route
     */
    getConsumer(queue) {
        const onMessage = this.createTaskHandler();
        return () => this.broker.subscribe(queue, onMessage);
    }
    createTaskHandler() {
        const onTaskReceived = (message) => {
            if (!message) {
                return Promise.resolve();
            }
            let payload = null;
            let taskName = message.headers["task"];
            if (!taskName) {
                // protocol v1
                payload = message.decode();
                taskName = payload["task"];
            }
            // strategy
            let body;
            let headers;
            if (payload == null && !("args" in message.decode())) {
                body = message.decode(); // message.body;
                headers = message.headers;
            }
            else {
                const args = payload["args"] || [];
                const kwargs = payload["kwargs"] || {};
                const embed = {
                    callbacks: payload["callbacks"],
                    errbacks: payload["errbacks"],
                    chord: payload["chord"],
                    chain: null
                };
                body = [args, kwargs, embed];
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
            const [args, kwargs /*, embed */] = body;
            const taskId = headers["id"];
            const handler = this.handlers[taskName];
            if (!handler) {
                throw new Error(`Missing process handler for task ${taskName}`);
            }
            console.info(`celery.node Received task: ${taskName}[${taskId}], args: ${args}, kwargs: ${JSON.stringify(kwargs)}`);
            const timeStart = process.hrtime();
            const taskPromise = handler(...args, kwargs).then(result => {
                const diff = process.hrtime(timeStart);
                console.info(`celery.node Task ${taskName}[${taskId}] succeeded in ${diff[0] +
                    diff[1] / 1e9}s: ${result}`);
                this.backend.storeResult(taskId, result, "SUCCESS");
                this.activeTasks.delete(taskPromise);
            }).catch(err => {
                console.info(`celery.node Task ${taskName}[${taskId}] failed: [${err}]`);
                this.backend.storeResult(taskId, err, "FAILURE");
                this.activeTasks.delete(taskPromise);
            });
            // record the executing task
            this.activeTasks.add(taskPromise);
            return taskPromise;
        };
        return onTaskReceived;
    }
    /**
     * @method Worker#whenCurrentJobsFinished
     *
     * @returns Promise that resolves when all jobs are finished
     */
    whenCurrentJobsFinished() {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.all(Array.from(this.activeTasks));
        });
    }
    /**
     * @method Worker#stop
     *
     * @todo implement here
     */
    // eslint-disable-next-line class-methods-use-this
    stop() {
        throw new Error("not implemented yet");
    }
}
exports.default = Worker;
