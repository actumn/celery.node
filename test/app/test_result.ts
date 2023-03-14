import { assert } from "chai";
import { AsyncResult } from "../../src/app/result";
import RedisBackend from "../../src/backends/redis";
import * as sinon from "sinon";
import Redis from "ioredis";

describe("AsyncResult", () => {
  const redisBackend = new RedisBackend("redis://localhost:6379/0", {});

  let testName: string;
  beforeEach(function () {
    testName = this.currentTest.title;
  });
  
  afterEach(() => {
    sinon.restore();
  })

  after(() => {
    redisBackend.disconnect();
    const redis = new Redis();
    redis.flushdb().then(() => redis.quit());
  });

  describe("get", () => {
    it("should return result when data stored in backend", done => {
      // Arrange
      const testResult = "100";
      const testStatus = "SUCCESS";
      const asyncResult = new AsyncResult(testName, redisBackend);
      redisBackend.storeResult(testName, testResult, testStatus)
        .then(() => {
          // Action
          asyncResult.get()
            .then((result) => {

              // Assert
              assert.strictEqual(result, testResult);
              done();
            })
            .catch(error => {
              assert.fail(error.message);
            });
        });
    });

    it("should immediately resolve when the task was previously resolved", done => {
      // Arrange
      const testResult = "100";
      const testStatus = "SUCCESS";
      const asyncResult = new AsyncResult(testName, redisBackend);
      const getTaskMetaSpy = sinon.spy(redisBackend, "getTaskMeta");
      redisBackend.storeResult(testName, testResult, testStatus)
        .then(() => {
          // Action
          asyncResult.get()
            .then(() => {
              return asyncResult.get();
            })
            .catch(error => {
              assert.fail(error.message);
            })
            .then((result) => {
              // Assert
              assert.strictEqual(getTaskMetaSpy.callCount, 1);
              assert.strictEqual(result, testResult);
              done();
            })
            .catch(error => {
              assert.fail(error.message);
            });
        });
    });

    it("should throw when status is failure", done => {
      // Arrange
      const testResult = "100";
      const testStatus = "FAILURE";
      const result = new AsyncResult(testName, redisBackend);
      redisBackend.storeResult(testName, testResult, testStatus)
        .then(() => {

          // Action
          result.get()
            .then((result) => {
              assert.fail("should not get here");
            })
            .catch(error => {
              // Assert
              assert.strictEqual(error.message, "FAILURE");
              done();
            });
        });
    });

    it("should throw timeout when result is not in backend", done => {
      // Arrange
      const result = new AsyncResult(testName, redisBackend);
      
      // Action
      result
        .get(500)
        .then(() => {
          assert.fail("should not get here");
        })
        .catch(error => {
          // Assert
          assert.strictEqual(error.message, "TIMEOUT");
          done();
        });
    });
  });

  describe("result", () => {
    it("should return result when data stored in backend", async () => {
      // Arrange
      const testResult = null;
      const testStatus = "FAILURE";
      const asyncResult = new AsyncResult(testName, redisBackend);
      await redisBackend.storeResult(testName, testResult, testStatus);
      
      // Action
      const result = await asyncResult.result();

      // Assert (If task is FAILURE, the result should be NULL and the TRACEBACK should have the error message.)
      assert.strictEqual(result, testResult);
    });

    it("should return null when result is not in backend", async () => {
      // Arrange
      const asyncResult = new AsyncResult(testName, redisBackend);

      // Action
      const result = await asyncResult.result();

      // Assert
      assert.strictEqual(result, null);
    });
  });

  describe("status", () => {
    it("should return status when data stored in backend", async () => {
      // Arrange
      const testResult = "100";
      const testStatus = "FAILURE";
      const asyncResult = new AsyncResult(testName, redisBackend);
      await redisBackend.storeResult(testName, testResult, testStatus);

      // Action
      const status = await asyncResult.status();

      // Assert
      assert.strictEqual(status, testStatus);
    });

    it("should return when result is not in backend", async () => {
      // Arrange
      const asyncResult = new AsyncResult(testName, redisBackend);

      // Action
      const status = await asyncResult.status();

      // Assert
      assert.strictEqual(status, null);
    });
  });

  describe("mixed with get and status", () => {
    it("should resolve immediately when the task is previously resolved", done => {

      // Arrange
      const testResult = "100";
      const testStatus = "SUCCESS";
      const asyncResult = new AsyncResult(testName, redisBackend);
      const getTaskMetaSpy = sinon.spy(redisBackend, "getTaskMeta");
      redisBackend.storeResult(testName, testResult, testStatus)
        .then(() => {

          // Action
          asyncResult.get()
            .then(() => {
              // await the result a second time
              return Promise.all([asyncResult.result(), asyncResult.status()]);
            })
            .catch(error => {
              assert.fail(error.message);
            })
            .then((result) => {

              // Assert
              // the backend should not have been invoked more than once
              assert.strictEqual(getTaskMetaSpy.callCount, 1);
              assert.strictEqual(result[0], testResult);
              assert.strictEqual(result[1], testStatus);
              done();
            })
            .catch(error => {
              assert.fail(error.message);
            });
        });
    });
  });
});