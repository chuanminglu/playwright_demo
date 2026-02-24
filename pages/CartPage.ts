import { expect, type Locator, type Page } from '@playwright/test';

/**
 * 购物车页 Page Object
 * URL: /cart.html
 *
 * 覆盖用例: TC-03-02 ~ TC-03-04
 */
export class CartPage {
  readonly page: Page;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;
  readonly cartItems: Locator;
  readonly cartItemNames: Locator;
  readonly cartItemPrices: Locator;

  constructor(page: Page) {
    this.page = page;
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
    this.cartItems = page.locator('.cart_item');
    this.cartItemNames = page.locator('.inventory_item_name');
    this.cartItemPrices = page.locator('.inventory_item_price');
  }

  /** 点击结账按钮 */
  async checkout() {
    await this.checkoutButton.click();
  }

  /** 继续购物 */
  async continueShopping() {
    await this.continueShoppingButton.click();
  }

  /** 移除购物车中的商品 */
  async removeItem(itemName: string) {
    const itemId = itemName.toLowerCase().replace(/ /g, '-');
    await this.page.locator(`[data-test="remove-${itemId}"]`).click();
  }

  /** 断言: 购物车商品数量 */
  async expectItemCount(count: number) {
    await expect(this.cartItems).toHaveCount(count);
  }

  /** 断言: 购物车包含指定商品 */
  async expectContainsItem(itemName: string) {
    await expect(this.cartItemNames.filter({ hasText: itemName })).toBeVisible();
  }
}