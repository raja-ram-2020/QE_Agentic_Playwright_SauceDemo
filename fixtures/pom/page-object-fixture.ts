import { test as base } from '@playwright/test';
import { LoginPage } from '../../pages/swaglabs/login.page';
import { InventoryPage } from '../../pages/swaglabs/inventory.page';
import { CartPage } from '../../pages/swaglabs/cart.page';

export type FrameworkFixtures = {
    loginPage: LoginPage;
    inventoryPage: InventoryPage;
    cartPage: CartPage;
};

export const test = base.extend<FrameworkFixtures>({
    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
    },
    inventoryPage: async ({ page }, use) => {
        await use(new InventoryPage(page));
    },
    cartPage: async ({ page }, use) => {
        await use(new CartPage(page));
    },
});
