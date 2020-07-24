"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Message = /** @class */ (function () {
    // public deliveryInfo: object;
    // public deliveryTag: string;
    function Message(body, contentType, contentEncoding, properties, headers) {
        this.body = body;
        this.contentType = contentType;
        this.contentEncoding = contentEncoding;
        this.properties = properties;
        this.headers = headers;
    }
    Message.prototype.decode = function () {
        if (!this._decode) {
            // now only support application/json, utf-8
            this._decode = JSON.parse(this.body.toString("utf-8"));
        }
        return this._decode;
    };
    return Message;
}());
exports.Message = Message;
