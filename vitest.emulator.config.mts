import { defineConfig } from 'vitest/config';
import base from './vitest.config.mjs';

export default defineConfig({
  ...base,
  test: {
    ...base.test,
    include: ['tests/emulator/**/*.test.ts'],
    fileParallelism: false,
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
