'use strict';
const CeleryClient = require('./dist/app/client').default;
const CeleryWorker = require('./dist/app/worker').default;

exports.createClient = function(conf) {
  return new CeleryClient(conf);
}
exports.createWorker = function(conf) {
  return new CeleryWorker(conf);
}
