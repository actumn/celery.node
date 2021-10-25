/**
 * writes here Base Parent class of Celery client and worker
 * @author SunMyeong Lee <actumn814@gmail.com>
 */
import { CeleryConf } from "./conf";
import { CeleryBroker } from "../kombu/brokers";
import { CeleryBackend } from "../backends";
export default class Base {
    private _backend;
    private _broker;
    conf: CeleryConf;
    /**
     * Parent Class of Client and Worker
     * for creates an instance of celery broker and celery backend
     *
     * @constructor Base
     */
    constructor(broker: string, backend: string, queue?: string);
    get broker(): CeleryBroker;
    get backend(): CeleryBackend;
    /**
     * returns promise for working some job after ready.
     * @method Base#isReady
     *
     * @returns {Promise} promise that continues if backend and broker connected.
     */
    isReady(): Promise<any>;
    /**
     * returns promise for working some job after backend and broker ready.
     * @method Base#disconnect
     *
     * @returns {Promise} promises that continues if backend and broker disconnected.
     */
    disconnect(): Promise<any>;
}
