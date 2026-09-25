import { Locator, Page } from '@playwright/test';
import { MenuComponent } from '../components/menu.component';
import { BasePage } from '../base.page';

export class InventoryPage extends BasePage {
    /** Side (burger) menu shared across authenticated pages */
    readonly menu: MenuComponent;

    constructor(page: Page) {
        super(page);
        this.menu = new MenuComponent(page);
    }

    // ==================== Locators ====================

    get pageTitle(): Locator {
        return this.page.getByText('Products', { exact: true });
    }

    get cartLink(): Locator {
        return this.page.getByTestId('shopping-cart-link');
    }

    get cartBadge(): Locator {
        return this.page.getByTestId('shopping-cart-badge');
    }

    get sortDropdown(): Locator {
        return this.page.getByRole('combobox', { name: 'Sort products' });
    }

    get removeButtons(): Locator {
        return this.page.getByRole('button', { name: 'Remove' });
    }

    get addToCartButtons(): Locator {
        return this.page.getByRole('button', { name: 'Add to cart' });
    }
}
