import amqplib from 'amqplib';

export default class AMQPBackend {
  constructor(opts) {
    this.connect = amqplib.connect(opts);
    this.channel = this.connect
      .then(conn => conn.createChannel())
      .then(ch => ch.assertExchange('default', 'direct', {
        durable: true,
        autoDElete: true,
        internal: false,
        nowait: false,
        arguments: null,
      }).then(() => Promise.resolve(ch)));
  }

  isReady() {
    return this.connect;
  }

  disconnect() {
    return this.connect.then(conn => conn.close());
  }

  storeResult(taskId, result, state) {
    const queue = taskId.replace(/-/g, '');
    return this.channel
      .then(ch => ch.assertQueue(queue, {
        durable: true,
        autoDelete: true,
        exclusive: false,
        nowait: false,
        arguments: {
          'x-expires': 86400000,
        },
      }).then(() => Promise.resolve(ch)))
      .then(ch => ch.publish('', queue, Buffer.from(JSON.stringify({
        status: state,
        result,
        traceback: null,
        children: [],
        task_id: taskId,
        date_done: new Date().toISOString(),
      })), {
        contentType: 'application/json',
        contentEncoding: 'utf-8',
      }));
  }

  getTaskMeta(taskId) {
    const queue = taskId.replace(/-/g, '');
    return this.channel
      .then(ch => ch.assertQueue(queue, {
        durable: true,
        autoDelete: true,
        exclusive: false,
        nowait: false,
        arguments: {
          'x-expires': 86400000,
        },
      }).then(() => Promise.resolve(ch)))
      .then(ch => ch.get(queue, {
        noAck: false,
      }))
      .then((msg) => {
        if (msg.properties.contentType !== 'application/json') {
          throw new Error(`unsupported content type ${msg.properties.contentType}`);
        }

        if (msg.properties.contentEncoding !== 'utf-8') {
          throw new Error(`unsupported content encoding ${msg.properties.contentEncoding}`);
        }

        const body = msg.content.toString('utf-8');
        return JSON.parse(body);
      });
  }
}
