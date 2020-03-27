## Basic using redis
This example describes how to use `celery-node` with redis.

### client
```javascript
"use strict";
const celery = require("celery-node");

const client = celery.createClient("redis://", "redis://");

const task = client.createTask("tasks.add");
const taskKwargs = client.createTask("tasks.add_kwargs");
Promise.all([
  task.delay(1, 2).get().then(console.log),
  task.applyAsync([1, 2]).get().then(console.log),
  taskKwargs.delay(1, 2, { c: 3, d: 4 }).get().then(console.log),
  taskKwargs.applyAsync([1, 2], { c: 3, d: 4 }).get().then(console.log),
]).then(() => client.disconnect());
```

### worker
```javascript
"use strict";
const celery = require("celery-node");

const worker = celery.createWorker("redis://", "redis://");
worker.register("tasks.add", (a, b) => a + b);
worker.register("tasks.add_kwargs", (a, b, { c, d }) => a + b + c + d);
worker.start();
```