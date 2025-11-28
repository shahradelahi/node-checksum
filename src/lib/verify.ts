import { promises, type PathLike } from 'node:fs';
import { resolve } from 'node:path';

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
  return hashed === checksum;
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
  checksumsContent
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .forEach((line) => {
      const parts = line.split(/\s+/);
      const [hash, filename] = parts;
      if (hash !== undefined && filename !== undefined) {
        result[filename] = hash;
      }
    });
  return result;
}
