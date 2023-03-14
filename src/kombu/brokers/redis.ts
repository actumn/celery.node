import Redis from "ioredis";
import { v4 } from "uuid";
import { CeleryBroker } from ".";
import { Message } from "../message";


class RedisMessage extends Message {
  private raw: object;

  constructor(payload: object) {
    super(
      Buffer.from(payload["body"], "base64"),
      payload["content-type"],
      payload["content-encoding"],
      payload["properties"],
      payload["headers"]
    );

    this.raw = payload;
  }
}

export default class RedisBroker implements CeleryBroker {
  redis: Redis;
  channels = [];
  closing = false;

  /**
   * Redis broker class
   * @constructor RedisBroker
   * @param {string} url the connection string of redis
   * @param {object} opts the options object for redis connect of ioredis
   */
  constructor(url: string, opts: object) {
    this.redis = new Redis(url, {...opts});
  }

  /**
   * codes from here: https://github.com/OptimalBits/bull/blob/129c6e108ce67ca343c8532161d06742d92b651c/lib/utils.js#L21-L44
   * @method RedisBroker#isReady
   * @returns {Promise} promises that continues if redis connected.
   */
  public isReady(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.redis.status === "ready") {
        resolve();
      } else {
        let handleError; // eslint-disable-line prefer-const
        const handleReady = () => {
          this.redis.removeListener("error", handleError);
          resolve();
        };
        handleError = err => {
          this.redis.removeListener("ready", handleReady);
          reject(err);
        };

        this.redis.once("ready", handleReady);
        this.redis.once("error", handleError);
      }
    });
  }

  /**
   * @method RedisBroker#disconnect
   * @returns {Promise} promises that continues if redis disconnected.
   */
  public disconnect(): Promise<string> {
    this.closing = true;
    return Promise.all(this.channels).then(() => this.redis.quit());
  }

  /**
   * @method RedisBroker#publish
   *
   * @returns {Promise}
   */
  public publish(
    body: object | [Array<any>, object, object],
    exchange: string,
    routingKey: string,
    headers: object,
    properties: object
  ): Promise<number> {
    const messageBody = JSON.stringify(body);
    const contentType = "application/json";
    const contentEncoding = "utf-8";
    const message = {
      body: Buffer.from(messageBody).toString("base64"),
      "content-type": contentType,
      "content-encoding": contentEncoding,
      headers,
      properties: {
        body_encoding: "base64",
        delivery_info: {
          exchange: exchange,
          routing_key: routingKey
        },
        delivery_mode: 2,
        delivery_tag: v4(),
        ...properties
      }
    };

    return this.redis.lpush(routingKey, JSON.stringify(message));
  }

  /**
   * @method RedisBroker#subscribe
   * @param {string} queue
   * @param {Function} callback
   * @returns {Promise}
   */
  public subscribe(queue: string, callback: Function): Promise<any[]> {
    const promiseCount = 1;

    return this.isReady().then(() => {
      for (let index = 0; index < promiseCount; index += 1) {
        this.channels.push(
          new Promise(resolve => this.receive(index, resolve, queue, callback))
        );
      }

      return Promise.all(this.channels);
    });
  }

  /**
   * @private
   * @param {number} index
   * @param {Fucntion} resolve
   * @param {string} queue
   * @param {Function} callback
   */
  private receive(
    index: number,
    resolve: Function,
    queue: string,
    callback: Function
  ): void {
    process.nextTick(() =>
      this.recieveOneOnNextTick(index, resolve, queue, callback)
    );
  }

  /**
   * @private
   * @param {number} index
   * @param {Function} resolve
   * @param {String} queue
   * @param {Function} callback
   * @returns {Promise}
   */
  private recieveOneOnNextTick(
    index: number,
    resolve: Function,
    queue: string,
    callback: Function
  ): Promise<void> {
    if (this.closing) {
      resolve();
      return;
    }

    return this.receiveOne(queue)
      .then(body => {
        if (body) {
          callback(body);
        }
        Promise.resolve();
      })
      .then(() => this.receive(index, resolve, queue, callback))
      .catch(err => console.log(err));
  }

  /**
   * @private
   * @param {string} queue
   * @return {Promise}
   */
  private receiveOne(queue: string): Promise<Message> {
    return this.redis.brpop(queue, "5").then(result => {
      if (!result) {
        return null;
      }

      const [queue, item] = result;
      const rawMsg = JSON.parse(item);

      // now supports only application/json of content-type
      if (rawMsg["content-type"] !== "application/json") {
        throw new Error(
          `queue ${queue} item: unsupported content type ${rawMsg["content-type"]}`
        );
      }
      // now supports only base64 of body_encoding
      if (rawMsg.properties.body_encoding !== "base64") {
        throw new Error(
          `queue ${queue} item: unsupported body encoding ${rawMsg.properties.body_encoding}`
        );
      }
      // now supports only utf-8 of content-encoding
      if (rawMsg["content-encoding"] !== "utf-8") {
        throw new Error(
          `queue ${queue} item: unsupported content encoding ${rawMsg["content-encoding"]}`
        );
      }

      return new RedisMessage(rawMsg);
    });
  }
}
