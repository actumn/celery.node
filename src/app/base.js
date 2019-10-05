/**
 * writes here Base Parent class of Celery client and worker
 * @author SunMyeong Lee <actumn814@gmail.com>
 */
import CeleryBroker from '../kombu/brokers';
import CeleryBackend from '../backends';

export default class Base {
  /**
   * Parent Class of Client and Worker
   * for creates an instance of celery broker and celery backend
   *
   * @constructor Base
   * @param {object} conf the configuration object of Base class for both Celery client and worker, containing celery broker information and celery backend information
   * @param {string} conf.CELERY_BROKER celery broker connect url. ex) 'amqp://localhost' or 'redis;//localhsot'
   * @param {object} conf.CELERY_BROKER_OPTIONS celery broker connect extra option for specific broker features
   * @param {string} conf.CELERY_BACKEND celery backend connect url. ex) 'amqp://localhost' or 'redis;//localhsot'
   * @param {object} conf.CELERY_BACKEND_OPTIONS celery backend connect extra option for specific backend feaatures
   */
  constructor({
    CELERY_BROKER = 'amqp://',
    CELERY_BROKER_OPTIONS = {},
    CELERY_BACKEND = CELERY_BROKER,
    CELERY_BACKEND_OPTIONS = {},
  }) {
    /**
     * backend
     * @member Base#backend
     * @protected
     */
    this.backend = CeleryBackend(CELERY_BACKEND, CELERY_BACKEND_OPTIONS);
    /**
     * broker
     * @member Base#broker
     * @protected
     */
    this.broker = CeleryBroker(CELERY_BROKER, CELERY_BROKER_OPTIONS);
  }

  /**
   * returns promise for working some job after ready.
   * @method Base#isReady
   *
   * @returns {Promise} promise that continues if backend and broker connected.
   */
  isReady() {
    return Promise.all([
      this.backend.isReady(),
      this.broker.isReady(),
    ]);
  }

  /**
   * returns promise for working some job after backend and broker ready.
   * @method Base#disconnect
   *
   * @returns {Promise} promises that continues if backend and broker disconnected.
   */
  disconnect() {
    return Promise.all([
      this.backend.disconnect(),
      this.broker.disconnect(),
    ]);
  }
}
