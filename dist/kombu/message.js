"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Message {
    // public deliveryInfo: object;
    // public deliveryTag: string;
    constructor(body, contentType, contentEncoding, properties, headers) {
        this.body = body;
        this.contentType = contentType;
        this.contentEncoding = contentEncoding;
        this.properties = properties;
        this.headers = headers;
    }
    decode() {
        if (!this._decode) {
            // now only support application/json, utf-8
            this._decode = JSON.parse(this.body.toString("utf-8"));
        }
        return this._decode;
    }
}
exports.Message = Message;
