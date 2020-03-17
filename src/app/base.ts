/**
 * writes here Base Parent class of Celery client and worker
 * @author SunMyeong Lee <actumn814@gmail.com>
 */
import { CeleryConf, DEFAULT_CELERY_CONF } from "./conf";
import { newCeleryBroker, CeleryBroker } from "../kombu/brokers";
import { newCeleryBackend, CeleryBackend } from "../backends";

export default class Base {
  _backend: CeleryBackend;
  _broker: CeleryBroker;
  conf: CeleryConf;

  /**
   * Parent Class of Client and Worker
   * for creates an instance of celery broker and celery backend
   *
   * @constructor Base
   */
  constructor(broker: string, backend: string) {
    this.conf = DEFAULT_CELERY_CONF;
    this.conf.CELERY_BROKER = broker;
    this.conf.CELERY_BACKEND = backend;
  }

  get broker(): CeleryBroker {
    if (!this._broker) {
      this._broker = newCeleryBroker(
        this.conf.CELERY_BROKER,
        this.conf.CELERY_BROKER_OPTIONS
      );
    }
    return this._broker;
  }

  get backend(): CeleryBackend {
    if (!this._backend) {
      this._backend = newCeleryBackend(
        this.conf.CELERY_BACKEND,
        this.conf.CELERY_BACKEND_OPTIONS
      );
    }

    return this._backend;
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
