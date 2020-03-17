import { assert } from "chai";
import * as Redis from "ioredis";
import Client from "../../src/app/client";
import Worker from "../../src/app/worker";
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

  before(() => {
    worker.register("tasks.add", (a, b) => a + b);
    worker.start();
  });

  after(() => {
    Promise.all([client.disconnect(), worker.disconnect()]);

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

      result.get().then(message => {
        assert.equal(message, 3);
        done();
      });
    });
  });
});
