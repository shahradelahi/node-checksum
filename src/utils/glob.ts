import { resolve } from 'node:path';
import fg, { type Options as FastGlobOptions } from 'fast-glob';

export interface GlobOptions extends FastGlobOptions {
  cwd?: string;
  exclude?: string[];
}

export async function resolveGlob(glob: string, options: GlobOptions): Promise<string[]> {
  const { exclude = [], ...rest } = options;

  const excluded = await fg.glob(exclude, rest);
  const files = await fg.glob(glob, rest);

  return (
    files
      // Filter out excluded files
      .filter((file) => !excluded.some((path) => path === file))
      // Resolve absolute paths
      .map((file) => resolve(options.cwd ?? process.cwd(), file))
  );
}
