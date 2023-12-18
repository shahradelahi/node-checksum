import { fsAccess } from '@/utils/fs-extra';
import { createHash } from 'node:crypto';
import { promises } from 'node:fs';

export type HashAlgorithm = 'sha1' | 'sha256' | 'sha512' | 'md5';

export function hash<Algorithm extends string = HashAlgorithm>(
  algorithm: Algorithm,
  data: Buffer | string,
): string {
  const hash = createHash(algorithm);
  hash.update(data);
  return hash.digest('hex');
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
