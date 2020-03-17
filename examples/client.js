"use strict";
const celery = require("../dist");

const client = celery.createClient({
  CELERY_BROKER: "amqp://",
  CELERY_BACKEND: "amqp://"
});

const result = client.delay("tasks.add", [1, 2]);
result.get().then(data => {
  console.log(data);
  client.disconnect();
});
