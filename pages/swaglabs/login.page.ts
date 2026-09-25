import { Locator, Page } from '@playwright/test';
import { appConfig } from '../../config/app';
import { BasePage } from '../base.page';

export class LoginPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    // ==================== Locators ====================

    get logo(): Locator {
        return this.page.getByText('Swag Labs', { exact: true });
    }

    get usernameInput(): Locator {
        return this.page.getByLabel('Username');
    }

    get passwordInput(): Locator {
        return this.page.getByLabel('Password');
    }

    get loginButton(): Locator {
        return this.page.getByRole('button', { name: 'Login' });
    }

    get acceptedUsernamesHeading(): Locator {
        return this.page.getByRole('heading', { name: 'Accepted usernames are:' });
    }

    get passwordHelpHeading(): Locator {
        return this.page.getByRole('heading', { name: 'Password for all users:' });
    }

    get acceptedUsernamesList(): Locator {
        return this.page.getByText('standard_user');
    }

    get passwordHelpText(): Locator {
        return this.page.getByText('secret_sauce');
    }

    // ==================== Feedback Locators ====================

    get errorMessage(): Locator {
        return this.page.getByRole('alert');
    }

    get dismissErrorButton(): Locator {
        return this.page.getByRole('button', { name: 'Dismiss error' });
    }

    // ==================== Actions ====================

    /**
     * Navigates to the login page.
     * @returns {Promise<void>}
     */
    async open(): Promise<void> {
        await this.page.goto(appConfig.appUrl!);
    }

    /**
     * Fills in credentials and submits the login form, waiting for either a
     * successful redirect to the Products page or a login error to appear.
     * Login here is purely client-side (no network request to await), so the
     * wait targets whichever state change happens first.
     * @param {string} username - The username to submit.
     * @param {string} password - The password to submit.
     * @returns {Promise<void>}
     */
    async login(username: string, password: string): Promise<void> {
        await this.usernameInput.fill(username);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
        await Promise.race([
            this.page.waitForURL('**/inventory.html', { timeout: 10000 }).catch(() => undefined),
            this.errorMessage.waitFor({ state: 'visible', timeout: 10000 }).catch(() => undefined),
        ]);
    }

    /**
     * Attempts to navigate directly to a protected route without an active session.
     * The app redirects back to the login page with an error explaining why.
     * @param {string} path - The protected route to attempt, e.g. '/inventory.html'.
     * @returns {Promise<void>}
     */
    async openProtectedPage(path: string): Promise<void> {
        await this.page.goto(`${appConfig.appUrl}${path}`);
    }
}
