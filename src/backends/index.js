import url from 'url';
import RedisBackend from './redis';
import AMQPBackend from './amqp';

const supportedProtocols = ['redis', 'amqp'];
function getProtocol(uri) {
  const protocol = url.parse(uri).protocol.slice(0, -1);
  if (supportedProtocols.indexOf(protocol) === -1) {
    throw new Error(`Unsupported type: ${protocol}`);
  }
  return protocol;
}

// codes from bull: https://github.com/OptimalBits/bull/blob/129c6e108ce67ca343c8532161d06742d92b651c/lib/queue.js#L296-L310
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

export default function CeleryBackend(CELERY_BACKEND, CELERY_BACKEND_OPTIONS) {
  const brokerProtocol = getProtocol(CELERY_BACKEND);
  if (brokerProtocol === 'redis') {
    return new RedisBackend({
      ...redisOptsFromUrl(CELERY_BACKEND),
      ...CELERY_BACKEND_OPTIONS,
    });
  }

  if (brokerProtocol === 'amqp') {
    return new AMQPBackend({
      url: CELERY_BACKEND,
      ...CELERY_BACKEND_OPTIONS,
    });
  }

  // do not reach here.
  throw new Error('unsupprted celery backend');
}
