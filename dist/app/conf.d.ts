export interface CeleryConf {
    CELERY_BROKER: string;
    CELERY_BROKER_OPTIONS: object;
    CELERY_BACKEND: string;
    CELERY_BACKEND_OPTIONS: object;
    CELERY_QUEUE: string;
    TASK_PROTOCOL: number;
}
export declare function defaultConf(): CeleryConf;
