import { assert } from "chai";
import { parseISO8601 } from "../../src/util/time";

describe("time util test", () => {
  describe("parseISO8601", () => {
    it("asserts below", () => {
      assert.equal(1618622133596, parseISO8601("2021-04-17T01:15:33.596988"));
      assert.equal(1618622133596, parseISO8601("2021-04-17T01:15:33.596Z"));
    });
  });
});