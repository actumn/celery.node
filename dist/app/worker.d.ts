import Base from "./base";
export default class Worker extends Base {
    handlers: object;
    activeTasks: Set<Promise<any>>;
    /**
     * Register task handler on worker handlers
     * @method Worker#register
     * @param {String} name the name of task for dispatching.
     * @param {Function} handler the function for task handling
     *
     * @example
     * worker.register('tasks.add', (a, b) => a + b);
     * worker.start();
     */
    register(name: string, handler: Function): void;
    /**
     * Start celery worker to run
     * @method Worker#start
     * @example
     * worker.register('tasks.add', (a, b) => a + b);
     * worker.start();
     */
    start(): Promise<any>;
    /**
     * @method Worker#run
     * @private
     *
     * @returns {Promise}
     */
    private run;
    /**
     * @method Worker#processTasks
     * @private
     *
     * @returns function results
     */
    private processTasks;
    /**
     * @method Worker#getConsumer
     * @private
     *
     * @param {String} queue queue name for task route
     */
    private getConsumer;
    createTaskHandler(): Function;
    /**
     * @method Worker#whenCurrentJobsFinished
     *
     * @returns Promise that resolves when all jobs are finished
     */
    whenCurrentJobsFinished(): Promise<any[]>;
    /**
     * @method Worker#stop
     *
     * @todo implement here
     */
    stop(): any;
}
