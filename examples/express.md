## Using express
### express (client)
server.js
```javascript
"use strict";
const express = require('express');
const app = require("./app"); 

// start the UI
app(express()).listen(5000);
console.log( 'Video conversion server started on port 5000' );
```
app.js
```javascript
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
```

### worker
```javascript
const celery = require('../../dist');
const celeryWorker = celery.createWorker("redis://", "redis://");

celeryWorker.register("video_conversion", async (name, frames) => {
  console.log(`video_conversion ${name} start`)
  for (let i = 0; i < frames; i++) {
    await new Promise((resolve, reject) => {
      setTimeout(resolve, Math.random * 100);
    });
    console.log(`frame: ${i} done`);
  }
  console.log(`video_conversion ${name} done`)
  return {
    name,
    frames,
  }
});
celeryWorker.start();
```
