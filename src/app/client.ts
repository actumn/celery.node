import { v4 } from "uuid";
import Base from "./base";
import Task from "./task";
import type { TaskOptions } from "./task";
import { AsyncResult } from "./result";

class TaskMessage {
  constructor(
    readonly headers: object,
    readonly properties: object,
    readonly body: [Array<any>, object, object] | object,
    readonly sentEvent: object
  ) {}
}


export default class Client extends Base {
  private taskProtocols = {
    1: this.asTaskV1,
    2: this.asTaskV2
  };

  get createTaskMessage(): (...args: any[]) => TaskMessage {
    return this.taskProtocols[this.conf.TASK_PROTOCOL];
  }

  public sendTaskMessage(taskName: string, message: TaskMessage, options: TaskOptions = {}): void {
    const { headers, properties, body /*, sentEvent */ } = message;

    const exchange = "";
    // exchangeType = 'direct';
    // const serializer = 'json';

    this.isReady().then(() =>
      this.broker.publish(
        body,
        options?.exchange ?? exchange,
        options?.routingKey ?? this.conf.CELERY_QUEUE,
        headers,
        properties
      )
    );
  }

  public asTaskV2(
    taskId: string,
    taskName: string,
    args?: Array<any>,
    kwargs?: object
  ): TaskMessage {
    const message: TaskMessage = {
      headers: {
        lang: "js",
        task: taskName,
        id: taskId
        /*
        'shadow': shadow,
        'eta': eta,
        'expires': expires,
        'group': group_id,
        'retries': retries,
        'timelimit': [time_limit, soft_time_limit],
        'root_id': root_id,
        'parent_id': parent_id,
        'argsrepr': argsrepr,
        'kwargsrepr': kwargsrepr,
        'origin': origin or anon_nodename()
        */
      },
      properties: {
        correlationId: taskId,
        replyTo: ""
      },
      body: [args, kwargs, {}],
      sentEvent: null
    };

    return message;
  }

  /**
   * create json string representing celery task message. used by Client.publish
   *
   * celery protocol reference: https://docs.celeryproject.org/en/latest/internals/protocol.html
   * celery code: https://github.com/celery/celery/blob/4aefccf8a89bffe9dac9a72f2601db1fa8474f5d/celery/app/amqp.py#L307-L464
   *
   * @function createTaskMessage
   *
   * @returns {String} JSON serialized string of celery task message
   */
  public asTaskV1(
    taskId: string,
    taskName: string,
    args?: Array<any>,
    kwargs?: object
  ): TaskMessage {
    const message: TaskMessage = {
      headers: {},
      properties: {
        correlationId: taskId,
        replyTo: ""
      },
      body: {
        task: taskName,
        id: taskId,
        args: args,
        kwargs: kwargs
      },
      sentEvent: null
    };

    return message;
  }

  /**
   * createTask
   * @method Client#createTask
   * @param {string} name for task name
   * @returns {Task} task object
   *
   * @example
   * client.createTask('task.add').delay([1, 2])
   */
  public createTask(name: string, options?: TaskOptions): Task {
    return new Task(this, name, options);
  }

  /**
   * get AsyncResult by task id
   * @param {string} taskId for task identification.
   * @returns {AsyncResult} 
   */
  public asyncResult(taskId: string): AsyncResult {
    return new AsyncResult(taskId, this.backend);
  }

  public sendTask(
    taskName: string,
    args?: Array<any>,
    kwargs?: object,
    taskId?: string,
    options?: TaskOptions
  ): AsyncResult {
    taskId = taskId || v4();
    const message = this.createTaskMessage(taskId, taskName, args, kwargs);
    this.sendTaskMessage(taskName, message, options);

    const result = new AsyncResult(taskId, this.backend);
    return result;
  }
}
