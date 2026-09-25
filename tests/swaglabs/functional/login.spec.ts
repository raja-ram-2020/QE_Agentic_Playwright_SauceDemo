import { expect, test } from '../../../fixtures/pom/test-options';
import { Messages } from '../../../enums/swaglabs/swaglabs';
import { PROTECTED_PAGES, REJECTED_LOGIN_ATTEMPTS } from '../../../test-data/static/swaglabs/loginScenarios';

test.describe('Login', () => {
    test.beforeEach(async ({ resetStorageState, loginPage }) => {
        await resetStorageState();
        await loginPage.open();
    });

    test(
        'should display all required elements on initial page load',
        { tag: '@sanity' },
        async ({ loginPage }) => {
            await test.step('THEN the logo, Username field, Password field, and Login button are visible', async () => {
                await expect(loginPage.logo).toBeVisible();
                await expect(loginPage.usernameInput).toBeVisible();
                await expect(loginPage.passwordInput).toBeVisible();
                await expect(loginPage.loginButton).toBeEnabled();
            });

            await test.step('THEN the demo-credential help panels list the accepted usernames and shared password', async () => {
                await expect(loginPage.acceptedUsernamesHeading).toBeVisible();
                const acceptedUsernamesText = await loginPage.acceptedUsernamesList.textContent();
                for (const username of [
                    'standard_user',
                    'locked_out_user',
                    'problem_user',
                    'performance_glitch_user',
                    'error_user',
                    'visual_user',
                ]) {
                    expect(acceptedUsernamesText).toContain(username);
                }
                await expect(loginPage.passwordHelpHeading).toBeVisible();
                await expect(loginPage.passwordHelpText).toContainText('secret_sauce');
            });
        }
    );

    test(
        'should redirect to the Products page on successful login',
        { tag: '@smoke' },
        async ({ loginPage, inventoryPage, page }) => {
            await test.step('WHEN the user submits valid credentials', async () => {
                await loginPage.login(process.env.APP_USERNAME!, process.env.APP_PASSWORD!);
            });

            await test.step('THEN the user is redirected to the Products page', async () => {
                await expect(page).toHaveURL(/\/inventory\.html$/);
                await expect(inventoryPage.pageTitle).toBeVisible();
                await expect(inventoryPage.menu.openButton).toBeVisible();
                await expect(inventoryPage.cartLink).toBeVisible();
                await expect(inventoryPage.sortDropdown).toBeVisible();
                await expect(loginPage.errorMessage).not.toBeVisible();
            });
        }
    );

    for (const { description, username, password, expectedMessage } of REJECTED_LOGIN_ATTEMPTS) {
        test(
            `should reject login for ${description}`,
            { tag: '@regression' },
            async ({ loginPage, page }) => {
                await test.step('WHEN the user submits the credentials', async () => {
                    await loginPage.login(username, password);
                });

                await test.step('THEN the matching error is shown and the user stays on the Login page', async () => {
                    await expect(loginPage.errorMessage).toHaveText(expectedMessage);
                    await expect(page).toHaveURL(/\/$/);
                });
            }
        );
    }

    test(
        'should dismiss the login error and retain previously entered field values',
        { tag: '@regression' },
        async ({ loginPage }) => {
            await test.step('GIVEN a login error is currently displayed', async () => {
                await loginPage.login('invalid_user', 'secret_sauce');
                await expect(loginPage.errorMessage).toBeVisible();
            });

            await test.step('WHEN the user clicks the dismiss (X) button on the error banner', async () => {
                await loginPage.dismissErrorButton.click();
            });

            await test.step('THEN the error banner disappears and the Username field retains its value', async () => {
                await expect(loginPage.errorMessage).not.toBeVisible();
                await expect(loginPage.usernameInput).toHaveValue('invalid_user');
            });
        }
    );

    test(
        'should mask the password input while typing',
        { tag: '@regression' },
        async ({ loginPage, page }) => {
            await test.step('WHEN the user types into the Password field', async () => {
                await loginPage.passwordInput.fill('secret_sauce');
            });

            await test.step('THEN the input is masked and the value never appears in the URL', async () => {
                await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
                expect(page.url()).not.toContain('secret_sauce');
            });
        }
    );

    test(
        'should submit the login form via the Enter key from the Password field',
        { tag: '@regression' },
        async ({ loginPage, page }) => {
            await test.step('GIVEN the user has entered valid credentials', async () => {
                await loginPage.usernameInput.fill(process.env.APP_USERNAME!);
                await loginPage.passwordInput.fill(process.env.APP_PASSWORD!);
            });

            await test.step('WHEN the user presses Enter in the Password field', async () => {
                await loginPage.passwordInput.press('Enter');
            });

            await test.step('THEN the login is submitted and the user is redirected to the Products page', async () => {
                await expect(page).toHaveURL(/\/inventory\.html$/);
            });
        }
    );

    test(
        'should move keyboard focus Username → Password → Login via Tab',
        { tag: '@regression' },
        async ({ loginPage, page }) => {
            await test.step('GIVEN focus starts in the Username field', async () => {
                await loginPage.usernameInput.click();
            });

            await test.step('WHEN the user presses Tab', async () => {
                await page.keyboard.press('Tab');
            });

            await test.step('THEN focus moves to the Password field', async () => {
                await expect(loginPage.passwordInput).toBeFocused();
            });

            await test.step('WHEN the user presses Tab again', async () => {
                await page.keyboard.press('Tab');
            });

            await test.step('THEN focus moves to the Login button', async () => {
                await expect(loginPage.loginButton).toBeFocused();
            });
        }
    );

    test(
        'should redirect to Login when navigating directly to the Products page without a session',
        { tag: '@regression' },
        async ({ loginPage, page }) => {
            await test.step('WHEN the user navigates directly to /inventory.html', async () => {
                await loginPage.openProtectedPage('/inventory.html');
            });

            await test.step('THEN the user lands on Login with the protected-page error', async () => {
                await expect(page).toHaveURL(/\/$/);
                await expect(loginPage.errorMessage).toHaveText(Messages.PROTECTED_INVENTORY);
            });
        }
    );

    for (const { description, path, expectedMessage } of PROTECTED_PAGES) {
        test(
            `should redirect to Login when navigating directly to ${description} without a session`,
            { tag: '@regression' },
            async ({ loginPage, page }) => {
                await test.step(`WHEN the user navigates directly to ${path}`, async () => {
                    await loginPage.openProtectedPage(path);
                });

                await test.step('THEN the user lands on Login with the protected-page error', async () => {
                    await expect(page).toHaveURL(/\/$/);
                    await expect(loginPage.errorMessage).toHaveText(expectedMessage);
                });
            }
        );
    }
});
