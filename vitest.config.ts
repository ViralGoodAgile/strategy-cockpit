import { defineConfig } from 'vitest/config';

// Unit tests run in a plain node env — the suite covers pure domain/logic modules
// (no DOM), so they're fast and reliable in CI.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
