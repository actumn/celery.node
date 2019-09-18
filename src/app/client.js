import uuid from 'uuid';
import Base from './base';
import Task from './task';
import AsyncResult from './result';

/*
https://docs.celeryproject.org/en/latest/internals/protocol.html
protocol v1

celery code:
https://github.com/celery/celery/blob/4aefccf8a89bffe9dac9a72f2601db1fa8474f5d/celery/app/amqp.py#L307-L464
*/
export function createTaskMessage(id, taskName, args, kwargs) {
  const message = {
    id,
    task: taskName,
    args: args || [],
    kwargs: kwargs || {},
  };

  if (message.eta) {
    message.eta = new Date(message.eta).toISOString();
  }

  if (message.expires) {
    message.expires = new Date(message.expires).toISOString();
  }

  return JSON.stringify(message);
}

export default class Client extends Base {
  createTask(name) {
    return new Task(this, name);
  }

  delay(name, args, kwargs) {
    const result = this.createTask(name).delay(args, kwargs);

    return result;
  }


  publish(task, args, kwargs) {
    const taskId = uuid.v4();
    const result = new AsyncResult(taskId, this.backend);

    const message = createTaskMessage(taskId, task.name, args, kwargs);

    this.isReady()
      .then(() => this.broker.publish('celery', message));

    return result;
  }
}
