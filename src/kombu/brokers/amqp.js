import amqplib from 'amqplib';

export default class AMQPBroker {
  /**
   * AMQP broker class
   * @constructor AMQPBroker
   * @param {string} url the connection string of amqp
   * @param {object} opts the options object for amqp connect of amqplib
   */
  constructor(url, opts) {
    this.connect = amqplib.connect(url, opts);
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

  /**
   * @method AMQPBroker#isReady
   * @returns {Promise} promises that continues if amqp connected.
   */
  isReady() {
    return this.connect;
  }

  /**
   * @method AMQPBroker#disconnect
   * @returns {Promise} promises that continues if amqp disconnected.
   */
  disconnect() {
    return this.connect.then(conn => conn.close());
  }

  /**
   * @method AMQPBroker#publish
   * @param {String} queue
   * @param {String} message
   * @returns {Promise}
   */
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

  /**
   * @method AMQPBroker#subscribe
   * @param {String} queue
   * @param {Function} callback
   * @returns {Promise}
   */
  subscribe(queue, callback) {
    return this.channel
      .then(ch => ch.assertQueue(queue, {
        durable: true,
        autoDelete: false,
        exclusive: false,
        nowait: false,
        arguments: null,
      }).then(() => Promise.resolve(ch)))
      .then(ch => ch.consume(queue, (msg) => {
        ch.ack(msg);

        // now supports only application/json of content-type
        if (msg.properties.contentType !== 'application/json') {
          throw new Error(`unsupported content type ${msg.properties.contentType}`);
        }

        // now supports only utf-9 of content-encoding
        if (msg.properties.contentEncoding !== 'utf-8') {
          throw new Error(`unsupported content encoding ${msg.properties.contentEncoding}`);
        }

        const body = JSON.parse(msg.content.toString('utf-8'));
        callback(body);
      }));
  }
}
