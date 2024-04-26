import type { BufferLike, HashAlgorithm, HashedFile, VerifyResult } from '@/typings';
import { toBuffer } from '@/utils/buffer';
import { fsAccess, readDirectory } from '@/utils/fs-extra';
import { resolveGlob } from '@/utils/glob';
import crc32 from 'crc-32';

import { type BinaryToTextEncoding, createHash } from 'node:crypto';
import { type PathLike, promises } from 'node:fs';
import { resolve } from 'node:path';

export function hash<Algorithm extends string = HashAlgorithm>(
  algorithm: Algorithm,
  data: BufferLike,
  encoding: BinaryToTextEncoding = 'hex'
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
  filePath: PathLike
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
  } = { recursive: false }
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

export async function hashGlob<Algorithm extends string = HashAlgorithm>(
  algorithm: Algorithm,
  glob: string,
  options: {
    exclude?: string[];
    cwd?: string;
  } = {}
): Promise<HashedFile[]> {
  const { exclude = [], cwd = process.cwd() } = options;

  const files = await resolveGlob(glob, { cwd: options.cwd, exclude, onlyFiles: true });

  const results: HashedFile[] = [];

  for (const filePath of files) {
    const hashed = await hashFile(algorithm, filePath);
    results.push({
      filename: resolve(cwd, filePath),
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

export async function verifyFile(
  algorithm: HashAlgorithm,
  filePath: PathLike,
  checksum: string
): Promise<boolean> {
  const hashed = await hashFile(algorithm, filePath);
  return hashed === checksum;
}

export async function verifyBatch(
  algorithm: HashAlgorithm,
  files: PathLike[],
  checksumPath: PathLike
): Promise<VerifyResult> {
  const checksums = await readChecksumList(checksumPath);
  const result: VerifyResult = {
    files: [],
    success: true,
  };

  await Promise.all(
    files.map(async (file) => {
      const filename = resolve(file.toString());
      const success =
        // Check file exists in checksums
        !!checksums[filename] &&
        // Verify hash
        (await verifyFile(algorithm, filename, checksums[filename]));

      if (!success) {
        result.success = false;
      }

      result.files.push({
        filename,
        result: success,
      });
    })
  );

  return result;
}

export async function readChecksumList(checksumPath: PathLike): Promise<Record<string, string>> {
  const checksums = await promises.readFile(checksumPath, 'utf-8');
  const result = {};
  checksums
    .split('\n')
    .map((checksum) => checksum.trim().split(' '))
    .filter((parts) => parts.length === 2)
    .forEach((parts) => Object.assign(result, { [parts[1]]: parts[0] }));
  return result;
}

// --------------

export type * from './typings';
