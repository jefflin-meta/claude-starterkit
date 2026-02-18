import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true
      }
    },
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/fixtures/**'
    ]
  }
});
