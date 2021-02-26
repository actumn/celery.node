import Base from "./base";
import Task from "./task";
import { AsyncResult } from "./result";
declare class TaskMessage {
    readonly headers: object;
    readonly properties: object;
    readonly body: [Array<any>, object, object] | object;
    readonly sentEvent: object;
    constructor(headers: object, properties: object, body: [Array<any>, object, object] | object, sentEvent: object);
}
export default class Client extends Base {
    private taskProtocols;
    get createTaskMessage(): (...args: any[]) => TaskMessage;
    sendTaskMessage(taskName: string, message: TaskMessage): void;
    asTaskV2(taskId: string, taskName: string, args?: Array<any>, kwargs?: object): TaskMessage;
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
    asTaskV1(taskId: string, taskName: string, args?: Array<any>, kwargs?: object): TaskMessage;
    /**
     * createTask
     * @method Client#createTask
     * @param {string} name for task name
     * @returns {Task} task object
     *
     * @example
     * client.createTask('task.add').delay([1, 2])
     */
    createTask(name: string): Task;
    /**
     * get AsyncResult by task id
     * @param {string} taskId for task identification.
     * @returns {AsyncResult}
     */
    asyncResult(taskId: string): AsyncResult;
    sendTask(taskName: string, args?: Array<any>, kwargs?: object, taskId?: string): AsyncResult;
}
export {};
