import Client from "./client";
import { AsyncResult } from "./result";

export interface TaskOptions {

  /**
   * @member {string} 
   */
  taskId: string;

  /**
   * @member {number} 
   * Number of seconds into the future that the task should execute.
   * Defaults to immediate execution.
   */
  countdown: number;

  /**
   * @member {Date} 
   * Absolute time and date of when the task should be executed.
   * May not be specified if `countdown` is also supplied.
   */
  eta: Date;

  /**
   * @member {Number | Date}
   * Datetime or seconds in the future for the task should expire.
   * The task won't be executed after the expiration time.
   */
  expires: number | Date;

  // TODO:: retry, retryPolicy 
}

export default class Task {
  client: Client;
  name: string;

  /**
   * Asynchronous Task
   * @constructor Task
   * @param {Client} clinet celery client instance
   * @param {string} name celery task name
   */
  constructor(client: Client, name: string) {
    this.client = client;
    this.name = name;
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

  public applyAsync(args: Array<any>, kwargs?: object, taskOptions?: TaskOptions): AsyncResult {
    if (args && !Array.isArray(args)) {
      throw new Error("args is not array");
    }

    if (kwargs && typeof kwargs !== "object") {
      throw new Error("kwargs is not object");
    }

    return this.client.sendTask(this.name, args || [], kwargs || {});
  }
}
