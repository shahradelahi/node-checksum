import { createReadStream, promises } from 'node:fs';
import { Readable } from 'node:stream';
import { expect } from 'chai';

import { hashFile, hashGlob, hashStream, verifyBatch } from '@/lib';

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

describe('Hash', () => {
  describe('Hash Stream', () => {
    it('should create a read stream from package.json and hash it', async () => {
      const stream = createReadStream('package.json');
      const hash = await hashStream('md5', stream);
      expect(hash).to.a('string');
      const expected = await hashFile('md5', 'package.json');
      expect(hash).to.equal(expected);
    });

    it('should convert "hello" to md5 hash', async () => {
      const data = Buffer.from('hello');

      const readable = Readable.from([data]);

      const hash = await hashStream('md5', readable);

      expect(hash).to.equal('5d41402abc4b2a76b9719d911017c592');
    });
  });

  describe('Hash File', () => {
    it('should hash package.json with md5', async () => {
      const hash = await hashFile('md5', 'package.json');
      expect(hash).to.a('string');
    });

    it('should create a hello.txt file and hash it', async () => {
      after(async () => {
        await promises.unlink('hello.txt').catch(() => {});
      });

      await promises.writeFile('hello.txt', 'hello');
      const hash = await hashFile('md5', 'hello.txt');
      expect(hash).to.equal('5d41402abc4b2a76b9719d911017c592');
    });
  });
});
