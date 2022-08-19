export {}
// This is required to build @aws-sdk/client-sqs with this old version of typescript
declare global {
  type ReadableStream = unknown
}
