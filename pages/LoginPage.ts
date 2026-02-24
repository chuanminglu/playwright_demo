import { expect, type Locator, type Page } from '@playwright/test';

/**
 * 登录页 Page Object
 * URL: https://www.saucedemo.com/
 *
 * 覆盖用例: TC-01-01 ~ TC-01-05
 */
export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
    this.errorMessage = page.locator('[data-test="error"]');
  }

  /** 导航到登录页 */
  async goto() {
    await this.page.goto('https://www.saucedemo.com/', { waitUntil: 'networkidle' });
  }

  /** 完整登录操作 */
  async login(username: string, password: string) {
    await this.usernameInput.waitFor({ state: 'visible' });
    await this.passwordInput.waitFor({ state: 'visible' });
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /** 断言: 错误提示包含指定文本 */
  async expectError(text: string) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(text);
  }

  /** 断言: 停留在登录页（登录失败场景） */
  async expectStillOnLoginPage() {
    await expect(this.page).toHaveURL('https://www.saucedemo.com/');
  }
}