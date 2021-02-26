/// <reference types="node" />
export declare class Message {
    readonly body: Buffer;
    readonly contentType: string;
    readonly contentEncoding: string;
    readonly properties: object;
    readonly headers: object;
    private _decode;
    object: any;
    constructor(body: Buffer, contentType: string, contentEncoding: string, properties: object, headers: object);
    decode(): object;
}
