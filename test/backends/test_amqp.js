
import { assert } from 'chai';
import uuid from 'uuid';
import AMQPBackend from '../../src/backends/amqp';

const amqpOpts = {
  url: 'amqp://localhost',
};


describe('amqp backend', () => {
  describe('stroeResult', () => {
    it('just store', (done) => {
      const taskId = uuid.v4();
      const backend = new AMQPBackend(amqpOpts);

      backend.storeResult(taskId, 3, 'SUCCESS')
        .then((result) => {
          assert.equal(result, true);
          backend.disconnect()
            .then(() => done());
        });
    });
  });

  describe('getTaskMeta', () => {
    it('getTaskMeta with store', (done) => {
      const taskId = uuid.v4();
      const backend = new AMQPBackend(amqpOpts);

      backend.storeResult(taskId, 3, 'SUCCESS')
        .then(() => {
          backend.getTaskMeta(taskId)
            .then((data) => {
              assert.equal(data.result, 3);
              backend.disconnect()
                .then(() => done());
            });
        });
    });
  });
});
