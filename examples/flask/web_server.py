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