import { defineConfig, devices } from '@playwright/test'

const remote = Boolean(process.env.TWEXOM_BASE_URL)

export default defineConfig({
  testDir: './tests',
  testMatch: '**/cross.spec.js',
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  use: {
    baseURL: process.env.TWEXOM_BASE_URL || 'http://127.0.0.1:5173',
    headless: true,
    actionTimeout: 10000,
    navigationTimeout: 20000
  },
  projects: [
    { name: 'firefox', use: { ...devices['Desktop Firefox'], browserName: 'firefox' } },
    { name: 'webkit', use: { ...devices['Desktop Safari'], browserName: 'webkit' } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'], browserName: 'chromium' } },
    { name: 'mobile-safari', use: { ...devices['iPhone 13'], browserName: 'webkit' } }
  ],
  webServer: remote ? undefined : {
    command: 'npm run dev -- --port 5173',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: true
  }
})
