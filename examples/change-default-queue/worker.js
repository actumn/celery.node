"use strict";
const celery = require("../../dist");

const worker = celery.createWorker("redis://", "redis://", "changeme");
worker.register("tasks.add", (a, b) => a + b);
worker.start();
