import { createHash, type BinaryToTextEncoding } from 'node:crypto';
import { createReadStream, promises, type PathLike } from 'node:fs';
import { resolve } from 'node:path';
import { crc32, crc32c } from '@se-oss/crc32';
import fg from 'fast-glob';

import type {
  BufferLike,
  HashAlgorithm,
  HashDirectoryOptions,
  HashedFile,
  HashFileOptions,
  HashGlobOptions,
  ReadableLike,
} from '@/typings';
import { toBuffer } from '@/utils/buffer';
import { fsAccess, readDirectory } from '@/utils/fs-extra';
import { resolveGlob } from '@/utils/glob';

/**
 * Hashes data using a specified algorithm.
 *
 * @param algorithm The algorithm to use for hashing.
 * @param data The data to hash.
 * @param encoding The encoding to use for the output.
 * @returns The hashed data as a string.
 * @example
 * ```ts
 * import { hash } from '@litehex/node-checksum';
 *
 * const hashed = hash('sha256', 'hello world');
 * console.log(hashed); // b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9
 * ```
 */
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
    return crc32(buffer).toString(16);
  }

  if (algorithm === 'crc32c') {
    return crc32c(buffer).toString(16);
  }

  const hash = createHash(algorithm);
  hash.update(buffer);
  return hash.digest(encoding);
}

/**
 * Hashes the data from a readable stream.
 *
 * @param algorithm The hash algorithm to use.
 * @param stream The readable stream to hash.
 * @param encoding The encoding for the resulting hash.
 * @returns A promise that resolves with the hash.
 * @example
 * ```ts
 * import { createReadStream } from 'node:fs';
 * import { hashStream } from '@litehex/node-checksum';
 *
 * const stream = createReadStream('package.json');
 * const hash = await hashStream('sha256', stream);
 * console.log(hash);
 * ```
 */
export async function hashStream<Algorithm extends string = HashAlgorithm>(
  algorithm: Algorithm,
  stream: ReadableLike,
  encoding: BinaryToTextEncoding = 'hex'
): Promise<string> {
  const hash = createHash(algorithm);

  for await (const chunk of stream) {
    hash.update(chunk);
  }

  return hash.digest(encoding);
}

// --------------

/**
 * Hashes a file using the specified algorithm.
 *
 * @param algorithm The hash algorithm to use.
 * @param filePath The path to the file to hash.
 * @param encoding The encoding for the resulting hash.
 * @param options Additional options for hashing the file.
 * @returns A promise that resolves with the hash of the file.
 * @throws If the file does not exist or is a directory.
 * @example
 * ```ts
 * import { hashFile } from '@litehex/node-checksum';
 *
 * const hash = await hashFile('sha256', 'package.json');
 * console.log(hash);
 * ```
 */
export async function hashFile<Algorithm extends string = HashAlgorithm>(
  algorithm: Algorithm,
  filePath: PathLike,
  encoding: BinaryToTextEncoding = 'hex',
  options: HashFileOptions = {}
): Promise<string> {
  if (!(await fsAccess(filePath))) {
    throw new Error('file does not exist');
  }

  const stat = await promises.stat(filePath);
  if (stat.isDirectory()) {
    throw new Error('cannot hash directory');
  }

  const stream = createReadStream(filePath, {
    flags: 'r',
    highWaterMark: options.highWaterMark,
    encoding: options.encoding,
    autoClose: true,
  });

  return hashStream(algorithm, stream, encoding);
}

/**
 * Hashes a directory and its contents.
 *
 * @param algorithm The hashing algorithm to use.
 * @param directory The path to the directory.
 * @param options Hashing options.
 * @returns A promise that resolves to an array of hashed files.
 * @example
 * ```ts
 * import { hashDirectory } from '@litehex/node-checksum';
 *
 * const hashedFiles = await hashDirectory('sha256', 'src', { recursive: true });
 * console.log(hashedFiles);
 * ```
 */
export async function hashDirectory<Algorithm extends string = HashAlgorithm>(
  algorithm: Algorithm,
  directory: string,
  options: HashDirectoryOptions = { recursive: false }
): Promise<HashedFile[]> {
  const { exclude = [], recursive = false } = options;

  const excluded = await fg.glob(exclude, { onlyFiles: false });

  const files = (await readDirectory(directory, recursive))
    // Files only
    .filter((adf) => !adf.directory && !adf.symlink)
    // Filter out excluded files
    .filter((f) => !excluded.some((path) => path === f.path));

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

/**
 * Hashes files matching a glob pattern.
 *
 * @param algorithm The hashing algorithm to use.
 * @param glob The glob pattern to match files.
 * @param options Hashing options.
 * @returns A promise that resolves to an array of hashed files.
 * @example
 * ```ts
 * import { hashGlob } from '@litehex/node-checksum';
 *
 * const hashedFiles = await hashGlob('sha256', 'src/**\/*.ts');
 * console.log(hashedFiles);
 * ```
 */
export async function hashGlob<Algorithm extends string = HashAlgorithm>(
  algorithm: Algorithm,
  glob: string,
  options: HashGlobOptions = {}
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

/**
 * Hashes the given data using the SHA256 algorithm.
 *
 * @param data The data to hash.
 * @returns The hashed data as a string.
 */
export function sha256(data: BufferLike): string {
  return hash('sha256', data);
}

/**
 * Hashes the given data using the MD5 algorithm.
 *
 * @param data The data to hash.
 * @returns The hashed data as a string.
 */
export function md5(data: BufferLike): string {
  return hash('md5', data);
}

/**
 * Hashes a file using the SHA256 algorithm.
 *
 * @param filePath The path to the file to hash.
 * @returns A promise that resolves with the hash of the file.
 */
export async function sha256File(filePath: string): Promise<string> {
  return hashFile('sha256', filePath);
}

/**
 * Hashes a file using the MD5 algorithm.
 *
 * @param filePath The path to the file to hash.
 * @returns A promise that resolves with the hash of the file.
 */
export async function md5File(filePath: string): Promise<string> {
  return hashFile('md5', filePath);
}
