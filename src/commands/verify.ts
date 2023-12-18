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
  .option('--quiet', 'do not log anything', false)
  .action(async (file, checksum, options) => {
    const { algorithm, quiet } = options;

    try {
      const hashed = await hashFile(algorithm, resolve(options.cwd, file));

      if (checksum) {
        if (hashed === checksum) {
          controlledLog('match', quiet);
          process.exitCode = 0;
          return;
        }

        controlledLog(`mismatch: expected ${checksum} but got ${hashed}`, quiet);
        process.exitCode = 1;
        return;
      }

      const { stdin } = process;

      if (stdin.isTTY) {
        controlledLog('checksum is required', quiet);
        process.exitCode = 1;
        return;
      }

      const chunks: Buffer[] = [];
      for await (const chunk of stdin) {
        chunks.push(chunk);
      }

      const stdChecksum = Buffer.concat(chunks).toString().trim();
      if (hashed === stdChecksum) {
        controlledLog('match', quiet);
        process.exitCode = 0;
        return;
      }

      controlledLog(`mismatch: expected ${stdChecksum} but got ${hashed}`, quiet);
      process.exitCode = 1;
    } catch (e) {
      handleError(e);
    }
  });

function controlledLog(message: string, quiet: boolean) {
  if (!quiet) {
    console.log(message);
  }
}
