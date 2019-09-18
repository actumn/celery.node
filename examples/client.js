'use strict'
const celery = require('..');

const client = celery.createClient({
  CELERY_BROKER: 'amqp://',
  CELERY_BACKEND: 'amqp://'
});
const result = client.delay('tasks.add', [1, 2]);
setTimeout(() => {
  result.get()
    .then(data => {
      console.log(data);
    });
}, 1000);
