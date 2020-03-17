export class Message {
  private _decode; object;
  // public deliveryInfo: object;
  // public deliveryTag: string;
  constructor (readonly body: Buffer, readonly contentType: string, readonly contentEncoding: string, readonly properties: object, readonly headers: object) { }

  public decode(): object {
    if (!this._decode) {
      // now only support application/json, utf-8
      this._decode = JSON.parse(this.body.toString("utf-8"))
    }
    return this._decode;
  }
}