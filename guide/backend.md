# Backend

```javascript
worker.conf.BACKEND_OPTIONS = {}
client.conf.BACKEND_OPTIONS = {}
```

## Redis
celrey.node uses [ioredis](https://github.com/luin/ioredis) as a redis connector.  


### Options
More details on [ioredis options](https://github.com/luin/ioredis/blob/master/API.md#new_Redis_new).  

| Param   | Description |
|---------|-------------|
| keepAlive | TCP KeepAlive on the socket with a X ms delay before start. |
| noDelay | Whether to disable the Nagle's Algorithm. |
| dropBufferSupport | Drop the buffer support for better performance. |
| enableReadyCheck |   |
| enableOfflineQueue |   |
| connectTimeout | The milliseconds before a timeout occurs during the initial connection to the Redis server. |

#### Usage
```javascript
worker.conf.BROKER_OPTIONS = {
  keepAlive: 0,
  noDelay: true,
  dopBufferSupport: false,
  enableReadyCheck: true,
  enableOfflineQueue: true,
  connectTiemout: 10000
}
```

## AMQP
celery.node uses [amqp.node](http://www.squaremobius.net/amqp.node/) as an amqp connector.

### Options
More details on [amqp.node socket options](http://www.squaremobius.net/amqp.node/channel_api.html#socket-options).

| Param   |  Description |
|---------|--------------|
| cert | client cert |
| key | client key |
| passphrase | passphrase for key |
| ca | array of trusted CA certs |

#### Usage
```javascript
worker.conf.BROKER_OPTIONS = {
  cert: fs.readFileSync('clientcert.pem'),
  key: fs.readFileSync('clientkey.pem'),
  passphrase: 'MySecretPassword',
  ca: [fs.readFileSync('cacert.pem')]
}
```