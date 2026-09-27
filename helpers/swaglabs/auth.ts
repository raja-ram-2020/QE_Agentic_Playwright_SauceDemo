import { LoginPage } from '../../pages/swaglabs/login.page';

/**
 * Logs in on the given LoginPage using the standard test user's credentials from env.
 * @param {LoginPage} loginPage - The LoginPage instance to submit the login form on.
 * @returns {Promise<void>} Resolves once the login form has been submitted.
 */
export async function loginAsStandardUser(loginPage: LoginPage): Promise<void> {
    await loginPage.login(process.env.APP_USERNAME!, process.env.APP_PASSWORD!);
}
