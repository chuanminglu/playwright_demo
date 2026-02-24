import { type Locator, type Page } from '@playwright/test';

/**
 * Swag Labs登录页面对象模型
 * 
 * 页面元素分析：
 * - 用户名输入框: data-test="username", id="user-name"
 * - 密码输入框: data-test="password", id="password"  
 * - 登录按钮: data-test="login-button", id="login-button"
 * - 错误消息容器: class="error-message-container"
 * - 错误关闭按钮: class="error-button"
 */
export class SwagLabsLoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessageContainer: Locator;
  readonly errorCloseButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
    this.errorMessageContainer = page.locator('.error-message-container');
    this.errorCloseButton = page.locator('.error-button');
  }

  /**
   * 导航到登录页面
   */
  async goto() {
    await this.page.goto('https://www.saucedemo.com/');
  }

  /**
   * 执行登录操作
   * @param username 用户名
   * @param password 密码
   */
  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /**
   * 填写用户名
   * @param username 用户名
   */
  async fillUsername(username: string) {
    await this.usernameInput.fill(username);
  }

  /**
   * 填写密码
   * @param password 密码
   */
  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  /**
   * 点击登录按钮
   */
  async clickLogin() {
    await this.loginButton.click();
  }

  /**
   * 获取错误消息文本
   * @returns 错误消息内容
   */
  async getErrorMessage(): Promise<string> {
    return await this.errorMessageContainer.textContent() || '';
  }

  /**
   * 检查错误消息是否可见
   * @returns 是否显示错误消息
   */
  async isErrorMessageVisible(): Promise<boolean> {
    return await this.errorMessageContainer.isVisible();
  }

  /**
   * 关闭错误消息
   */
  async closeErrorMessage() {
    await this.errorCloseButton.click();
  }

  /**
   * 清空用户名输入框
   */
  async clearUsername() {
    await this.usernameInput.clear();
  }

  /**
   * 清空密码输入框
   */
  async clearPassword() {
    await this.passwordInput.clear();
  }

  /**
   * 使用标准用户登录（快捷方法）
   */
  async loginAsStandardUser() {
    await this.login('standard_user', 'secret_sauce');
  }

  /**
   * 使用问题用户登录（快捷方法）
   */
  async loginAsProblemUser() {
    await this.login('problem_user', 'secret_sauce');
  }

  /**
   * 使用性能测试用户登录（快捷方法）
   */
  async loginAsPerformanceUser() {
    await this.login('performance_glitch_user', 'secret_sauce');
  }
}
