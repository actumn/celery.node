import Base from './base';
import logger from '../logger';

export default class Worker extends Base {
  constructor(conf) {
    super(conf);

    this.handlers = {};
  }

  register(name, handler) {
    if (!handler) {
      throw new Error('Undefined handler');
    }
    if (this.handlers[name]) {
      throw new Error('Already handler setted');
    }

    this.handlers[name] = function registHandler() {
      try {
        return Promise.resolve(handler(...arguments));
      } catch (err) {
        return Promise.reject(err);
      }
    };
  }

  start() {
    logger.info('celery.js worker start...');
    logger.info(`registed task: ${Object.keys(this.handlers)}`);
    return this.run().catch(err => logger.error(err));
  }

  run() {
    return this.isReady()
      .then(() => this.processTasks());
  }

  processTasks() {
    const consumer = this.getConsumer('celery');
    return consumer();
  }

  getConsumer(queue) {
    const receiveCallback = (body) => {
      if (!body) {
        return Promise.resolve();
      }

      const handler = this.handlers[body.task];
      if (!handler) {
        throw new Error(`Missing process handler for task ${body.name}`);
      }

      const taskPromise = handler(...body.args, body.kwargs);
      return taskPromise
        .then((result) => {
          this.backend.storeResult(body.id, result, 'SUCCESS');
        })
        .then(() => Promise.resolve());
    };

    return () => this.broker.subscribe(queue, receiveCallback);
  }

  // eslint-disable-next-line class-methods-use-this
  stop() {
    throw new Error('not implemented yet');
  }
}
