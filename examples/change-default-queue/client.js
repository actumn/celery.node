"use strict";
const celery = require("../../dist");

const client = celery.createClient("redis://", "redis://", "changeme");

const task = client.createTask("tasks.add");
const result = task.applyAsync([1, 2]);
result.get().then(data => {
  console.log(data);
  client.disconnect();
});
