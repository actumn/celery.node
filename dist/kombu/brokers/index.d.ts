export interface CeleryBroker {
    isReady: () => Promise<any>;
    disconnect: () => Promise<any>;
    publish: (body: object | [Array<any>, object, object], exchange: string, routingKey: string, headers: object, properties: object) => Promise<any>;
    subscribe: (queue: string, callback: Function) => Promise<any>;
}
/**
 *
 * @param {String} CELERY_BROKER
 * @param {object} CELERY_BROKER_OPTIONS
 * @param {string} CELERY_QUEUE
 * @returns {CeleryBroker}
 */
export declare function newCeleryBroker(CELERY_BROKER: string, CELERY_BROKER_OPTIONS: any, CELERY_QUEUE?: string): CeleryBroker;
