import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load .env file (relative path works since Playwright runs from project root)
dotenv.config({ path: '.env' });

// Tests share a single OpenCart instance and admin token across specs.
// This requires sequential execution - parallel workers would corrupt shared state.
// DO NOT increase workers without converting to isolated test containers.
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    actionTimeout: 10000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
