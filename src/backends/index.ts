import url from 'url';
import RedisBackend from './redis';
import AMQPBackend from './amqp';

/**
 * Support backend protocols of celery.node.
 * @private
 * @constant
 *
 * @type {Array}
 */
const supportedProtocols = ['redis', 'amqp'];

/**
 * takes url string and after parsing scheme of url, returns protocol.
 *
 * @private
 * @param {String} uri 
 * @returns {String} protocol string.
 * @throws {Error} when url has unsupported protocols
 */
function getProtocol(uri) {
  const protocol = url.parse(uri).protocol.slice(0, -1);
  if (supportedProtocols.indexOf(protocol) === -1) {
    throw new Error(`Unsupported type: ${protocol}`);
  }
  return protocol;
}

/**
 * 
 * @param {String} CELERY_BACKEND 
 * @param {object} CELERY_BACKEND_OPTIONS 
 * @returns {AMQPBackend | RedisBackend}
 */
export default function CeleryBackend(CELERY_BACKEND, CELERY_BACKEND_OPTIONS) {
  const brokerProtocol = getProtocol(CELERY_BACKEND);
  if (brokerProtocol === 'redis') {
    return new RedisBackend(CELERY_BACKEND, CELERY_BACKEND_OPTIONS);
  }

  if (brokerProtocol === 'amqp') {
    console.log(CELERY_BACKEND)
    return new AMQPBackend(CELERY_BACKEND, CELERY_BACKEND_OPTIONS);
  }

  // do not reach here.
  throw new Error('unsupprted celery backend');
}
