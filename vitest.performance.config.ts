import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.performance.test.{ts,tsx}'],
    css: true,
    testTimeout: 30000, // Performance tests may take longer
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
