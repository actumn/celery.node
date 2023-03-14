import { assert } from "chai";
import Redis from "ioredis";
import Client from "../../src/app/client";
import Worker from "../../src/app/worker";
import { CeleryConf } from "../../src/app/conf";

describe("node celery worker with redis broker", () => {
  const worker = new Worker(
    "redis://localhost:6379/0",
    "redis://localhost:6379/0"
  );

  before(() => {
    worker.register("tasks.add", (a, b) => a + b);
    worker.register("tasks.add_kwargs", ({ a, b }) => a + b);
    worker.register("tasks.add_mixed", (a, b, { c, d }) => a + b + c + d);
    worker.start();
  });

  afterEach(() => {
    return worker.whenCurrentJobsFinished();
  });

  after(() => {
    worker.disconnect();
    const redis = new Redis();
    redis.flushdb().then(() => redis.quit());
  });

  describe("worker running", () => {
    it("tasks.add", done => {
      const client = new Client(
        "redis://localhost:6379/0",
        "redis://localhost:6379/0"
      );
      const result = client.sendTask("tasks.add", [1, 2]);
      result.get().then(data => {
        assert.equal(data, 3);

        client.disconnect().then(() => {
          done();
        });
      });
    });

    it("tasks.add_kwargs", done => {
      const client = new Client(
        "redis://localhost:6379/0",
        "redis://localhost:6379/0"
      );
      const result = client.sendTask("tasks.add_kwargs", [], { a: 1, b: 2 });

      result.get().then(data => {
        assert.equal(data, 3);

        client.disconnect().then(() => done());
      });
    });

    it("tasks.add_mixed", done => {
      const client = new Client(
        "redis://localhost:6379/0",
        "redis://localhost:6379/0"
      );
      const result = client.sendTask("tasks.add_mixed", [3, 4], { c: 1, d: 2 });

      result.get().then(data => {
        assert.equal(data, 10);

        client.disconnect().then(() => done());
      });
    });
  });
});

describe("node celery worker with amqp broker", () => {
  const worker = new Worker(
    "redis://localhost:6379/0",
    "redis://localhost:6379/0"
  );

  before(() => {
    worker.register("tasks.add", (a, b) => a + b);
    worker.register("tasks.add_kwargs", ({ a, b }) => a + b);
    worker.register("tasks.add_mixed", (a, b, { c, d }) => a + b + c + d);
    worker.start();
  });

  afterEach(() => {
    return worker.whenCurrentJobsFinished();
  });

  after(() => {
    worker.disconnect();
  });

  describe("worker running with amqp broker", () => {
    it("tasks.add amqp", done => {
      const client = new Client(
        "redis://localhost:6379/0",
        "redis://localhost:6379/0"
      );
      const result = client.sendTask("tasks.add", [1, 2]);

      result.get().then(data => {
        assert.equal(data, 3);

        client.disconnect().then(() => done());
      });
    });

    it("tasks.add_kwargs amqp", done => {
      const client = new Client(
        "redis://localhost:6379/0",
        "redis://localhost:6379/0"
      );
      const result = client.sendTask("tasks.add_kwargs", [], { a: 1, b: 2 });

      result.get().then(data => {
        assert.equal(data, 3);

        client.disconnect().then(() => done());
      });
    });

    it("tasks.add_mixed amqp", done => {
      const client = new Client(
        "redis://localhost:6379/0",
        "redis://localhost:6379/0"
      );
      const result = client.sendTask("tasks.add_mixed", [3, 4], { c: 1, d: 2 });

      result.get().then(data => {
        assert.equal(data, 10);

        client.disconnect().then(() => done());
      });
    });
  });
});
