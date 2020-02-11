declare module 'streamsaver' {
import { WritableStream } from 'web-streams-polyfill/ponyfill';

    export function createWriteStream(
    filename: string,
    options?: {
      size?: number;
      pathname?: string;
      readableStrategy?: QueuingStrategy;
      writableStrategy?: QueuingStrategy;
    }
  ): WritableStream;
}
