import * as amqplib from "amqplib";
import { CeleryBroker } from ".";
import { Message } from "../message";
export default class AMQPBroker implements CeleryBroker {
    connect: Promise<amqplib.Connection>;
    channel: Promise<amqplib.Channel>;
    queue: string;
    /**
     * AMQP broker class
     * @constructor AMQPBroker
     * @param {string} url the connection string of amqp
     * @param {object} opts the options object for amqp connect of amqplib
     * @param {string} queue optional. the queue to connect to.
     */
    constructor(url: string, opts: object, queue?: string);
    /**
     * @method AMQPBroker#isReady
     * @returns {Promise} promises that continues if amqp connected.
     */
    isReady(): Promise<amqplib.Channel>;
    /**
     * @method AMQPBroker#disconnect
     * @returns {Promise} promises that continues if amqp disconnected.
     */
    disconnect(): Promise<void>;
    /**
     * @method AMQPBroker#publish
     *
     * @returns {Promise}
     */
    publish(body: object | [Array<any>, object, object], exchange: string, routingKey: string, headers: object, properties: object): Promise<boolean>;
    /**
     * @method AMQPBroker#subscribe
     * @param {String} queue
     * @param {Function} callback
     * @returns {Promise}
     */
    subscribe(queue: string, callback: (message: Message) => void): Promise<amqplib.Replies.Consume>;
}
