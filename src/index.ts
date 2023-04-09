import Client from "./app/client";
import Worker from "./app/worker";

/**
 * @description Basic function for creating celery client
 *
 * @function
 * @returns {Client}
 */
export function createClient(
  broker = "amqp://",
  backend = "amqp://",
  queue = "celery",
  queueOptions = {}
): Client {
  return new Client(broker, backend, queue, queueOptions);
}

/**
 * @description Basic function for creating celery worker
 *
 * @function
 * @returns {Worker}
 */
export function createWorker(
  broker = "amqp://",
  backend = "amqp://",
  queue = "celery",
  queueOptions = {}
): Worker {
  return new Worker(broker, backend, queue, queueOptions);
}
