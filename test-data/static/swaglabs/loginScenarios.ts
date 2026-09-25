import { Messages, Routes } from '../../../enums/swaglabs/swaglabs';

/** Login attempts the Swag Labs login form rejects, with the exact message shown for each, verified against the live app */
export const REJECTED_LOGIN_ATTEMPTS = [
    {
        description: 'both fields empty',
        username: '',
        password: '',
        expectedMessage: Messages.REQUIRED_USERNAME,
    },
    {
        description: 'username empty, password filled',
        username: '',
        password: 'secret_sauce',
        expectedMessage: Messages.REQUIRED_USERNAME,
    },
    {
        description: 'password empty, username filled',
        username: 'standard_user',
        password: '',
        expectedMessage: Messages.REQUIRED_PASSWORD,
    },
    {
        description: 'unregistered username',
        username: 'invalid_user',
        password: 'secret_sauce',
        expectedMessage: Messages.CREDENTIALS_MISMATCH,
    },
    {
        description: 'valid username with wrong password',
        username: 'standard_user',
        password: 'wrong_password',
        expectedMessage: Messages.CREDENTIALS_MISMATCH,
    },
    {
        description: 'locked-out user',
        username: 'locked_out_user',
        password: 'secret_sauce',
        expectedMessage: Messages.LOCKED_OUT_USER,
    },
    {
        description: 'username case does not match a registered user',
        username: 'Standard_User',
        password: 'secret_sauce',
        expectedMessage: Messages.CREDENTIALS_MISMATCH,
    },
    {
        description: 'password case does not match the registered password',
        username: 'standard_user',
        password: 'SECRET_SAUCE',
        expectedMessage: Messages.CREDENTIALS_MISMATCH,
    },
    {
        description: 'username has leading whitespace',
        username: ' standard_user',
        password: 'secret_sauce',
        expectedMessage: Messages.CREDENTIALS_MISMATCH,
    },
] as const;

/** Protected pages (excluding /inventory.html, covered separately) that redirect to Login with a page-specific message when accessed without a session, verified against the live app */
export const PROTECTED_PAGES = [
    {
        description: 'Cart',
        path: Routes.CART,
        expectedMessage: Messages.PROTECTED_CART,
    },
    {
        description: 'Inventory item detail',
        path: Routes.INVENTORY_ITEM,
        expectedMessage: Messages.PROTECTED_INVENTORY_ITEM,
    },
    {
        description: 'Checkout step one',
        path: Routes.CHECKOUT_STEP_ONE,
        expectedMessage: Messages.PROTECTED_CHECKOUT_STEP_ONE,
    },
    {
        description: 'Checkout step two',
        path: Routes.CHECKOUT_STEP_TWO,
        expectedMessage: Messages.PROTECTED_CHECKOUT_STEP_TWO,
    },
    {
        description: 'Checkout complete',
        path: Routes.CHECKOUT_COMPLETE,
        expectedMessage: Messages.PROTECTED_CHECKOUT_COMPLETE,
    },
] as const;
