"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const base_1 = require("./base");
const task_1 = require("./task");
const result_1 = require("./result");
class TaskMessage {
    constructor(headers, properties, body, sentEvent) {
        this.headers = headers;
        this.properties = properties;
        this.body = body;
        this.sentEvent = sentEvent;
    }
}
class Client extends base_1.default {
    constructor() {
        super(...arguments);
        this.taskProtocols = {
            1: this.asTaskV1,
            2: this.asTaskV2
        };
    }
    get createTaskMessage() {
        return this.taskProtocols[this.conf.TASK_PROTOCOL];
    }
    sendTaskMessage(taskName, message) {
        const { headers, properties, body /*, sentEvent */ } = message;
        const exchange = "";
        // exchangeType = 'direct';
        // const serializer = 'json';
        this.isReady().then(() => this.broker.publish(body, exchange, this.conf.CELERY_QUEUE, headers, properties));
    }
    asTaskV2(taskId, taskName, args, kwargs) {
        const message = {
            headers: {
                lang: "js",
                task: taskName,
                id: taskId
                /*
                'shadow': shadow,
                'eta': eta,
                'expires': expires,
                'group': group_id,
                'retries': retries,
                'timelimit': [time_limit, soft_time_limit],
                'root_id': root_id,
                'parent_id': parent_id,
                'argsrepr': argsrepr,
                'kwargsrepr': kwargsrepr,
                'origin': origin or anon_nodename()
                */
            },
            properties: {
                correlationId: taskId,
                replyTo: ""
            },
            body: [args, kwargs, {}],
            sentEvent: null
        };
        return message;
    }
    /**
     * create json string representing celery task message. used by Client.publish
     *
     * celery protocol reference: https://docs.celeryproject.org/en/latest/internals/protocol.html
     * celery code: https://github.com/celery/celery/blob/4aefccf8a89bffe9dac9a72f2601db1fa8474f5d/celery/app/amqp.py#L307-L464
     *
     * @function createTaskMessage
     *
     * @returns {String} JSON serialized string of celery task message
     */
    asTaskV1(taskId, taskName, args, kwargs) {
        const message = {
            headers: {},
            properties: {
                correlationId: taskId,
                replyTo: ""
            },
            body: {
                task: taskName,
                id: taskId,
                args: args,
                kwargs: kwargs
            },
            sentEvent: null
        };
        return message;
    }
    /**
     * createTask
     * @method Client#createTask
     * @param {string} name for task name
     * @returns {Task} task object
     *
     * @example
     * client.createTask('task.add').delay([1, 2])
     */
    createTask(name) {
        return new task_1.default(this, name);
    }
    /**
     * get AsyncResult by task id
     * @param {string} taskId for task identification.
     * @returns {AsyncResult}
     */
    asyncResult(taskId) {
        return new result_1.AsyncResult(taskId, this.backend);
    }
    sendTask(taskName, args, kwargs, taskId) {
        taskId = taskId || uuid_1.v4();
        const message = this.createTaskMessage(taskId, taskName, args, kwargs);
        this.sendTaskMessage(taskName, message);
        const result = new result_1.AsyncResult(taskId, this.backend);
        return result;
    }
}
exports.default = Client;
