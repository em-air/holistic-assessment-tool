/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts', 'tests/**/*.{test,spec}.ts'],
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'tests/',
        '**/*.d.ts',
        'scripts/',
        'build.js',
      ],
      thresholds: {
        // Disable hard gating until the backend has meaningful coverage for
        // the data-migration phase; re-enable once route tests are added.
        lines: 0,
        functions: 0,
        branches: 0,
        statements: 0,
      },
    },
  },
});
