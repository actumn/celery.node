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
Object.defineProperty(exports, "__esModule", { value: true });
var uuid_1 = require("uuid");
var base_1 = require("./base");
var task_1 = require("./task");
var result_1 = require("./result");
var TaskMessage = /** @class */ (function () {
    function TaskMessage(headers, properties, body, sentEvent) {
        this.headers = headers;
        this.properties = properties;
        this.body = body;
        this.sentEvent = sentEvent;
    }
    return TaskMessage;
}());
var Client = /** @class */ (function (_super) {
    __extends(Client, _super);
    function Client() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.taskProtocols = {
            1: _this.asTaskV1,
            2: _this.asTaskV2
        };
        return _this;
    }
    Object.defineProperty(Client.prototype, "createTaskMessage", {
        get: function () {
            return this.taskProtocols[this.conf.TASK_PROTOCOL];
        },
        enumerable: true,
        configurable: true
    });
    Client.prototype.sendTaskMessage = function (taskName, message) {
        var _this = this;
        var headers = message.headers, properties = message.properties, body = message.body /*, sentEvent */;
        var exchange = "";
        // exchangeType = 'direct';
        // const serializer = 'json';
        this.isReady().then(function () {
            return _this.broker.publish(body, exchange, _this.conf.CELERY_QUEUE, headers, properties);
        });
    };
    Client.prototype.asTaskV2 = function (taskId, taskName, args, kwargs) {
        var message = {
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
    };
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
    Client.prototype.asTaskV1 = function (taskId, taskName, args, kwargs) {
        var message = {
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
    };
    /**
     * createTask
     * @method Client#createTask
     * @param {string} name for task name
     * @returns {Task} task object
     *
     * @example
     * client.createTask('task.add').delay([1, 2])
     */
    Client.prototype.createTask = function (name) {
        return new task_1.default(this, name);
    };
    Client.prototype.sendTask = function (taskName, args, kwargs, taskId) {
        taskId = taskId || uuid_1.v4();
        var message = this.createTaskMessage(taskId, taskName, args, kwargs);
        this.sendTaskMessage(taskName, message);
        var result = new result_1.AsyncResult(taskId, this.backend);
        return result;
    };
    return Client;
}(base_1.default));
exports.default = Client;
