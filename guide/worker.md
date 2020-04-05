# Worker
![IMAGE](../assets/images/celery.node-worker.png)

Let's see how to use celery.node worker.  
It is recommended to set configuration before use.
```javascript
const celery = require("celery-node");

const worker = celery.createWorker("amqp://", "amqp://");
// worker.conf.BROKER_OPTIONS = {};

worker.register("tasks.add", (a, b) => a + b);
worker.register("tasks.add_kwargs", (a, b, { c, d }) => a + b + c + d);
worker.start();
```

### .register()
```javascript
register(name: string, handler: Function): void
```
The function to define which code blocks would be processed based on task name.  
- *name* the task name
- *handler* the task function. If the last arogument is object, it would be considered `kwargs`.

#### Usage
```javascript
worker.register("tasks.add", (a, b) => a + b);
// which is equivalant below
worker.register("tasks.add", function (a, b) { 
  return a + b;
});
client.createTask("tasks.add").applyAsync([1, 2])

worker.register("tasks.add_kwargs", (a, b, { c, d }) => a + b + c + d);
// which is equivalant below
worker.regitser("tasks.add_kwargs", function (a, b, {c, d}) {
  return a + b + c + d;
});
client.createTask("tasks.add").applyAsync([1, 2], { c: 3, d: 4 })
```

### .start()
```javascript
start(): Promise
```
The function to start worker.


## Configuration

- BROKER_OPTIONS

Broker options of celery.node.  
Default value is `{}` (empty object). 

More details on [Broker](guide/broker)
```javascript
worker.conf.BROKER_OPTIONS = {}
```
- BACKEND_OPTIONS

Result backend options of celery.node.  
Default value is `{}` (empty object).

More details on [Backend](guide/backend)
```javascript
worker.conf.BACKEND_OPTIONS = {}
```

- WORKER_PREFETCH_MULTIPLIER
