"use strict";
const celery = require("../../dist");

const worker = celery.createWorker("redis://", "redis://");
worker.register("tasks.add", (a, b) => a + b);
worker.register("tasks.add_kwargs", (a, b, { c, d }) => a + b + c + d);
worker.start();
