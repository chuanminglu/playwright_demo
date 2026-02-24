import { Page, Locator } from '@playwright/test';

/**
 * Swag Labs结账页面对象模型
 * 包含三个步骤: Step One(填写信息), Step Two(订单概览), Complete(完成页面)
 * 对应页面: /checkout-step-one.html, /checkout-step-two.html, /checkout-complete.html
 * 测试用例: SWAG-CHK-001, SWAG-CHK-002, SWAG-CHK-003
 */
export class SwagLabsCheckoutPage {
  readonly page: Page;
  
  // Step One - 用户信息表单
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly zipCodeInput: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly errorMessage: Locator;
  readonly errorCloseButton: Locator;
  
  // Step Two - 订单概览
  readonly checkoutSummaryContainer: Locator;
  readonly cartItems: Locator;
  readonly itemTotal: Locator;
  readonly taxAmount: Locator;
  readonly totalAmount: Locator;
  readonly paymentInfo: Locator;
  readonly shippingInfo: Locator;
  readonly finishButton: Locator;
  
  // Complete - 完成页面
  readonly completeHeader: Locator;
  readonly completeText: Locator;
  readonly backHomeButton: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Step One
    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput = page.locator('[data-test="lastName"]');
    this.zipCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.cancelButton = page.locator('[data-test="cancel"]');
    this.errorMessage = page.locator('[data-test="error"]');
    this.errorCloseButton = page.locator('.error-button');
    
    // Step Two
    this.checkoutSummaryContainer = page.locator('.checkout_summary_container');
    this.cartItems = page.locator('.cart_item');
    this.itemTotal = page.locator('.summary_subtotal_label');
    this.taxAmount = page.locator('.summary_tax_label');
    this.totalAmount = page.locator('.summary_total_label');
    this.paymentInfo = page.locator('[data-test="payment-info-value"]');
    this.shippingInfo = page.locator('[data-test="shipping-info-value"]');
    this.finishButton = page.locator('[data-test="finish"]');
    
    // Complete
    this.completeHeader = page.locator('.complete-header');
    this.completeText = page.locator('.complete-text');
    this.backHomeButton = page.locator('[data-test="back-to-products"]');
  }

  /**
   * 填写结账信息（Step One）
   * @param firstName - 名字
   * @param lastName - 姓氏
   * @param zipCode - 邮编
   */
  async fillCheckoutInformation(firstName: string, lastName: string, zipCode: string): Promise<void> {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.zipCodeInput.fill(zipCode);
  }

  /**
   * 点击Continue按钮进入订单概览
   */
  async continue(): Promise<void> {
    await this.continueButton.click();
  }

  /**
   * 点击Cancel按钮取消结账
   */
  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  /**
   * 获取错误消息文本
   */
  async getErrorMessage(): Promise<string | null> {
    try {
      return await this.errorMessage.textContent();
    } catch {
      return null;
    }
  }

  /**
   * 验证是否显示错误消息
   */
  async hasErrorMessage(): Promise<boolean> {
    return await this.errorMessage.isVisible();
  }

  /**
   * 关闭错误消息
   */
  async closeErrorMessage(): Promise<void> {
    await this.errorCloseButton.click();
  }

  /**
   * 获取商品总计（Item total）
   */
  async getItemTotal(): Promise<string | null> {
    return await this.itemTotal.textContent();
  }

  /**
   * 获取税费金额
   */
  async getTaxAmount(): Promise<string | null> {
    return await this.taxAmount.textContent();
  }

  /**
   * 获取总金额
   */
  async getTotalAmount(): Promise<string | null> {
    return await this.totalAmount.textContent();
  }

  /**
   * 获取支付方式信息
   */
  async getPaymentInfo(): Promise<string | null> {
    return await this.paymentInfo.textContent();
  }

  /**
   * 获取配送信息
   */
  async getShippingInfo(): Promise<string | null> {
    return await this.shippingInfo.textContent();
  }

  /**
   * 获取订单概览中的商品数量
   */
  async getOrderItemCount(): Promise<number> {
    return await this.cartItems.count();
  }

  /**
   * 点击Finish按钮完成订单
   */
  async finish(): Promise<void> {
    await this.finishButton.click();
  }

  /**
   * 获取完成页面的标题文本
   */
  async getCompleteHeader(): Promise<string | null> {
    return await this.completeHeader.textContent();
  }

  /**
   * 获取完成页面的描述文本
   */
  async getCompleteText(): Promise<string | null> {
    return await this.completeText.textContent();
  }

  /**
   * 验证是否在完成页面
   */
  async isOnCompletePage(): Promise<boolean> {
    return await this.completeHeader.isVisible();
  }

  /**
   * 点击Back Home按钮返回商品列表
   */
  async backHome(): Promise<void> {
    await this.backHomeButton.click();
  }

  /**
   * 完整的结账流程（Step One → Step Two → Complete）
   * @param firstName - 名字
   * @param lastName - 姓氏
   * @param zipCode - 邮编
   */
  async completeCheckout(firstName: string, lastName: string, zipCode: string): Promise<void> {
    // Step One: 填写信息
    await this.fillCheckoutInformation(firstName, lastName, zipCode);
    await this.continue();
    
    // Step Two: 确认订单
    await this.finish();
  }

  /**
   * 验证订单总价计算是否正确
   * 总价 = 商品总计 + 税费
   */
  async validatePriceCalculation(): Promise<boolean> {
    const itemTotalText = await this.getItemTotal();
    const taxText = await this.getTaxAmount();
    const totalText = await this.getTotalAmount();
    
    if (!itemTotalText || !taxText || !totalText) {
      return false;
    }
    
    // 提取数字 (例如 "Item total: $49.98" => 49.98)
    const itemTotal = parseFloat(itemTotalText.replace(/[^0-9.]/g, ''));
    const tax = parseFloat(taxText.replace(/[^0-9.]/g, ''));
    const total = parseFloat(totalText.replace(/[^0-9.]/g, ''));
    
    // 验证计算（允许0.01的误差）
    const calculatedTotal = itemTotal + tax;
    return Math.abs(calculatedTotal - total) < 0.01;
  }
}
