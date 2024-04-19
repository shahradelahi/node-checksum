import type { Options as InternalOptions } from 'fast-glob';
import { resolve } from 'node:path';

export interface GlobOptions extends InternalOptions {
  cwd?: string;
  exclude?: string[];
}

export async function resolveGlob(glob: string, options: GlobOptions): Promise<string[]> {
  const { exclude = [], ...internal } = options;

  const { default: fg } = await import('fast-glob');
  const excluded = await fg.glob(exclude, internal);

  function isExcluded(filePath: string) {
    return excluded.some((path) => path === filePath);
  }

  const files = await fg.glob(glob, internal);
  return (
    files
      // Filter out excluded files
      .filter((file) => !isExcluded(file))
      // Resolve absolute paths
      .map((file) => resolve(options.cwd ?? process.cwd(), file))
  );
}
