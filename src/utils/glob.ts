import { resolve } from 'node:path';
import fg from 'fast-glob';
import type { Options as InternalOptions } from 'fast-glob';

export interface GlobOptions extends InternalOptions {
  cwd?: string;
  exclude?: string[];
}

export async function resolveGlob(glob: string, options: GlobOptions): Promise<string[]> {
  const { exclude = [], ...internal } = options;

  const excluded = await fg.glob(exclude, internal);
  const files = await fg.glob(glob, internal);

  return (
    files
      // Filter out excluded files
      .filter((file) => !excluded.some((path) => path === file))
      // Resolve absolute paths
      .map((file) => resolve(options.cwd ?? process.cwd(), file))
  );
}
