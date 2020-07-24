"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CELERY_CONF = {
    CELERY_BROKER: "amqp://",
    CELERY_BROKER_OPTIONS: {},
    CELERY_BACKEND: "amqp://",
    CELERY_BACKEND_OPTIONS: {},
    CELERY_QUEUE: "celery",
    TASK_PROTOCOL: 2
};
