import { hashGlob } from '@/lib';
import { expect } from 'chai';

it('should hash project file with glob', async () => {
  const results = await hashGlob('md5', '**/*.ts');

  expect(results.length).to.be.greaterThan(0);

  // Expect cli.ts and lib.ts to be included
  expect(results.some(({ filename }) => filename.endsWith('src/cli.ts'))).to.be.true;
  expect(results.some(({ filename }) => filename.endsWith('src/lib.ts'))).to.be.true;
});
