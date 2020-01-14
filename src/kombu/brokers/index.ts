import url from 'url';
import RedisBroker from './redis';
import AMQPBroker from './amqp';
/**
 * Support broker protocols of celery.node.
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
 * @param {String} CELERY_BROKER 
 * @param {String} CELERY_BROKER_OPTIONS 
 * @returns {AMQPBroker | RedisBroker}
 */
export default function CeleryBroker(CELERY_BROKER, CELERY_BROKER_OPTIONS) {
  const brokerProtocol = getProtocol(CELERY_BROKER);
  if (brokerProtocol === 'redis') {
    return new RedisBroker(CELERY_BROKER, CELERY_BROKER_OPTIONS);
  }

  if (brokerProtocol === 'amqp') {
    return new AMQPBroker(CELERY_BROKER, CELERY_BROKER_OPTIONS);
  }

  // do not reach here.
  throw new Error('unsupprted celery broker');
}
