import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    fileParallelism: false, // Run auth tests sequentially on SQLite
    testTimeout: 15000,
    include: ['tests/**/*.test.ts'],
  },
})
