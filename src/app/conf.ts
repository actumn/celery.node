export interface CeleryConf {
  CELERY_BROKER: string;
  CELERY_BROKER_OPTIONS: object;
  CELERY_BACKEND: string;
  CELERY_BACKEND_OPTIONS: object;
}

export const DEFAULT_CELERY_CONF: CeleryConf = {
  CELERY_BROKER: "amqp://",
  CELERY_BROKER_OPTIONS: {},
  CELERY_BACKEND: "amqp://",
  CELERY_BACKEND_OPTIONS: {}
};
