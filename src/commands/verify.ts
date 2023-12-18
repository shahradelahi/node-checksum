import { hashFile } from '@/lib';
import { handleError } from '@/utils/handle-error';
import { Argument, Command } from 'commander';
import { resolve } from 'node:path';

export const verify = new Command()
  .command('verify')
  .description('verify checksum')
  .argument('<file>', 'file to verify')
  .addArgument(new Argument('<checksum>', 'checksum to verify against').argOptional())
  .option('-a, --algorithm <algorithm>', 'hash algorithm', 'sha256')
  .option('--cwd <cwd>', 'current working directory', process.cwd())
  .action(async (file, checksum, options) => {
    const { algorithm } = options;

    try {
      const hashed = await hashFile(algorithm, resolve(options.cwd, file));

      if (checksum) {
        if (hashed === checksum) {
          process.exitCode = 0;
          return;
        }

        console.error('checksum mismatch');
        process.exitCode = 1;
        return;
      }

      const { stdin } = process;

      if (stdin.isTTY) {
        console.error('checksum is required');
        process.exitCode = 1;
        return;
      }

      const chunks: Buffer[] = [];
      for await (const chunk of stdin) {
        chunks.push(chunk);
      }

      const stdChecksum = Buffer.concat(chunks).toString().trim();
      if (hashed === stdChecksum) {
        process.exitCode = 0;
        return;
      }

      console.error('checksum mismatch');
      process.exitCode = 1;
    } catch (e) {
      handleError(e);
    }
  });
