import Client from "./client";
import { AsyncResult } from "./result";

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
   * @param {Array} args
   * @param {object} kwargs
   * @returns {AsyncResult} the result of client.publish
   *
   * @example
   * client.createTask('task.add').delay([1, 2])
   */
  public delay(args: Array<any>, kwargs?: object): AsyncResult {
    return this.applyAsync(args, kwargs)
  }

  public applyAsync(args: Array<any>, kwargs?: object): AsyncResult {
    if (args && !Array.isArray(args)) {
      throw new Error("args is not array");
    }

    if (kwargs && typeof kwargs !== "object") {
      throw new Error("kwargs is not object");
    }

    return this.client.sendTask(this.name, args || [], kwargs || {})
  }
}
