# Using async await
If you want to use `async / await`, this example would be help.

### client
```javascript
"use strict";
const celery = require("celery-node");

const client = celery.createClient("redis://", "redis://");

const task = client.createTask("delay_job");

async function main() {
  const result = task.applyAsync();
  const data= await result.get();
  console.log(data);
  await client.disconnect();
} 

main();
```

### worker
```javascript
"use strict";
const celery = require('celery-node');
const worker = celery.createWorker("redis://", "redis://");

worker.register("delay_job", async () => {
  const delayTime = 1000;

  await new Promise((resolve, reject) => {
    setTimeout(resolve, delayTime);
  })
  return {
    delayTime
  }
});
worker.start();
```