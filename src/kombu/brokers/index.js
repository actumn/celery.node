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
 * codes from bull: https://github.com/OptimalBits/bull/blob/129c6e108ce67ca343c8532161d06742d92b651c/lib/queue.js#L296-L310
 * @private
 * @param {String} urlString 
 */
function redisOptsFromUrl(urlString) {
  const redisOpts = {};
  try {
    const redisUrl = url.parse(urlString);
    redisOpts.port = redisUrl.port || 6379;
    redisOpts.host = redisUrl.hostname;
    redisOpts.db = redisUrl.pathname ? redisUrl.pathname.split('/')[1] : 0;
    if (redisUrl.auth) {
      [, redisOpts.password] = redisUrl.auth.split(':');
    }
  } catch (e) {
    throw new Error(e.message);
  }
  return redisOpts;
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
    return new RedisBroker({
      ...redisOptsFromUrl(CELERY_BROKER),
      ...CELERY_BROKER_OPTIONS,
    });
  }

  if (brokerProtocol === 'amqp') {
    return new AMQPBroker({
      url: CELERY_BROKER,
      ...CELERY_BROKER_OPTIONS,
    });
  }

  // do not reach here.
  throw new Error('unsupprted celery broker');
}
