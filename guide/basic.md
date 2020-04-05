# Basic
`celery-node` provides the api to create celery.node client and worker. 
```javascript
const celery = require('celery-node');

const worker = celery.createWorker("redis://", "redis://");
const client = celery.createClient("redis://", "redis://");
```



### .createWorker()
```javascript
createWorker(broker?: string, backend?: string): Worker
```
The function to create celery.node worker which consumes task from a broker, process code blocks and store results on a result backend

- *broker* default value is `amqp://`
- *backend* default value is `amqp://`

#### Usage
```javascript
const celery = require("celery-node");

// Below makes worker using default broker and backend ("amqp://") 
const worker = celery.createWorker();
// If you want to make worker using redis broker, backend 
const worker = celery.createWorker("redis://", "redis://");
```

### .createClient()
```javascript
createClient(broker?: string, backend?: string): Worker
```
The function to create celery.node client which produces tasks to a broker and get results from a result backend.

- *broker* default value is `amqp://`
- *backend* default value is `amqp://`

#### Usage
```javascript
const celery = require("celery-node");

// Below makes client using default broker and backend ("amqp://")
const client = celery.createClient();
// if you want to make worker using redis broker, backend 
const client = celery.createClient("redis://", "redis://");
```

