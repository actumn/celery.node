"use strict";
const celery = require("../../dist");

const client = celery.createClient("redis://", "redis://");
// client.conf.TASK_PROTOCOL = 1;

const task = client.createTask("tasks.add");

Promise.all([
  task
    .applyAsync([1, 2], {}, {
      countdown: 10,
    })
    .get()
    .then(console.log),
  task
    .applyAsync([1, 2], {}, {
      eta: new Date(Date.now() + 3 * 1000),
    })
    .get()
    .then(console.log),
]).then(() => client.disconnect());
