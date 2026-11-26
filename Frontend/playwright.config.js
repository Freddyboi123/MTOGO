import { defineConfig, devices } from '@playwright/test';

const isCI = Boolean(process.env.CI);

const BACKEND_PORT = 6970; 
const FRONTEND_PORT = 4173;
const apiUrl = `http://localhost:${BACKEND_PORT}`;
const frontendUrl = `http://localhost:${FRONTEND_PORT}`;

export default defineConfig({
  testDir: './Playwright',
  timeout: 30000,
  expect: { timeout: 7000 },
  retries: isCI ? 1 : 0,
  workers: 1,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: frontendUrl,
    trace: 'retain-on-failure'
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command:
        'mvn -B -q test-compile org.codehaus.mojo:exec-maven-plugin:3.5.0:java -Dexec.mainClass=app.PlaywrightServer -Dexec.classpathScope=test',
      cwd: '../Backend',
      url: `${apiUrl}/api/health`,
      env: {
        DEPLOYED: 'false',
        PORT: String(BACKEND_PORT),
        ISSUER: 'MTOGO',
        TOKEN_EXPIRE_TIME: '86400000',
        SECRET_KEY: 'e2e-only-secret-key-that-is-at-least-32-characters-long',
        FRONTEND_URL: frontendUrl,
        BACKEND_URL: apiUrl,
        COMPANY_NAME: 'MTOGO'
      },
      stdout: isCI ? 'pipe' : 'ignore',
      reuseExistingServer: !isCI,
      timeout: 180000
    },
    {
      command: `npm run build && npm run preview -- --port ${FRONTEND_PORT} --strictPort`,
      url: frontendUrl,
      env: { VITE_API_URL: apiUrl },
      reuseExistingServer: !isCI,
      timeout: 120000
    }
  ]
});
