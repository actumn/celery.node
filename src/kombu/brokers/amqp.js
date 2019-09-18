import amqplib from 'amqplib';

export default class AMQPBroker {
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

  publish(queue, message) {
    return this.channel
      .then(ch => ch.assertQueue(queue, {
        durable: true,
        autoDelete: false,
        exclusive: false,
        nowait: false,
        arguments: null,
      }).then(() => Promise.resolve(ch)))
      .then(ch => ch.publish('', queue, Buffer.from(message), {
        contentType: 'application/json',
        contentEncoding: 'utf-8',
      }));
  }

  subscribe(queue, callback) {
    return this.channel
      .then(ch => ch.consume(queue, (msg) => {
        ch.ack(msg);

        if (msg.properties.contentType !== 'application/json') {
          throw new Error(`unsupported content type ${msg.properties.contentType}`);
        }

        if (msg.properties.contentEncoding !== 'utf-8') {
          throw new Error(`unsupported content encoding ${msg.properties.contentEncoding}`);
        }

        const body = JSON.parse(msg.content.toString('utf-8'));
        callback(body);
      }));
  }
}
