/**
 * writes here Base Parent class of Celery client and worker
 * @author SunMyeong Lee <actumn814@gmail.com>
 */
import { CeleryConf, DEFAULT_CELERY_CONF } from "./conf";
import { newCeleryBroker, CeleryBroker } from "../kombu/brokers";
import { newCeleryBackend, CeleryBackend } from "../backends";

export default class Base {
  backend: CeleryBackend;
  broker: CeleryBroker;
  /**
   * Parent Class of Client and Worker
   * for creates an instance of celery broker and celery backend
   *
   * @constructor Base
   * @param {CeleryConf} conf the configuration object of Base class for both Celery client and worker, containing celery broker information and celery backend information
   */
  constructor(conf: CeleryConf = DEFAULT_CELERY_CONF) {
    /**
     * backend
     * @member Base#backend
     * @protected
     */
    this.backend = newCeleryBackend(
      conf.CELERY_BACKEND,
      conf.CELERY_BACKEND_OPTIONS
    );
    /**
     * broker
     * @member Base#broker
     * @protected
     */
    this.broker = newCeleryBroker(
      conf.CELERY_BROKER,
      conf.CELERY_BROKER_OPTIONS
    );
  }

  /**
   * returns promise for working some job after ready.
   * @method Base#isReady
   *
   * @returns {Promise} promise that continues if backend and broker connected.
   */
  public isReady(): Promise<any> {
    return Promise.all([this.backend.isReady(), this.broker.isReady()]);
  }

  /**
   * returns promise for working some job after backend and broker ready.
   * @method Base#disconnect
   *
   * @returns {Promise} promises that continues if backend and broker disconnected.
   */
  public disconnect(): Promise<any> {
    return this.broker.disconnect().then(() => this.backend.disconnect());
  }
}
