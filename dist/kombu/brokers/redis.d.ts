import * as Redis from "ioredis";
import { CeleryBroker } from ".";
export default class RedisBroker implements CeleryBroker {
    redis: Redis.Redis;
    channels: any[];
    closing: boolean;
    /**
     * Redis broker class
     * @constructor RedisBroker
     * @param {string} url the connection string of redis
     * @param {object} opts the options object for redis connect of ioredis
     */
    constructor(url: string, opts: object);
    /**
     * codes from here: https://github.com/OptimalBits/bull/blob/129c6e108ce67ca343c8532161d06742d92b651c/lib/utils.js#L21-L44
     * @method RedisBroker#isReady
     * @returns {Promise} promises that continues if redis connected.
     */
    isReady(): Promise<void>;
    /**
     * @method RedisBroker#disconnect
     * @returns {Promise} promises that continues if redis disconnected.
     */
    disconnect(): Promise<string>;
    /**
     * @method RedisBroker#publish
     *
     * @returns {Promise}
     */
    publish(body: object | [Array<any>, object, object], exchange: string, routingKey: string, headers: object, properties: object): Promise<number>;
    /**
     * @method RedisBroker#subscribe
     * @param {string} queue
     * @param {Function} callback
     * @returns {Promise}
     */
    subscribe(queue: string, callback: Function): Promise<any[]>;
    /**
     * @private
     * @param {number} index
     * @param {Fucntion} resolve
     * @param {string} queue
     * @param {Function} callback
     */
    private receive;
    /**
     * @private
     * @param {number} index
     * @param {Function} resolve
     * @param {String} queue
     * @param {Function} callback
     * @returns {Promise}
     */
    private recieveOneOnNextTick;
    /**
     * @private
     * @param {string} queue
     * @return {Promise}
     */
    private receiveOne;
}
