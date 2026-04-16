import { Page, Locator, expect } from '@playwright/test';

// 覆盖用例: SWAG-LOGIN-001 ~ SWAG-LOGIN-005（SWAG-US002 用户登录）

export class LoginPage {
  // --- Locators ---
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(private page: Page) {
    this.usernameInput = page.getByTestId('username');
    this.passwordInput = page.getByTestId('password');
    this.loginButton   = page.getByTestId('login-button');
    this.errorMessage  = page.getByTestId('error');
  }

  // --- Navigation ---
  async goto() {
    await this.page.goto('https://www.saucedemo.com/');
  }

  // --- Actions ---
  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  // --- Assertions ---
  async expectLoginSuccess() {
    await expect(this.page).toHaveURL(/inventory\.html/);
    await expect(this.page.getByText('Products')).toBeVisible();
  }

  async expectLoginError(message: string) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(message);
  }
}