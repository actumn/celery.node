export interface CeleryBackend {
    isReady: () => Promise<any>;
    disconnect: () => Promise<any>;
    storeResult: (taskId: string, result: any, state: string) => Promise<any>;
    getTaskMeta: (taskId: string) => Promise<object>;
}
/**
 *
 * @param {string} CELERY_BACKEND
 * @param {object} CELERY_BACKEND_OPTIONS
 * @returns {CeleryBackend}
 */
export declare function newCeleryBackend(CELERY_BACKEND: string, CELERY_BACKEND_OPTIONS: object): CeleryBackend;
