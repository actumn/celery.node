## Using with python - flask
### client
```python
from flask import Flask, jsonify
from celery import Celery

celery = Celery(
    broker='redis://',
    backend='redis://'
)

app = Flask(__name__)

@celery.task(name='video_conversion')
def video_conversion(name, frames):
    pass

@app.route('/video-conversion')
def video_conversion_api():
    timeout = 10000
    name = 'sample-video.mp4'
    frames = 150

    result = video_conversion.delay(name, frames)
    return jsonify(data=result.get(timeout))

if __name__ == '__main__':
    app.run(port=5000)
```

### worker
```javascript
"use strict";
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