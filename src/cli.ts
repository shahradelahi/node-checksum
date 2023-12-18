#!/usr/bin/env node

import { verify } from '@/commands';
import { hash, hashFile } from '@/lib';
import { handleError } from '@/utils/handle-error';
import { Command } from 'commander';
import { resolve } from 'node:path';

async function main() {
  const program = new Command();

  program.addCommand(verify);

  program
    .argument('[file...]', 'file to hash', [])
    .option('-a, --algorithm <algorithm>', 'hash algorithm', 'sha256')
    .option('--cwd <cwd>', 'current working directory', process.cwd())
    .action(async (file, options) => {
      const { algorithm } = options;

      try {
        if (file.length > 0) {
          for (const filePath of file) {
            const hashed = await hashFile(algorithm, resolve(options.cwd, filePath));
            console.log(`${hashed}  ${filePath}`);
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
          chunks.push(chunk);
        }

        const data = Buffer.concat(chunks);
        const hashed = hash(algorithm, data);
        console.log(hashed);
      } catch (e) {
        handleError(e);
      }
    });

  program.parse();
}

main();
