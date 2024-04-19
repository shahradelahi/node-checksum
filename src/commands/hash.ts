import { hash, hashDirectory, hashFile } from '@/lib';
import { toBuffer } from '@/utils/buffer';
import { isDirectory } from '@/utils/fs-extra';
import { handleError } from '@/utils/handle-error';
import { Command } from 'commander';
import { relative, resolve } from 'node:path';

export const hashCmd = new Command()
  .command('hash')
  .alias('h')
  .description('hash a file or directory')
  .argument('[file...]', 'file or directory to hash', [])
  .option('-a, --algorithm <algorithm>', 'hash algorithm', 'sha256')
  .option('-C, --context <context>', 'context to hash')
  .option('-r, --recursive', 'hash directories recursively', false)
  .option('-x, --exclude <exclude>', 'exclude patterns')
  .option('--cwd <cwd>', 'current working directory', process.cwd())
  .action(async (file, options, program) => {
    const { algorithm, context } = options;
    console.log('Here!');

    try {
      if (context) {
        const hashed = hash(algorithm, context);
        console.log(hashed);

        process.exitCode = 0;
        return;
      }

      if (file.length > 0) {
        for (const filePath of file) {
          const { default: fg } = await import('fast-glob');

          const excluded = await fg.glob(options.exclude ?? [], { onlyFiles: false });

          async function logHashed(filePath: string, named: boolean) {
            const hashed = await hashFile(algorithm, resolve(options.cwd, filePath));
            console.log(`${hashed}${named ? ` ${relative(options.cwd, filePath)}` : ''}`);
          }

          function isExcluded(filePath: string) {
            return excluded.some((glob) => glob === filePath);
          }

          if (await isDirectory(filePath)) {
            const hashed = await hashDirectory(algorithm, filePath, {
              exclude: options.exclude,
              recursive: options.recursive,
            });
            for (const { filename } of hashed) {
              await logHashed(filename, true);
            }
            continue;
          }

          if (isExcluded(filePath)) {
            continue;
          }

          await logHashed(filePath, file.length > 1);
        }

        process.exitCode = 0;
        return;
      }

      const { stdin } = process;

      if (stdin.isTTY) {
        program.help();
        return;
      }

      const chunks: Buffer[] = [];
      for await (const chunk of stdin) {
        chunks.push(toBuffer(chunk));
      }

      const data = Buffer.concat(chunks);
      const hashed = hash(algorithm, data);
      console.log(hashed);
    } catch (e) {
      handleError(e);
    }
  });
