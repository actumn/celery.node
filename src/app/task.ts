import Client from "./client";
import { AsyncResult } from "./result";

/** Task executation options
 * Originally allows these keys:
 *  ['queue', 'routing_key', 'exchange', 'priority', 'expires',
 *   'serializer', 'delivery_mode', 'compression', 'time_limit',
 *   'soft_time_limit', 'immediate', 'mandatory']
 * but now only part of them are supported.
*/
export type TaskOptions = {
  exchange?: string;
  queue?: string;
  routingKey?: string;
}

export default class Task {
  client: Client;
  name: string;
  options?: TaskOptions;

  /**
   * Asynchronous Task
   * @constructor Task
   * @param {Client} clinet celery client instance
   * @param {string} name celery task name
   * @param {Object} [options]
   * @param {string} [options.queue] queue name
   * @param {string} [options.routingKey] routing key
   */
  constructor(client: Client, name: string, options: TaskOptions = {}) {
    this.client = client;
    this.name = name;
    this.options = options;
  }

  /**
   * @method Task#delay
   *
   * @returns {AsyncResult} the result of client.publish
   *
   * @example
   * client.createTask('task.add').delay(1, 2)
   */
  public delay(...args: any[]): AsyncResult {
    return this.applyAsync([...args]);
  }

  public applyAsync(args: Array<any>, kwargs?: object, options?: TaskOptions): AsyncResult {
    if (args && !Array.isArray(args)) {
      throw new Error("args is not array");
    }

    if (kwargs && typeof kwargs !== "object") {
      throw new Error("kwargs is not object");
    }

    return this.client.sendTask(this.name, args || [], kwargs || {}, undefined, options || this.options);
  }
}
