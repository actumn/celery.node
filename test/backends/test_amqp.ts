import { assert } from "chai";
import { v4 } from "uuid";
import AMQPBackend from "../../src/backends/amqp";

const amqpUrl = "amqp://";

describe("amqp backend", () => {
  describe("storeResult", () => {
    it("just store", done => {
      const taskId = v4();
      const backend = new AMQPBackend(amqpUrl, {});

      backend.storeResult(taskId, 3, "SUCCESS").then(result => {
        assert.equal(result, true);
        backend.disconnect().then(() => done());
      });
    });
  });

  describe("getTaskMeta", () => {
    it("getTaskMeta with store", done => {
      const taskId = v4();
      const backend = new AMQPBackend(amqpUrl, {});

      backend.storeResult(taskId, 3, "SUCCESS").then(() => {
        backend.getTaskMeta(taskId).then(data => {
          assert.equal(data["result"], 3);
          backend.disconnect().then(() => done());
        });
      });
    });
  });
});
