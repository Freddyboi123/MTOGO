import { defineConfig } from 'vitest/config';

// Usage: VITE_API_URL=https://mtogo.api.roneu.dk npm run test:smoke
export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/smoke/**/*.smoke.test.js'],
    testTimeout: 20000
  }
});
