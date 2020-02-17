import { assert } from 'chai';
import Client, { createTaskMessage } from '../../src/app/client';
import { CeleryConf } from '../../src/app/conf';

describe('celery functional tests', () => {
  describe('initialization', () => {
    it('should create a valid redis client without error', (done) => {
      const client = new Client({
        CELERY_BROKER: 'redis://localhost:6379/0',
        CELERY_BACKEND: 'redis://localhost:6379/1',
      } as CeleryConf);

      client.isReady()
        .then(() => client.disconnect())
        .then(() => done());
    });
  });

  describe('Basic task calls', () => {
    it('should call a task without error', (done) => {
      const client = new Client({
        CELERY_BROKER: 'redis://localhost:6379/0',
        CELERY_BACKEND: 'redis://localhost:6379/1',
      } as CeleryConf);

      client.createTask('tasks.add').delay([1, 2]);

      setTimeout(() => {
        client.disconnect()
          .then(() => done());
      }, 100);
    });
  });

  describe('result handling with redis backend', () => {
    it('should return a task result (poll)', (done) => {
      const client = new Client({
        CELERY_BROKER: 'redis://localhost:6379/0',
        CELERY_BACKEND: 'redis://localhost:6379/1',
      } as CeleryConf);

      const result = client.createTask('tasks.add').delay([1, 2]);
      setTimeout(() => {
        result.get()
          .then((message) => {
            assert.equal(message.result, 3);
            client.disconnect()
              .then(() => done());
          });
      }, 1000);
    });
  });

  describe('createTaskMessage', () => {
    it('should create a message with default args', () => {
      assert.deepEqual(JSON.parse(createTaskMessage('id', 'foo')), {
        task: 'foo',
        args: [],
        kwargs: {},
        id: 'id',
      });
    });

    it('should create a message with the given args', () => {
      assert.deepEqual(JSON.parse(createTaskMessage('id', 'foo', [1, 2])), {
        task: 'foo',
        args: [1, 2],
        kwargs: {},
        id: 'id',
      });

      assert.deepEqual(JSON.parse(createTaskMessage('id', 'foo', null, {
        bar: 3,
      })), {
        task: 'foo',
        args: [],
        kwargs: {
          bar: 3,
        },
        id: 'id',
      });

      assert.deepEqual(JSON.parse(createTaskMessage('bar', 'foo', null, null)), {
        task: 'foo',
        args: [],
        kwargs: {},
        id: 'bar',
      });
    });
  });
});
