## Using async await
### client
```javascript
"use strict";
const celery = require("../../dist");

const client = celery.createClient("redis://", "redis://");
// client.conf.TASK_PROTOCOL = 1;

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
const celery = require('../../dist');
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