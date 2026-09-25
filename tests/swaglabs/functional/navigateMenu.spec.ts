import { expect, test } from '../../../fixtures/pom/test-options';
import { Messages } from '../../../enums/swaglabs/swaglabs';

test.describe('Navigate menu items', () => {
    test.beforeEach(async ({ resetStorageState, loginPage }) => {
        await resetStorageState();
        await loginPage.open();
    });

    test(
        'should open the side menu via the burger icon and close it via the close button',
        { tag: '@sanity' },
        async ({ loginPage, inventoryPage }) => {
            await test.step('GIVEN the user is logged in on an authenticated page', async () => {
                await loginPage.login(process.env.APP_USERNAME!, process.env.APP_PASSWORD!);
                await expect(inventoryPage.pageTitle).toBeVisible();
            });

            await test.step('WHEN the user clicks the burger icon', async () => {
                await inventoryPage.menu.open();
            });

            await test.step('THEN the side menu shows All Items, About, Logout, and Reset App State', async () => {
                await expect(inventoryPage.menu.allItemsLink).toBeVisible();
                await expect(inventoryPage.menu.aboutLink).toBeVisible();
                await expect(inventoryPage.menu.logoutLink).toBeVisible();
                await expect(inventoryPage.menu.resetAppStateLink).toBeVisible();
            });

            await test.step('WHEN the user clicks the close (X) button', async () => {
                await inventoryPage.menu.close();
            });

            await test.step('THEN the menu is closed', async () => {
                await expect(inventoryPage.menu.panel).toHaveAttribute('aria-hidden', 'true');
            });
        }
    );

    test(
        "should navigate to the Products page via 'All Items' and preserve cart state",
        { tag: '@regression' },
        async ({ loginPage, inventoryPage, cartPage, page }) => {
            await test.step('GIVEN the user is logged in, has added 1 item to the cart, and is on the Cart page', async () => {
                await loginPage.login(process.env.APP_USERNAME!, process.env.APP_PASSWORD!);
                await inventoryPage.addToCartButtons.first().click();
                await expect(inventoryPage.cartBadge).toHaveText('1');
                await inventoryPage.cartLink.click();
                await expect(cartPage.pageTitle).toBeVisible();
            });

            await test.step("WHEN the user opens the menu and clicks 'All Items'", async () => {
                await cartPage.menu.open();
                await cartPage.menu.allItemsLink.click();
            });

            await test.step('THEN the user lands on the Products page with the cart badge unchanged', async () => {
                await expect(page).toHaveURL(/\/inventory\.html$/);
                await expect(inventoryPage.cartBadge).toHaveText('1');
            });
        }
    );

    test(
        "should navigate to the Sauce Labs site via 'About'",
        { tag: '@regression' },
        async ({ loginPage, inventoryPage, page }) => {
            await test.step('GIVEN the user is logged in and the side menu is open', async () => {
                await loginPage.login(process.env.APP_USERNAME!, process.env.APP_PASSWORD!);
                await inventoryPage.menu.open();
            });

            const response = await test.step("WHEN the user clicks 'About'", async () => {
                const [aboutResponse] = await Promise.all([
                    page.waitForResponse('https://saucelabs.com/'),
                    inventoryPage.menu.aboutLink.click(),
                ]);
                return aboutResponse;
            });

            await test.step('THEN the browser navigates to the Sauce Labs site with a 200 response', async () => {
                await expect(page).toHaveURL('https://saucelabs.com/');
                expect(response.status()).toBe(200);
            });
        }
    );

    test(
        'should log out, clear the session, and return to the Login page',
        { tag: '@smoke' },
        async ({ loginPage, inventoryPage, page }) => {
            await test.step('GIVEN the user is logged in', async () => {
                await loginPage.login(process.env.APP_USERNAME!, process.env.APP_PASSWORD!);
            });

            await test.step('WHEN the user logs out via the side menu', async () => {
                await inventoryPage.menu.open();
                await inventoryPage.menu.logoutLink.click();
            });

            await test.step('THEN the user is back on Login with empty fields and no session cookie', async () => {
                await expect(page).toHaveURL(/\/$/);
                await expect(loginPage.usernameInput).toHaveValue('');
                await expect(loginPage.passwordInput).toHaveValue('');
                const cookies = await page.context().cookies();
                expect(cookies.find((cookie) => cookie.name === 'session-username')).toBeUndefined();
            });
        }
    );

    test(
        'should not restore the session when using the browser Back button after logout',
        { tag: '@regression' },
        async ({ loginPage, inventoryPage, page }) => {
            await test.step('GIVEN the user has logged in and then logged out', async () => {
                await loginPage.login(process.env.APP_USERNAME!, process.env.APP_PASSWORD!);
                await inventoryPage.menu.open();
                await inventoryPage.menu.logoutLink.click();
                await expect(page).toHaveURL(/\/$/);
            });

            await test.step('WHEN the user clicks the browser Back button', async () => {
                await page.goBack();
            });

            await test.step('THEN the user lands on Login with the protected-page error', async () => {
                await expect(page).toHaveURL(/\/$/);
                await expect(loginPage.errorMessage).toHaveText(Messages.PROTECTED_INVENTORY);
            });
        }
    );

    test(
        'should redirect to Login when navigating directly to a protected page after logout',
        { tag: '@regression' },
        async ({ loginPage, inventoryPage, page }) => {
            await test.step('GIVEN the user has logged in and then logged out', async () => {
                await loginPage.login(process.env.APP_USERNAME!, process.env.APP_PASSWORD!);
                await inventoryPage.menu.open();
                await inventoryPage.menu.logoutLink.click();
                await expect(page).toHaveURL(/\/$/);
            });

            await test.step('WHEN the user navigates directly to /inventory.html', async () => {
                await loginPage.openProtectedPage('/inventory.html');
            });

            await test.step('THEN the user lands on Login with the protected-page error', async () => {
                await expect(page).toHaveURL(/\/$/);
                await expect(loginPage.errorMessage).toHaveText(Messages.PROTECTED_INVENTORY);
            });
        }
    );
});
