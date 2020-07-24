import { CeleryBackend } from "../backends";
export declare class AsyncResult {
    taskId: string;
    backend: CeleryBackend;
    result: any;
    /**
     * Asynchronous Result
     * @constructor AsyncResult
     * @param {string} taskId task id
     * @param {CeleryBackend} backend celery backend instance
     */
    constructor(taskId: string, backend: CeleryBackend);
    /**
     * @method AsyncResult#get
     * @returns {Promise}
     */
    get(timeout?: number): Promise<any>;
}
