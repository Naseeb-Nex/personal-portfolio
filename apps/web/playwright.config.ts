import { defineConfig } from '@playwright/test';

const port = Number(process.env.VITE_PORT) || 5321;

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: `http://localhost:${port}`,
  },
  webServer: {
    command: 'npm run dev',
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI,
  },
});
