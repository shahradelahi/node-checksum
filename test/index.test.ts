import { hashGlob, verifyBatch } from '@/lib';
import { expect } from 'chai';
import { promises } from 'node:fs';

it('should hash project file with glob', async () => {
  const results = await hashGlob('md5', '**/*.ts');

  expect(results.length).to.be.greaterThan(0);

  // Expect cli.ts and lib.ts to be included
  expect(results.some(({ filename }) => filename.endsWith('src/cli.ts'))).to.be.true;
  expect(results.some(({ filename }) => filename.endsWith('src/lib.ts'))).to.be.true;
});

describe('Verify', () => {
  it('should hashes from batch file', async () => {
    const checksumPath = 'checksum.txt';

    // Create checksum file
    const results = await hashGlob('md5', '**/*.ts', { exclude: ['**/node_modules/**'] });
    await promises.writeFile(
      checksumPath,
      results.map((v) => `${v.hash} ${v.filename}`).join('\n')
    );

    // Verify checksum
    const verified = await verifyBatch(
      'md5',
      results.map((v) => v.filename),
      checksumPath
    );

    expect(verified.success).to.be.true;

    // Cleanup
    await promises.unlink(checksumPath);
  });
});
