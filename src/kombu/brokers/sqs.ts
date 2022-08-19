import { CeleryBroker } from ".";
import { Message } from "../message";
import {
  SendMessageCommand,
  SQSClient,
  SQSClientConfig
} from "@aws-sdk/client-sqs";
import { URL } from "url";
import { v4 } from "uuid";

interface SQSBrokerOptions {
  predefinedQueues: {
    [k: string]: string;
  };
}

export default class SQSBroker implements CeleryBroker {
  private client: SQSClient;

  constructor(private url: string, private opts: SQSBrokerOptions) {}

  public async isReady(): Promise<void> {
    this.getClient();
  }

  public async disconnect(): Promise<void> {
    return;
  }

  public async publish(
    body: object | [Array<any>, object, object],
    exchange: string,
    routingKey: string,
    headers: object,
    properties: object
  ): Promise<void> {
    const url = this.opts.predefinedQueues[routingKey];
    if (!url) {
      throw new Error(`Queue url for ${routingKey} not defined`);
    }

    const messageBody = JSON.stringify(body);
    const contentType = "application/json";
    const contentEncoding = "utf-8";
    const message = {
      body: Buffer.from(messageBody).toString("base64"),
      "content-type": contentType,
      "content-encoding": contentEncoding,
      headers,
      properties: {
        body_encoding: "base64",
        delivery_info: {
          exchange: exchange,
          routing_key: routingKey
        },
        delivery_mode: 2,
        delivery_tag: v4(),
        ...properties
      }
    };

    await this.getClient().send(
      new SendMessageCommand({
        QueueUrl: url,
        MessageBody: Buffer.from(JSON.stringify(message)).toString("base64")
      })
    );
  }

  public async subscribe(): Promise<void> {
    throw new Error("SQS subscribe is not implemented");
  }

  private getClient(): SQSClient {
    if (!this.client) {
      const ops: SQSClientConfig = {};
      const url = new URL(this.url);
      if (url.host) {
        ops.endpoint = `http://${url.host}`
      }
      this.client = new SQSClient(ops);
    }
    return this.client;
  }
}
