import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load .env file (relative path works since Playwright runs from project root)
dotenv.config({ path: '.env' });

// Tests share a single OpenCart instance and admin token across specs.
// This requires sequential execution - parallel workers would corrupt shared state.
const WORKERS = 1;
const FULLY_PARALLEL = false;

// Enforce at config level: fail fast if these constraints are accidentally changed
if (process.env.PW_WORKERS && parseInt(process.env.PW_WORKERS) > 1) {
  throw new Error('Parallel workers not supported: tests share admin token and OpenCart state');
}

export default defineConfig({
  testDir: './tests',
  fullyParallel: FULLY_PARALLEL,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: WORKERS,
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
