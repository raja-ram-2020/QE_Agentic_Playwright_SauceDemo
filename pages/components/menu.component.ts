import { expect, Locator, Page } from '@playwright/test';

export class MenuComponent {
    constructor(private readonly page: Page) {}

    // ==================== Locators ====================

    get openButton(): Locator {
        return this.page.getByRole('button', { name: 'Open Menu' });
    }

    get closeButton(): Locator {
        return this.page.getByRole('button', { name: 'Close Menu' });
    }

    get panel(): Locator {
        return this.page.locator('.bm-menu-wrap');
    }

    get allItemsLink(): Locator {
        return this.page.getByRole('button', { name: 'All Items', exact: true });
    }

    get aboutLink(): Locator {
        return this.page.getByRole('link', { name: 'About' });
    }

    get logoutLink(): Locator {
        return this.page.getByRole('button', { name: 'Logout' });
    }

    get resetAppStateLink(): Locator {
        return this.page.getByRole('button', { name: 'Reset App State' });
    }

    // ==================== Actions ====================

    /**
     * Opens the side menu via the burger icon and waits for it to finish sliding open.
     * @returns {Promise<void>}
     */
    async open(): Promise<void> {
        await this.openButton.click();
        await expect(this.panel).toHaveAttribute('aria-hidden', 'false');
    }

    /**
     * Closes the side menu via the close (X) button.
     * @returns {Promise<void>}
     */
    async close(): Promise<void> {
        await this.closeButton.click();
    }
}
