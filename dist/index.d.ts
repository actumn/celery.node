import Client from "./app/client";
import Worker from "./app/worker";
/**
 * @description Basic function for creating celery client
 *
 * @function
 * @returns {Client}
 */
export declare function createClient(broker?: string, backend?: string, queue?: string): Client;
/**
 * @description Basic function for creating celery worker
 *
 * @function
 * @returns {Worker}
 */
export declare function createWorker(broker?: string, backend?: string, queue?: string): Worker;
