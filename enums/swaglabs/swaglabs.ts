/** UI messages displayed to the user on the Swag Labs (Sauce Demo) app, verified against the live app */
export enum Messages {
    REQUIRED_USERNAME = 'Epic sadface: Username is required',
    REQUIRED_PASSWORD = 'Epic sadface: Password is required',
    CREDENTIALS_MISMATCH = 'Epic sadface: Username and password do not match any user in this service',
    LOCKED_OUT_USER = 'Epic sadface: Sorry, this user has been locked out.',
    PROTECTED_INVENTORY = "Epic sadface: You can only access '/inventory.html' when you are logged in.",
    PROTECTED_CART = "Epic sadface: You can only access '/cart.html' when you are logged in.",
    PROTECTED_INVENTORY_ITEM = "Epic sadface: You can only access '/inventory-item.html' when you are logged in.",
    PROTECTED_CHECKOUT_STEP_ONE = "Epic sadface: You can only access '/checkout-step-one.html' when you are logged in.",
    PROTECTED_CHECKOUT_STEP_TWO = "Epic sadface: You can only access '/checkout-step-two.html' when you are logged in.",
    PROTECTED_CHECKOUT_COMPLETE = "Epic sadface: You can only access '/checkout-complete.html' when you are logged in.",
}

/** Route paths for the Swag Labs application under test */
export enum Routes {
    INVENTORY = '/inventory.html',
    CART = '/cart.html',
    INVENTORY_ITEM = '/inventory-item.html',
    CHECKOUT_STEP_ONE = '/checkout-step-one.html',
    CHECKOUT_STEP_TWO = '/checkout-step-two.html',
    CHECKOUT_COMPLETE = '/checkout-complete.html',
}
