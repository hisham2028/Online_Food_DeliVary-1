import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test/setup.js'],
    include: ['src/test/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      include: [
        'src/controllers/**',
        'src/services/**',
        'src/middleware/**',
        'src/strategies/**',
        'src/models/**',
        'src/factories/**',
      ],
      exclude: ['src/test/**'],
    },
  },
});
