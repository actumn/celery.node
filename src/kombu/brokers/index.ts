import * as url from "url";
import RedisBroker from "./redis";
import AMQPBroker from "./amqp";

export interface CeleryBroker {
  isReady: () => Promise<any>;
  disconnect: () => Promise<any>;
  publish: (
    body: object | [Array<any>, object, object],
    exchange: string,
    routingKey: string,
    headers: object,
    properties: object
  ) => Promise<any>;
  subscribe: (queue: string, callback: Function) => Promise<any>;
}

/**
 * Support broker protocols of celery.node.
 * @private
 * @constant
 */
const supportedProtocols = ["redis", "rediss", "amqp", "amqps"];

/**
 * takes url string and after parsing scheme of url, returns protocol.
 *
 * @private
 * @param {String} uri
 * @returns {String} protocol string.
 * @throws {Error} when url has unsupported protocols
 */
function getProtocol(uri): string {
  const protocol = url.parse(uri).protocol.slice(0, -1);
  if (supportedProtocols.indexOf(protocol) === -1) {
    throw new Error(`Unsupported type: ${protocol}`);
  }
  return protocol;
}

/**
 *
 * @param {String} CELERY_BROKER
 * @param {object} CELERY_BROKER_OPTIONS
 * @param {string} CELERY_QUEUE
 * @returns {CeleryBroker}
 */
export function newCeleryBroker(
  CELERY_BROKER: string,
  CELERY_BROKER_OPTIONS: any,
  CELERY_QUEUE = "celery",
  CELERY_QUEUE_OPTIONS = {}
): CeleryBroker {
  const brokerProtocol = getProtocol(CELERY_BROKER);
  if (["redis", "rediss"].indexOf(brokerProtocol) > -1) {
    return new RedisBroker(CELERY_BROKER, CELERY_BROKER_OPTIONS);
  }

  if (["amqp", "amqps"].indexOf(brokerProtocol) > -1) {
    return new AMQPBroker(
      CELERY_BROKER,
      CELERY_BROKER_OPTIONS,
      CELERY_QUEUE,
      CELERY_QUEUE_OPTIONS
    );
  }

  // do not reach here.
  throw new Error("unsupprted celery broker");
}
