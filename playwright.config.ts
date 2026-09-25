import { defineConfig, devices } from '@playwright/test';
import reportingLabs from './reporting-labs.config';
import dotenv from 'dotenv';

const environment = process.env.ENVIRONMENT ?? 'dev';
const environmentPath = `./env/.env.${environment}`;
dotenv.config({ path: environmentPath });

export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: [
        ['html'],
        ['allure-playwright', { resultsDir: 'allure-results'}],
        ['list'],
        ['reporting-labs', reportingLabs],
    ],
    use: {
        headless: !!(process.env.CI || process.env.DEVCONTAINER),
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        testIdAttribute: 'data-test',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});
