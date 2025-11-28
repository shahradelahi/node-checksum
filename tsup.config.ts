import { defineConfig } from 'tsup';

export default defineConfig([
  {
    clean: true,
    dts: true,
    entry: { lib: 'src/lib/index.ts' },
    format: ['cjs', 'esm'],
    target: 'esnext',
    outDir: 'dist',
  },
  {
    clean: true,
    entry: ['src/cli.ts'],
    format: ['esm'],
    target: 'esnext',
    outDir: 'dist',
  },
]);
