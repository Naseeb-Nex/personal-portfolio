import { defineConfig } from '@playwright/test';

const port = Number(process.env.VITE_PORT) || 5173;

export default defineConfig({
  testDir: './tests',
  webServer: {
    command: 'npm run dev',
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI,
  },
});
