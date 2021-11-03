import * as Redis from "ioredis";
import { CeleryBackend } from ".";
/**
 * @exports
 */
export default class RedisBackend implements CeleryBackend {
    redis: Redis.Redis;
    /**
     * Redis backend class
     * @constructor RedisBackend
     * @param {string} url the connection string of redis
     * @param {object} opts the options object for redis connect of ioredis
     */
    constructor(url: string, opts: object);
    /**
     * codes from here: https://github.com/OptimalBits/bull/blob/129c6e108ce67ca343c8532161d06742d92b651c/lib/utils.js#L21-L44
     * @method RedisBackend#isReady
     * @returns {Promise} promises that continues if redis connected.
     */
    isReady(): Promise<void>;
    /**
     * @method RedisBackend#disconnect
     * @returns {Promise} promises that continues if redis disconnected.
     */
    disconnect(): Promise<string>;
    /**
     * @method RedisBackend#storeResult
     * @param {string} taskId
     * @param {*} result
     * @param {string} state
     */
    storeResult(taskId: string, result: any, state: string): Promise<["OK", number]>;
    /**
     * @method RedisBackend#getTaskMeta
     * @param {string} taskId
     * @returns {Promise}
     */
    getTaskMeta(taskId: string): Promise<object>;
    /**
     * @method RedisBackend#set
     * @private
     * @param {String} key
     * @param {String} value
     * @returns {Promise}
     */
    private set;
    /**
     * @method RedisBackend#get
     * @private
     * @param {string} key
     * @return {Promise}
     */
    private get;
}
