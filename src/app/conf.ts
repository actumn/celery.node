export interface CeleryConf {
  CELERY_BROKER: string;
  CELERY_BROKER_OPTIONS: object;
  CELERY_BACKEND: string;
  CELERY_BACKEND_OPTIONS: object;
  CELERY_QUEUE: string;
  CELERY_QUEUE_OPTIONS: object;
  TASK_PROTOCOL: number;
}


const DEFAULT_CELERY_CONF: CeleryConf = {
  CELERY_BROKER: "amqp://",
  CELERY_BROKER_OPTIONS: {},
  CELERY_BACKEND: "amqp://",
  CELERY_BACKEND_OPTIONS: {},
  CELERY_QUEUE: "celery",
  CELERY_QUEUE_OPTIONS: {},
  TASK_PROTOCOL: 2
};


function cloneObject(obj: object): object {
  const clone = {};
  for (const i in obj) {
    if (typeof obj[i] == "object" && obj[i] != null)
      clone[i] = cloneObject(obj[i]);
    else clone[i] = obj[i];
  }
  return clone;
}

export function defaultConf(): CeleryConf {
  return cloneObject(DEFAULT_CELERY_CONF) as CeleryConf;
}
