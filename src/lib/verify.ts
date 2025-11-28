import { promises, type PathLike } from 'node:fs';
import { resolve } from 'node:path';

import { hashFile } from '@/lib/hash';
import type { HashAlgorithm, VerifyResult } from '@/typings';

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
