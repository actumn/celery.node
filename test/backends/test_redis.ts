import { assert } from "chai";
import { v4 } from "uuid";
import RedisBackend from "../../src/backends/redis";

const redisUrl = "redis://";

describe("redis backend", () => {
  describe("storeResult", () => {
    it("just store", done => {
      const taskId = v4();
      const backend = new RedisBackend(redisUrl, {});

      backend.storeResult(taskId, 3, "SUCCESS").then(result => {
        assert.deepEqual(result, [ "OK", 0 ]);
        backend.disconnect().then(() => done());
      });
    });
  });

  describe("getTaskMeta", () => {
    it("getTaskMeta with store", done => {
      const taskId = v4();
      const backend = new RedisBackend(redisUrl, {});

      backend.storeResult(taskId, 3, "SUCCESS").then(result => {
        backend.getTaskMeta(taskId).then(data => {
          assert.equal(data["result"], 3);
          backend.disconnect().then(() => done());
        });
      });
    });
  });
});
