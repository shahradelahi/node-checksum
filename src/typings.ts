import type { Readable } from 'node:stream';

export type HashAlgorithm =
  | 'sha1'
  | 'sha256'
  | 'sha512'
  | 'shake128'
  | 'shake256'
  | 'md5'
  | 'base64'
  | 'base64url'
  | 'hex'
  | 'crc32';

export type BufferLike = ArrayBuffer | Buffer | string;

export type ReadableLike = NodeJS.ReadableStream | Readable;

export interface HashedFile {
  filename: string;
  hash: string;
}

export interface VerifyResult {
  files: {
    filename: string;
    result: boolean;
  }[];
  success: boolean;
}

export interface HashFileOptions {
  /** Buffer encoding when reading the file. */
  encoding?: BufferEncoding;
  /** The maximum number of bytes to store in the internal buffer before ceasing to read from the underlying resource. */
  highWaterMark?: number;
}
