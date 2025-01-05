import { defineConfig } from '@shahrad/eslint-config';

export default defineConfig(
  { ignores: ['dist'] },
  {
    rules: {
      'no-console': 'error',
      '@typescript-eslint/semi': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  }
);
