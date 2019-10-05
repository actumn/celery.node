export default class Task {
  /**
   * Asynchronous Task
   * @constructor Task
   * @param {Client} clinet celery client instance
   * @param {String} name celery task name
   */
  constructor(client, name) {
    /**
     * Task client
     * @member Task#client
     */
    this.client = client;
    /**
     * Task name
     * @member Task#name
     */
    this.name = name;
  }

  /**
   * @method Task#delay
   * @param {Array} args
   * @param {object} kwargs
   * @returns {AsyncResult} the result of client.publish
   * @example
   * client.createTask('task.add').delay([1, 2])
   */
  delay(args, kwargs) {
    if (args && !Array.isArray(args)) {
      throw new Error('args is not array');
    }

    if (kwargs && typeof kwargs !== 'object') {
      throw new Error('kwargs is not object');
    }

    return this.client.publish(
      this,
      args || [],
      kwargs || {},
    );
  }
}
