import { assert } from 'chai';
import celery from '../..';

describe('node celery worker with redis broker', () => {
  const celeryOpts = {
    CELERY_BROKER: 'redis://localhost:6379/3',
    CELERY_BACKEND: 'redis://localhost:6379/3',
  };

  describe('worker running', () => {
    it('tasks.add', (done) => {
      const worker = celery.createWorker(celeryOpts);
      worker.register('tasks.add', (a, b) => a + b);
      worker.start();

      const client = celery.createClient(celeryOpts);
      const result = client.delay('tasks.add', [1, 2]);

      setTimeout(() => {
        result.get()
          .then((data) => {
            assert.equal(data.result, 3);

            Promise.all([
              worker.disconnect(),
              client.disconnect(),
            ]).then(() => done());
          });
      }, 1000);
    });

    it('tasks.add_kwargs', (done) => {
      const worker = celery.createWorker(celeryOpts);
      worker.register('tasks.add_kwargs', ({ a, b }) => a + b);
      worker.start();

      const client = celery.createClient(celeryOpts);
      const result = client.delay('tasks.add_kwargs', [], { a: 1, b: 2 });

      setTimeout(() => {
        result.get()
          .then((data) => {
            assert.equal(data.result, 3);

            Promise.all([
              worker.disconnect(),
              client.disconnect(),
            ]).then(() => done());
          });
      }, 1000);
    });


    it('tasks.add_mixed', (done) => {
      const worker = celery.createWorker(celeryOpts);
      worker.register('tasks.add_mixed', (a, b, { c, d }) => a + b + c + d);
      worker.start();

      const client = celery.createClient(celeryOpts);
      const result = client.delay('tasks.add_mixed', [3, 4], { c: 1, d: 2 });

      setTimeout(() => {
        result.get()
          .then((data) => {
            assert.equal(data.result, 3);

            Promise.all([
              worker.disconnect(),
              client.disconnect(),
            ]).then(() => done());
          });
      }, 1000);
    });
  });
});

describe('node celery worker with amqp broker', () => {
  const celeryOpts = {
    CELERY_BROKER: 'amqp://',
    CELERY_BACKEND: 'amqp://',
  };

  describe('worker running with amqp broker', () => {
    it('tasks.add amqp', (done) => {
      const worker = celery.createWorker(celeryOpts);
      worker.register('tasks.add', (a, b) => a + b);
      worker.start();

      const client = celery.createClient(celeryOpts);
      const result = client.delay('tasks.add', [1, 2]);

      setTimeout(() => {
        result.get()
          .then((data) => {
            assert.equal(data.result, 3);

            Promise.all([
              worker.disconnect(),
              client.disconnect(),
            ]).then(() => done());
          });
      }, 1000);
    });

    it('tasks.add_kwargs amqp', (done) => {
      const worker = celery.createWorker(celeryOpts);
      worker.register('tasks.add_kwargs', ({ a, b }) => a + b);
      worker.start();

      const client = celery.createClient(celeryOpts);
      const result = client.delay('tasks.add_kwargs', [], { a: 1, b: 2 });

      setTimeout(() => {
        result.get()
          .then((data) => {
            assert.equal(data.result, 3);

            Promise.all([
              worker.disconnect(),
              client.disconnect(),
            ]).then(() => done());
          });
      }, 1000);
    });


    it('tasks.add_mixed amqp', (done) => {
      const worker = celery.createWorker(celeryOpts);
      worker.register('tasks.add_mixed', (a, b, { c, d }) => a + b + c + d);
      worker.start();

      const client = celery.createClient(celeryOpts);
      const result = client.delay('tasks.add_mixed', [3, 4], { c: 1, d: 2 });

      setTimeout(() => {
        result.get()
          .then((data) => {
            assert.equal(data.result, 10);

            Promise.all([
              worker.disconnect(),
              client.disconnect(),
            ]).then(() => done());
          });
      }, 1000);
    });
  });
});
