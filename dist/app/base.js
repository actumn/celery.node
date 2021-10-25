"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * writes here Base Parent class of Celery client and worker
 * @author SunMyeong Lee <actumn814@gmail.com>
 */
const conf_1 = require("./conf");
const brokers_1 = require("../kombu/brokers");
const backends_1 = require("../backends");
class Base {
    /**
     * Parent Class of Client and Worker
     * for creates an instance of celery broker and celery backend
     *
     * @constructor Base
     */
    constructor(broker, backend, queue = "celery") {
        this.conf = conf_1.defaultConf();
        this.conf.CELERY_BROKER = broker;
        this.conf.CELERY_BACKEND = backend;
        this.conf.CELERY_QUEUE = queue;
    }
    get broker() {
        if (!this._broker) {
            this._broker = brokers_1.newCeleryBroker(this.conf.CELERY_BROKER, this.conf.CELERY_BROKER_OPTIONS, this.conf.CELERY_QUEUE);
        }
        return this._broker;
    }
    get backend() {
        if (!this._backend) {
            this._backend = backends_1.newCeleryBackend(this.conf.CELERY_BACKEND, this.conf.CELERY_BACKEND_OPTIONS);
        }
        return this._backend;
    }
    /**
     * returns promise for working some job after ready.
     * @method Base#isReady
     *
     * @returns {Promise} promise that continues if backend and broker connected.
     */
    isReady() {
        return Promise.all([this.backend.isReady(), this.broker.isReady()]);
    }
    /**
     * returns promise for working some job after backend and broker ready.
     * @method Base#disconnect
     *
     * @returns {Promise} promises that continues if backend and broker disconnected.
     */
    disconnect() {
        return this.broker.disconnect().then(() => this.backend.disconnect());
    }
}
exports.default = Base;
