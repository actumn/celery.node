'use strict';
const CeleryClient = require('./dist/app/client').default;
const CeleryWorker = require('./dist/app/worker').default;

/**
 * @description Basic function for creating celery client
 * 
 * @function
 * @param {object} conf configuration object for options of celery client
 * @returns {CeleryClient}
 */
exports.createClient = function(conf) {
  return new CeleryClient(conf);
}


/**
 * @description Basic function for creating celery worker
 * 
 * @function
 * @param {object} conf configuration object for options of celery worker
 * @returns {CeleryWorker}
 */
exports.createWorker = function(conf) {
  return new CeleryWorker(conf);
}
