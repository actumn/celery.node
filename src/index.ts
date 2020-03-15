import { CeleryConf } from "./app/conf";
import Client from "./app/client";
import Worker from "./app/worker";

/**
 * @description Basic function for creating celery client
 *
 * @function
 * @param {CeleryConf} conf configuration object for options of celery client
 * @returns {Client}
 */
export function createClient(conf: CeleryConf): Client {
  return new Client(conf);
}

/**
 * @description Basic function for creating celery worker
 *
 * @function
 * @param {CeleryConf} conf configuration object for options of celery worker
 * @returns {CeleryWorker}
 */
export function createWorker(conf: CeleryConf): Worker {
  return new Worker(conf);
}
