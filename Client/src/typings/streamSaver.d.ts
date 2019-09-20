/// <reference types="streamsaver" />

declare module 'streamsaver' {
  import { WritableStream } from 'web-streams-polyfill/ponyfill';

  export function createWriteStream(
    filename: string,
    options?: {
      size: number | null;
      pathname: string | null;
      readableStrategy: QueuingStrategy;
      writableStrategy: QueuingStrategy;
    },
    size?: number
  ): WritableStream;
}
