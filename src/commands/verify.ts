import { hashFile, readChecksumList, verifyFile } from '@/lib';
import { handleError } from '@/utils/handle-error';
import logger from '@/utils/logger';
import { Argument, Command } from 'commander';
import { relative, resolve } from 'node:path';

export const verifyCmd = new Command()
  .command('verify')
  .alias('v')
  .description('verify checksum')
  .argument('<file>', 'file to verify')
  .addArgument(new Argument('<checksum>', 'checksum to verify against').argOptional())
  .option('-a, --algorithm <algorithm>', 'hash algorithm', 'sha256')
  .option('-c, --check', 'read checksums from the LIST and verify them', false)
  .option('--cwd <cwd>', 'current working directory', process.cwd())
  .option('--quiet', 'do not log anything', false)
  .action(async (file, checksum, options) => {
    const { algorithm, quiet } = options;

    try {
      if (options.check) {
        let failures = 0;

        const list = await readChecksumList(resolve(options.cwd, file));
        for (const [file, hash] of Object.entries(list)) {
          const result = await verifyFile(algorithm, file, hash);
          if (!result) {
            failures++;
          }
          const relativePath = relative(options.cwd, file);
          controlledLog(`${relativePath}: ${result ? 'OK' : 'FAILED'}`, quiet);
        }

        if (failures > 0) {
          controlledLog(`WARNING: ${failures} computed checksums did NOT match`, quiet);
        }

        process.exitCode = failures > 0 ? 1 : 0;
        return;
      }

      const filePath = resolve(options.cwd, file);
      const relativePath = relative(options.cwd, filePath);
      const hashed = await hashFile(algorithm, filePath);

      if (checksum) {
        const matched = hashed === checksum;

        controlledLog(`${relativePath}: ${matched ? 'OK' : 'FAILED'}`, quiet);
        process.exitCode = matched ? 0 : 1;
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
      const matched = hashed === stdChecksum;

      controlledLog(`${relativePath}: ${matched ? 'OK' : 'FAILED'}`, quiet);
      process.exitCode = matched ? 0 : 1;
    } catch (e) {
      handleError(e);
    }
  });

function controlledLog(message: string, quiet: boolean) {
  if (!quiet) {
    logger.log(message);
  }
}
