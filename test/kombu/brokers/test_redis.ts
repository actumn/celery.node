// import Redis from "ioredis";
// import { assert } from "chai";
// import RedisBroker from "../../../src/kombu/brokers/redis";

// const redisUrl = "redis://localhost:6379/0";

// describe("redis broker", () => {
//   let client: Redis.Redis;

//   beforeEach(() => {
//     client = new Redis();
//     client.flushdb();
//   });

//   afterEach(() => {
//     client.quit();
//   });

//   describe("publish", () => {
//     it("just publish", done => {
//       const broker = new RedisBroker(redisUrl, {});

//       broker.publish("publish", '{ "a": 1 }').then(reply => {
//         assert.isNumber(reply);
//         broker.disconnect().then(() => done());
//       });
//     });
//   });

//   describe("subscribe", () => {
//     it("with publish", done => {
//       const broker = new RedisBroker(redisUrl, {});

//       broker.publish("subscribe", '{ "a": 1 }').then(reply => {
//         broker.subscribe("subscribe", body => {
//           assert.deepEqual(body, { a: 1 });
//           broker.disconnect().then(() => done());
//         });
//       });
//     });
//   });
// });
