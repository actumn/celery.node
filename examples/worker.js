'use strict'
const celery = require('..');

const worker = celery.createWorker({
  CELERY_BROKER: 'amqp://',
  CELERY_BACKEND: 'amqp://'
});
worker.register('tasks.add', (a, b) => a + b);
worker.start();
