"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * writes here Base Parent class of Celery client and worker
 * @author SunMyeong Lee <actumn814@gmail.com>
 */
var conf_1 = require("./conf");
var brokers_1 = require("../kombu/brokers");
var backends_1 = require("../backends");
var Base = /** @class */ (function () {
    /**
     * Parent Class of Client and Worker
     * for creates an instance of celery broker and celery backend
     *
     * @constructor Base
     */
    function Base(broker, backend, queue) {
        this.conf = conf_1.DEFAULT_CELERY_CONF;
        this.conf.CELERY_BROKER = broker;
        this.conf.CELERY_BACKEND = backend;
        this.conf.CELERY_QUEUE = queue;
    }
    Object.defineProperty(Base.prototype, "broker", {
        get: function () {
            if (!this._broker) {
                this._broker = brokers_1.newCeleryBroker(this.conf.CELERY_BROKER, this.conf.CELERY_BROKER_OPTIONS, this.conf.CELERY_QUEUE);
            }
            return this._broker;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Base.prototype, "backend", {
        get: function () {
            if (!this._backend) {
                this._backend = backends_1.newCeleryBackend(this.conf.CELERY_BACKEND, this.conf.CELERY_BACKEND_OPTIONS);
            }
            return this._backend;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * returns promise for working some job after ready.
     * @method Base#isReady
     *
     * @returns {Promise} promise that continues if backend and broker connected.
     */
    Base.prototype.isReady = function () {
        return Promise.all([this.backend.isReady(), this.broker.isReady()]);
    };
    /**
     * returns promise for working some job after backend and broker ready.
     * @method Base#disconnect
     *
     * @returns {Promise} promises that continues if backend and broker disconnected.
     */
    Base.prototype.disconnect = function () {
        var _this = this;
        return this.broker.disconnect().then(function () { return _this.backend.disconnect(); });
    };
    return Base;
}());
exports.default = Base;
