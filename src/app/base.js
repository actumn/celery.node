import CeleryBroker from '../kombu/brokers';
import CeleryBackend from '../backends';

export default class Base {
  constructor({
    CELERY_BROKER = 'amqp://',
    CELERY_BROKER_OPTIONS = {},
    CELERY_BACKEND = CELERY_BROKER,
    CELERY_BACKEND_OPTIONS = {},
  }) {
    this.backend = CeleryBackend(CELERY_BACKEND, CELERY_BACKEND_OPTIONS);
    this.broker = CeleryBroker(CELERY_BROKER, CELERY_BROKER_OPTIONS);
  }

  isReady() {
    return Promise.all([
      this.backend.isReady(),
      this.broker.isReady(),
    ]);
  }

  disconnect() {
    return Promise.all([
      this.backend.disconnect(),
      this.broker.disconnect(),
    ]);
  }
}
