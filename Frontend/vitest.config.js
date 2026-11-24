import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    //environment: 'node',
    include: ['src/**/*.test.{js,jsx}']
  }
});
