import Client from "./client";
import { AsyncResult } from "./result";
export default class Task {
    client: Client;
    name: string;
    /**
     * Asynchronous Task
     * @constructor Task
     * @param {Client} clinet celery client instance
     * @param {string} name celery task name
     */
    constructor(client: Client, name: string);
    /**
     * @method Task#delay
     *
     * @returns {AsyncResult} the result of client.publish
     *
     * @example
     * client.createTask('task.add').delay(1, 2)
     */
    delay(...args: any[]): AsyncResult;
    applyAsync(args: Array<any>, kwargs?: object): AsyncResult;
}
