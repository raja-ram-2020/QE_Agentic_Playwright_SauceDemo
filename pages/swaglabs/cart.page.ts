import { Locator, Page } from '@playwright/test';
import { MenuComponent } from '../components/menu.component';
import { BasePage } from '../base.page';

export class CartPage extends BasePage {
    /** Side (burger) menu shared across authenticated pages */
    readonly menu: MenuComponent;

    constructor(page: Page) {
        super(page);
        this.menu = new MenuComponent(page);
    }

    // ==================== Locators ====================

    get pageTitle(): Locator {
        return this.page.getByText('Your Cart', { exact: true });
    }

    get cartItems(): Locator {
        return this.page.getByTestId('inventory-item');
    }
}
