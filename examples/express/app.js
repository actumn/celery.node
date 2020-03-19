"use strict";
const celery = require('../../dist');
const celeryClient = celery.createClient("redis://", "redis://");


module.exports = function initApp(app) {
  app.get('/video-conversion', (req, res) => {
    const timeout = 10000;
    const name = 'sample-video.mp4';
    const frames = 150;

    const result = celeryClient.sendTask("video_conversion", [name, frames])
      .get(timeout)
      .then((data) => {
        res.json({
          data,
        })
      });
  });
  return app;
}