"use strict";
const celery = require("../../dist");
const worker = celery.createWorker("redis://", "redis://");

worker.register("delay_job", async () => {
  const delayTime = 1000;

  await new Promise((resolve, reject) => {
    setTimeout(resolve, delayTime);
  });
  return {
    delayTime
  };
});
worker.start();
