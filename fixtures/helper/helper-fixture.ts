import { test as base } from '@playwright/test';

export type HelperFixtures = {
    resetStorageState: () => Promise<void>;
};

export const test = base.extend<HelperFixtures>({
    resetStorageState: async ({ context }, use) => {
        await use(async () => {
            await context.clearCookies();
            await context.clearPermissions();
        });
    },
});
