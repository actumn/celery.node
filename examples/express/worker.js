"use strict";
const celery = require("../../dist");
const celeryWorker = celery.createWorker("redis://", "redis://");

celeryWorker.register("video_conversion", async (name, frames) => {
  console.log(`video_conversion ${name} start`);
  for (let i = 0; i < frames; i++) {
    await new Promise((resolve, reject) => {
      setTimeout(resolve, Math.random * 100);
    });
    console.log(`frame: ${i} done`);
  }
  console.log(`video_conversion ${name} done`);
  return {
    name,
    frames
  };
});
celeryWorker.start();
