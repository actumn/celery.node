import { CeleryConf, DEFAULT_CELERY_CONF } from './conf';
import Base from './base';

export default class Worker extends Base {
  handlers: object;

  /**
   * Celery Worker
   * @extends {external:Base}
   * @constructor Worker
   * @param {CeleryConf} conf configuration object of Celery Worker. For more information, see Base#constructor.
   */
  constructor(conf: CeleryConf = DEFAULT_CELERY_CONF) {
    super(conf);

    this.handlers = {};
  }

  /**
   * register task handler on worker h andlers
   * @method Worker#register
   * @param {String} name the name of task for dispatching.
   * @param {Function} handler the function for task handling
   * 
   * @example
   * worker.register('tasks.add', (a, b) => a + b);
   * worker.start();
   */
  public register(
    name: string, 
    handler: Function
  ): void {
    if (!handler) {
      throw new Error('Undefined handler');
    }
    if (this.handlers[name]) {
      throw new Error('Already handler setted');
    }

    this.handlers[name] = function registHandler(...args: any[]) {
      try {
        return Promise.resolve(handler(...args));
      } catch (err) {
        return Promise.reject(err);
      }
    };
  }

  /**
   * start celery worker to run
   * @method Worker#start
   * @example
   * worker.register('tasks.add', (a, b) => a + b);
   * worker.start();
   */
  public start(): Promise<any> {
    console.info('celery.node worker start...');
    console.info(`registed task: ${Object.keys(this.handlers)}`);
    return this.run().catch(err => console.error(err));
  }

  /**
   * @method Worker#run
   * @private
   *
   * @returns {Promise}
   */
  private run(): Promise<any> {
    return this.isReady()
      .then(() => this.processTasks());
  }

  /**
   * @method Worker#processTasks
   * @private
   *
   * @returns function results
   */
  private processTasks(): Promise<any> {
    const consumer = this.getConsumer('celery');
    return consumer();
  }

  /**
   * @method Worker#getConsumer
   * @private
   *
   * @param {String} queue queue name for task route
   */
  private getConsumer(queue: string): Function {
    const receiveCallback = (body) => {
      if (!body) {
        return Promise.resolve();
      }

      const handler = this.handlers[body.task];
      if (!handler) {
        throw new Error(`Missing process handler for task ${body.task}`);
      }

      console.info(`celery.node receive task: ${body.task}, args: ${body.args}, kwargs: ${JSON.stringify(body.kwargs)}`);
      const taskPromise = handler(...body.args, body.kwargs);
      return taskPromise
        .then((result) => {
          this.backend.storeResult(body.id, result, 'SUCCESS');
        })
        .then(() => Promise.resolve());
    };

    return () => this.broker.subscribe(queue, receiveCallback);
  }

  /**
   * @method Worker#stop
   *
   * @todo implement here
   */
  // eslint-disable-next-line class-methods-use-this
  public stop() {
    throw new Error('not implemented yet');
  }
}
