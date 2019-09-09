/// <reference types="streamsaver" />

declare module 'streamsaver' {
  import { WritableStream } from 'web-streams-polyfill/ponyfill';

  export function createWriteStream(filename: string, options: QueuingStrategy, size?: number): WritableStream;
}
