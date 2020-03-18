"use strict";
const celery = require("../dist");

const client = celery.createClient("amqp://", "amqp://");
// client.conf.TASK_PROTOCOL = 1;

const task = client.createTask("tasks.add");
const result = task.applyAsync([1, 2]);
result.get().then(data => {
  console.log(data);
  client.disconnect();
});
