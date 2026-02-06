import { type Locator, type Page } from '@playwright/test';

export class LoginPage2 {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly errorCloseButton: Locator;
  readonly usernameErrorIcon: Locator;
  readonly passwordErrorIcon: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
    this.errorMessage = page.locator('[data-test="error"]');
    this.errorCloseButton = page.locator('[data-test="error-button"]');
    this.usernameErrorIcon = page.locator('#user-name + .error_icon');
    this.passwordErrorIcon = page.locator('#password + .error_icon');
  }

  async goto() {
    await this.page.goto('/');
  }

  async fillUsername(username: string) {
    await this.usernameInput.clear();
    await this.usernameInput.fill(username);
  }

  async fillPassword(password: string) {
    await this.passwordInput.clear();
    await this.passwordInput.fill(password);
  }

  async clickLogin() {
    await this.loginButton.click();
  }

  async login(username: string, password: string) {
    await this.fillUsername(username);
    await this.fillPassword(password);
    await this.clickLogin();
  }

  async closeErrorMessage() {
    await this.errorCloseButton.click();
  }

  async getErrorMessage(): Promise<string> {
    return await this.errorMessage.textContent() || '';
  }

  async isErrorMessageVisible(): Promise<boolean> {
    return await this.errorMessage.isVisible();
  }

  async isUsernameErrorVisible(): Promise<boolean> {
    return await this.usernameErrorIcon.isVisible();
  }

  async isPasswordErrorVisible(): Promise<boolean> {
    return await this.passwordErrorIcon.isVisible();
  }

  async waitForLogin() {
    await this.page.waitForURL('**/inventory.html');
  }
}