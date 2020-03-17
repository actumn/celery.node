"use strict";
const celery = require("../dist");

const client = celery.createClient();
// client.conf.TASK_PROTOCOL = 1;

const result = client.delay("tasks.add", [1, 2]);
result.get().then(data => {
  console.log(data);
  client.disconnect();
});
