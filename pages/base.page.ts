import { Page } from '@playwright/test';

/**
 * Base class for all page objects in this framework. Holds only what is
 * genuinely universal across every page, present and future -- never
 * page-specific or conditionally-shared UI. Elements that exist on some
 * pages but not others (e.g. the authenticated side menu) belong in a
 * composed component instead -- see the `page-objects` skill's BasePage vs
 * Component decision rule.
 */
export abstract class BasePage {
    constructor(protected readonly page: Page) {}

    /**
     * Gets the current page title.
     * @returns {Promise<string>}
     */
    async getTitle(): Promise<string> {
        return this.page.title();
    }

    /**
     * Gets the current page URL.
     * @returns {string}
     */
    getCurrentUrl(): string {
        return this.page.url();
    }

    /**
     * Waits for the page to reach the given load state.
     * @param {'load' | 'domcontentloaded' | 'networkidle'} state - The load state to wait for.
     * @returns {Promise<void>}
     */
    async waitForLoad(state: 'load' | 'domcontentloaded' | 'networkidle' = 'load'): Promise<void> {
        await this.page.waitForLoadState(state);
    }
}
