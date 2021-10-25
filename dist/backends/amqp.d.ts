import * as amqplib from "amqplib";
import { CeleryBackend } from ".";
export default class AMQPBackend implements CeleryBackend {
    opts: {
        [key: string]: any;
    };
    connect: Promise<amqplib.Connection>;
    channel: Promise<amqplib.Channel>;
    /**
     * AMQP backend class
     * @constructor AMQPBackend
     * @param {string} url the connection string of amqp
     * @param {object} opts the options object for amqp connect of amqplib
     */
    constructor(url: string, opts: object);
    /**
     * @method AMQPBackend#isReady
     * @returns {Promise} promises that continues if amqp connected.
     */
    isReady(): Promise<amqplib.Connection>;
    /**
     * @method AMQPBackend#disconnect
     * @returns {Promise} promises that continues if amqp disconnected.
     */
    disconnect(): Promise<void>;
    /**
     * store result method on backend
     * @method AMQPBackend#storeResult
     * @param {String} taskId
     * @param {any} result result of task. i.e the return value of task handler
     * @param {String} state
     * @returns {Promise}
     */
    storeResult(taskId: string, result: any, state: string): Promise<boolean>;
    /**
     * get result data from backend
     * @method AMQPBackend#getTaskMeta
     * @param {String} taskId
     * @returns {Promise}
     */
    getTaskMeta(taskId: string): Promise<object>;
}
