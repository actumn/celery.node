import Base from "./base";
import { Message } from "../kombu/message";

export default class Worker extends Base {
  handlers: object = {};

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
  public register(name: string, handler: Function): void {
    if (!handler) {
      throw new Error("Undefined handler");
    }
    if (this.handlers[name]) {
      throw new Error("Already handler setted");
    }

    this.handlers[name] = function registHandler(...args: any[]): Promise<any> {
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
    console.info("celery.node worker start...");
    console.info(`registed task: ${Object.keys(this.handlers)}`);
    this.broker.qos(this.conf.WORKER_PREFETCH_MULTIPLIER, true);
    return this.run().catch(err => console.error(err));
  }

  /**
   * @method Worker#run
   * @private
   *
   * @returns {Promise}
   */
  private run(): Promise<any> {
    return this.isReady().then(() => this.processTasks());
  }

  /**
   * @method Worker#processTasks
   * @private
   *
   * @returns function results
   */
  private processTasks(): Promise<any> {
    const consumer = this.getConsumer("celery");
    return consumer();
  }

  /**
   * @method Worker#getConsumer
   * @private
   *
   * @param {String} queue queue name for task route
   */
  private getConsumer(queue: string): Function {
    const onMessage = this.createTaskHandler();

    return () => this.broker.subscribe(queue, onMessage);
  }

  public createTaskHandler(): Function {
    const onTaskReceived = (message: Message) => {
      if (!message) {
        return Promise.resolve();
      }

      let payload = null;
      let taskName = message.headers["task"];
      if (!taskName) {
        // protocol v1
        payload = message.decode();
        taskName = payload["task"];
      }

      // strategy
      let body;
      let headers;
      if (payload == null && !("args" in message.decode())) {
        body = message.decode(); // message.body;
        headers = message.headers;
      } else {
        const args = payload["args"] || [];
        const kwargs = payload["kwargs"] || {};
        const embed = {
          callbacks: payload["callbacks"],
          errbacks: payload["errbacks"],
          chord: payload["chord"],
          chain: null
        };

        body = [args, kwargs, embed];
        headers = {
          lang: payload["lang"],
          task: payload["task"],
          id: payload["id"],
          rootId: payload["root_id"],
          parantId: payload["parentId"],
          group: payload["group"],
          meth: payload["meth"],
          shadow: payload["shadow"],
          eta: payload["eta"],
          expires: payload["expires"],
          retries: payload["retries"] || 0,
          timelimit: payload["timelimit"] || [null, null],
          kwargsrepr: payload["kwargsrepr"],
          origin: payload["origin"]
        };
      }

      // request
      const [args, kwargs, embed] = body;
      const taskId = headers["id"];

      const handler = this.handlers[taskName];
      if (!handler) {
        throw new Error(`Missing process handler for task ${taskName}`);
      }

      console.info(
        `celery.node Received task: ${taskName}[${taskId}], args: ${args}, kwargs: ${JSON.stringify(
          kwargs
        )}`
      );

      const timeStart = process.hrtime();
      const taskPromise = handler(...args, kwargs);
      return taskPromise
        .then(result => {
          const diff = process.hrtime(timeStart);
          console.info(
            `celery.node Task ${taskName}[${taskId}] succeeded in ${diff[0] +
              diff[1] / 1e9}s: ${result}`
          );
          this.backend.storeResult(taskId, result, "SUCCESS");
        })
        .then(() => Promise.resolve());
    };

    return onTaskReceived;
  }

  /**
   * @method Worker#stop
   *
   * @todo implement here
   */
  // eslint-disable-next-line class-methods-use-this
  public stop() {
    throw new Error("not implemented yet");
  }
}
