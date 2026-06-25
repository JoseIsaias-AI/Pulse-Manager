import { defineConfig, devices } from '@playwright/test';
import path from 'path';

const backendPort = Number(process.env.E2E_BACKEND_PORT || 3100);
const frontendPort = Number(process.env.E2E_FRONTEND_PORT || 4173);
const repoRoot = path.resolve(__dirname, '../../..');

export default defineConfig({
  testDir: '.',
  timeout: 45_000,
  expect: {
    timeout: 10_000
  },
  fullyParallel: false,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${frontendPort}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  webServer: [
    {
      command: 'node -r ts-node/register src/server.ts',
      cwd: repoRoot,
      url: `http://localhost:${backendPort}/api/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      env: {
        ...process.env,
        NODE_ENV: 'development',
        DB_TYPE: 'sqljs',
        PORT: String(backendPort)
      }
    },
    {
      command: 'node src/scripts/e2e-static-server.js',
      cwd: repoRoot,
      url: `http://localhost:${frontendPort}/pages/login.html`,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
      env: {
        ...process.env,
        E2E_FRONTEND_PORT: String(frontendPort)
      }
    }
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});
