import * as url from "url";
import RedisBackend from "./redis";
import AMQPBackend from "./amqp";

export interface CeleryBackend {
  isReady: () => Promise<any>;
  disconnect: () => Promise<any>;
  storeResult: (taskId: string, result: any, state: string) => Promise<any>;
  getTaskMeta: (taskId: string) => Promise<object>;
}

/**
 * Support backend protocols of celery.node.
 * @private
 * @constant
 */
const supportedProtocols = ["redis", "amqp", "amqps"];

/**
 * takes url string and after parsing scheme of url, returns protocol.
 *
 * @private
 * @param {string} uri
 * @returns {String} protocol string.
 * @throws {Error} when url has unsupported protocols
 */
function getProtocol(uri: string): string {
  const protocol = url.parse(uri).protocol.slice(0, -1);
  if (supportedProtocols.indexOf(protocol) === -1) {
    throw new Error(`Unsupported type: ${protocol}`);
  }
  return protocol;
}

/**
 *
 * @param {string} CELERY_BACKEND
 * @param {object} CELERY_BACKEND_OPTIONS
 * @returns {CeleryBackend}
 */
export function newCeleryBackend(
  CELERY_BACKEND: string,
  CELERY_BACKEND_OPTIONS: object
): CeleryBackend {
  const brokerProtocol = getProtocol(CELERY_BACKEND);
  if (brokerProtocol === "redis") {
    return new RedisBackend(CELERY_BACKEND, CELERY_BACKEND_OPTIONS);
  }

  if (['amqp', 'amqps'].indexOf(brokerProtocol) > -1) {
    return new AMQPBackend(CELERY_BACKEND, CELERY_BACKEND_OPTIONS);
  }

  // do not reach here.
  throw new Error("unsupprted celery backend");
}
