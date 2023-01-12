import { assert } from "chai";
import * as Redis from "ioredis";
import * as sinon from "sinon";
import Client from "../../src/app/client";
import Worker from "../../src/app/worker";
import { AsyncResult } from "../../src/app/result";
import { CeleryConf } from "../../src/app/conf";

describe("celery functional tests", () => {
  const client = new Client(
    "redis://localhost:6379/0",
    "redis://localhost:6379/0"
  );
  const worker = new Worker(
    "redis://localhost:6379/0",
    "redis://localhost:6379/0"
  );

  const worker2 = new Worker(
    "redis://localhost:6379/0",
    "redis://localhost:6379/0",
    "my_queue"
  );

  before(() => {
    worker.register("tasks.add", (a, b) => a + b);
    worker.register(
      "tasks.delayed",
      (result, delay) =>
        new Promise(resolve => {
          setTimeout(() => resolve(result), delay);
        })
    );

    worker2.register("tasks.multiply", (a, b) => a * b);
    Promise.all([worker.start(), worker2.start()]);
  });

  afterEach(() => {
    sinon.restore();
    return Promise.all([
      worker.whenCurrentJobsFinished(),
      worker2.whenCurrentJobsFinished()
    ]);
  });

  after(() => {
    Promise.all([client.disconnect(), worker.disconnect(), worker2.disconnect()]);

    const redis = new Redis();
    redis.flushdb().then(() => redis.quit());
  });

  describe("initialization", () => {
    it("should create a valid redis client without error", done => {
      client.isReady().then(() => done());
    });
  });

  describe("Basic task calls", () => {
    it("should call a task without error", done => {
      client.createTask("tasks.add").delay([1, 2]);
      done();
    });
  });

  describe("result handling with redis backend", () => {
    it("should return a task result", done => {
      const result = client.createTask("tasks.add").applyAsync([1, 2]);

      assert.instanceOf(result, AsyncResult);

      result.get().then(() => done());
    });

    it("should resolve with the message", done => {
      const result = client.createTask("tasks.add").applyAsync([1, 2]);

      assert.instanceOf(result, AsyncResult);

      result.get().then(message => {
        assert.equal(message, 3);
        done();
      });
    });

    describe("when the the result has previously resolved", () => {
      it("should immediately resolve when the task was previously resolved", done => {
        const getTaskMetaSpy = sinon.spy(client.backend, 'getTaskMeta');

        const result = client.createTask("tasks.add").applyAsync([1, 2]);

        result
          .get()
          .then(() => {
            // await the result a second time
            return result.get();
          })
          .then(() => {
            // the backend should not have been invoked more than once
            assert.strictEqual(getTaskMetaSpy.callCount, 1);
          })
          .then(done)
          .catch(done);
      });
    });
  });

  describe("timeout handing with the redis backend", () => {
    it("should reject with a TIMEOUT error", done => {
      const result = client
        .createTask("tasks.delayed")
        .applyAsync(["foo", 1000]);

      result
        .get(500)
        .then(() => {
          assert.fail("should not get here");
        })
        .catch(error => {
          assert.strictEqual(error.message, "TIMEOUT");
          done();
        })
    });
  });

  describe("custom routing key", () => {
    it("should create a task with another routing key", done => {
      const task = client.createTask("tasks.multiply", { routingKey: "my_queue" });
      const result = task.applyAsync([2, 3]);
      result.get(500).then((message) => {
        assert.equal(message, 6);
      })
      done();
    });

    it('should send_task with another routing key', done => {
      const task = client.createTask("tasks.multiply");
      const result = task.applyAsync([2, 3], undefined, { routingKey: "my_queue" });
      result.get(500).then((message) => {
        assert.equal(message, 6);
      })
      done();
    })
  })
});
