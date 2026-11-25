import { promises, type PathLike } from 'node:fs';
import { dirname, resolve } from 'node:path';

import { hashFile } from '@/lib/hash';
import type { HashAlgorithm, VerifyResult } from '@/typings';

/**
 * Verifies a file against a checksum.
 *
 * @param algorithm The hashing algorithm to use.
 * @param filePath The path to the file to verify.
 * @param checksum The checksum to verify against.
 * @returns A promise that resolves to `true` if the file is valid, `false` otherwise.
 * @example
 * ```ts
 * import { verifyFile } from '@litehex/node-checksum';
 *
 * const isValid = await verifyFile('sha256', 'package.json', 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9');
 * console.log(isValid);
 * ```
 */
export async function verifyFile(
  algorithm: HashAlgorithm,
  filePath: PathLike,
  checksum: string
): Promise<boolean> {
  const hashed = await hashFile(algorithm, filePath);
  return hashed.toLowerCase() === checksum.toLowerCase();
}

/**
 * Verifies a batch of files against a checksum file.
 *
 * @param algorithm The hashing algorithm to use.
 * @param files The paths to the files to verify.
 * @param checksumPath The path to the checksum file.
 * @returns A promise that resolves to a verification result.
 * @example
 * ```ts
 * import { verifyBatch } from '@litehex/node-checksum';
 *
 * const result = await verifyBatch('sha256', ['package.json'], 'checksum.txt');
 * console.log(result);
 * ```
 */
export async function verifyBatch(
  algorithm: HashAlgorithm,
  files: PathLike[],
  checksumPath: PathLike
): Promise<VerifyResult> {
  const rawChecksums = await readChecksumList(checksumPath);
  const checksumDir = dirname(resolve(checksumPath.toString()));
  const checksums = new Map<string, string>();

  for (const [entryPath, digest] of Object.entries(rawChecksums)) {
    checksums.set(resolve(entryPath), digest);
    checksums.set(resolve(checksumDir, entryPath), digest);
  }

  const result: VerifyResult = {
    files: [],
    success: true,
  };

  await Promise.all(
    files.map(async (file) => {
      const filename = resolve(file.toString());
      const expected = checksums.get(filename);
      const success = expected !== undefined && (await verifyFile(algorithm, filename, expected));
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

/**
 * Reads a checksum file and returns a map of filenames to checksums.
 *
 * @param checksumPath The path to the checksum file.
 * @returns A promise that resolves to a map of filenames to checksums.
 * @example
 * ```ts
 * import { readChecksumList } from '@litehex/node-checksum';
 *
 * const checksums = await readChecksumList('checksum.txt');
 * console.log(checksums);
 * ```
 */
export async function readChecksumList(checksumPath: PathLike): Promise<Record<string, string>> {
  const checksumsContent = await promises.readFile(checksumPath, 'utf-8');
  const result: Record<string, string> = {};

  for (const rawLine of checksumsContent.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }
    const match = /^(\S+)\s+\*?(.+)$/.exec(line);
    if (match && match[1] !== undefined && match[2] !== undefined) {
      result[match[2]] = match[1];
    }
  }

  return result;
}
