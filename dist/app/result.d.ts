import { CeleryBackend } from "../backends";
export declare class AsyncResult {
    taskId: string;
    backend: CeleryBackend;
    private _cache;
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
    get(timeout?: number, interval?: number): Promise<any>;
    private getTaskMeta;
    result(): Promise<any>;
    status(): Promise<string>;
}
