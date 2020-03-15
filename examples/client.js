'use strict'
const celery = require('../dist');

const client = celery.createClient({
  CELERY_BROKER: 'amqp://',
  CELERY_BACKEND: 'amqp://'
});
for (let i = 0; i < 1000; i++) {
  client.delay('tasks.add', [1, 2]);
}
