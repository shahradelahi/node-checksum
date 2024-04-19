import type { BufferLike, HashAlgorithm, HashedFile } from '@/typings';
import { toBuffer } from '@/utils/buffer';
import { fsAccess, readDirectory } from '@/utils/fs-extra';
import crc32 from 'crc-32';

import { type BinaryToTextEncoding, createHash } from 'node:crypto';
import { promises } from 'node:fs';
import { resolve } from 'node:path';

export function hash<Algorithm extends string = HashAlgorithm>(
  algorithm: Algorithm,
  data: BufferLike,
  encoding: BinaryToTextEncoding = 'hex',
): string {
  const buffer = toBuffer(data);

  if (Buffer.isEncoding(algorithm)) {
    return buffer.toString(algorithm);
  }

  if (algorithm === 'crc32') {
    return crc32.buf(buffer).toString(16);
  }

  const hash = createHash(algorithm);
  hash.update(buffer);
  return hash.digest(encoding);
}

// --------------

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

export async function hashDirectory<Algorithm extends string = HashAlgorithm>(
  algorithm: Algorithm,
  directory: string,
  options: {
    recursive: boolean;
    exclude?: string[];
  } = { recursive: false },
): Promise<HashedFile[]> {
  const { exclude = [] } = options;

  const { default: fg } = await import('fast-glob');
  const excluded = await fg.glob(exclude, { onlyFiles: false });

  function isExcluded(filePath: string) {
    return excluded.some((path) => path === filePath);
  }

  const files = (await readDirectory(directory, options.recursive || false))
    // Files only
    .filter((adf) => !adf.directory && !adf.symlink)
    // Filter out excluded files
    .filter(({ path }) => !isExcluded(path));

  const results: HashedFile[] = [];

  for (const { path } of files) {
    const hashed = await hashFile(algorithm, path);
    results.push({
      filename: resolve(directory, path),
      hash: hashed,
    });
  }

  return results;
}

// --------------

export function sha256(data: BufferLike): string {
  return hash('sha256', data);
}

export function md5(data: BufferLike): string {
  return hash('md5', data);
}

export async function sha256File(filePath: string): Promise<string> {
  return hashFile('sha256', filePath);
}

export async function md5File(filePath: string): Promise<string> {
  return hashFile('md5', filePath);
}

// --------------

export type * from './typings';
