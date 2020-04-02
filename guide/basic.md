# Basic
Let's see how to make client and worker.  
```javascript
const celery = require('celery-node');

const worker = celery.createWorker("redis://", "redis://");
const client = celery.createClient("redis://", "redis://");
```



### .createWorker()
```javascript
createWorker(broker?: string, backend?: string): Worker
```
- broker default value is `amqp://`
- backend default value is `amqp://`

#### Usage
```javascript
const celery = require('celery-node');

// Below makes worker  
const worker = celery.createWorker();
// If you want to make worker using redis broker, backend 
const worker = celery.createWorker("redis://", "redis://");
```

### .createClient()
```javascript
createClient(broker?: string, backend?: string): Worker
```
- broker default value is `amqp://`
- backend default value is `amqp://`

#### Usage
```javascript
const celery = require('celery-node');

const client = celery.createClient();
// if you want to make worker using redis broker, backend 
const client = celery.createClient("redis://", "redis://");
```



## Configuration

- BROKER_OPTIONS

the broker options of celery.node.  
```javascript
cleint.conf.BROKER_OPTIONS = {}
worker.conf.BROKER_OPTIONS = {}
```
- BACKEND_OPTIONS

the backend options of celery.node.  
```javascript
cleint.conf.BACKEND_OPTIONS = {} 
worker.conf.BACKEND_OPTIONS = {}
```
- TASK_PROTOCOL

the celery protocol version.  
default is `2`.  
If you want to see more, check [here](../internals/celery-protocol)
```javascript
client.conf.TASK_PROTOCOL = 2
```

