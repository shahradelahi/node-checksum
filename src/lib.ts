import { fsAccess } from '@/utils/fs-extra';
import { BinaryToTextEncoding } from 'crypto';
import { createHash } from 'node:crypto';
import { promises } from 'node:fs';
import crc32 from 'crc-32';

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

export function hash<Algorithm extends string = HashAlgorithm>(
  algorithm: Algorithm,
  data: BufferLike,
  encoding: BinaryToTextEncoding = 'hex',
): string {
  const buffer = toBuffer(data);

  if (Buffer.isEncoding(algorithm)) {
    return buffer.toString(algorithm as BufferEncoding);
  }

  if (algorithm === 'crc32') {
    return crc32.buf(buffer).toString(16);
  }

  const hash = createHash(algorithm);
  hash.update(buffer);
  return hash.digest(encoding);
}

function toBuffer(data: BufferLike): Buffer {
  if (Buffer.isBuffer(data)) {
    return data;
  }

  if (data instanceof ArrayBuffer) {
    return Buffer.from(data);
  }

  return typeof data === 'string' ? Buffer.from(data, 'utf8') : Buffer.alloc(0);
}

export function sha256(data: Buffer | string): string {
  return hash('sha256', data);
}

export function md5(data: Buffer | string): string {
  return hash('md5', data);
}

export async function hashFile<Algorithm extends string = HashAlgorithm>(
  algorithm: Algorithm,
  filePath: string,
): Promise<string> {
  if (!(await fsAccess(filePath))) {
    throw new Error('file does not exist');
  }

  const stat = await promises.stat(filePath);
  if (stat.isDirectory()) {
    throw new Error('cannot hash directory');
  }

  const content = await promises.readFile(filePath);
  return hash(algorithm, content);
}

export async function sha256File(filePath: string): Promise<string> {
  return hashFile('sha256', filePath);
}

export async function md5File(filePath: string): Promise<string> {
  return hashFile('md5', filePath);
}
