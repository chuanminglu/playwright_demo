import { expect, type Locator, type Page } from '@playwright/test';

/**
 * 商品列表页 Page Object
 * URL: /inventory.html
 *
 * 覆盖用例: TC-02-01 ~ TC-02-03, TC-03-01 ~ TC-03-03
 */
export class InventoryPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly shoppingCartBadge: Locator;
  readonly shoppingCartLink: Locator;
  readonly inventoryItems: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly sortDropdown: Locator;
  readonly menuButton: Locator;
  readonly logoutLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('.title');
    this.shoppingCartBadge = page.locator('.shopping_cart_badge');
    this.shoppingCartLink = page.locator('.shopping_cart_link');
    this.inventoryItems = page.locator('.inventory_item');
    this.itemNames = page.locator('.inventory_item_name');
    this.itemPrices = page.locator('.inventory_item_price');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    this.menuButton = page.locator('#react-burger-menu-btn');
    this.logoutLink = page.locator('#logout_sidebar_link');
  }

  /** 添加指定商品到购物车 */
  async addItemToCart(itemName: string) {
    const itemId = itemName.toLowerCase().replace(/ /g, '-');
    await this.page.locator(`[data-test="add-to-cart-${itemId}"]`).click();
  }

  /** 从商品列表页移除购物车中的商品 */
  async removeItemFromCart(itemName: string) {
    const itemId = itemName.toLowerCase().replace(/ /g, '-');
    await this.page.locator(`[data-test="remove-${itemId}"]`).click();
  }

  /** 进入购物车页 */
  async gotoCart() {
    await this.shoppingCartLink.click();
  }

  /** 选择排序方式 */
  async sortBy(option: 'az' | 'za' | 'lohi' | 'hilo') {
    const values: Record<string, string> = {
      az: 'az',
      za: 'za',
      lohi: 'lohi',
      hilo: 'hilo',
    };
    await this.sortDropdown.selectOption(values[option]);
  }

  /** 打开汉堡菜单并登出 */
  async logout() {
    await this.menuButton.click();
    await this.logoutLink.waitFor({ state: 'visible' });
    await this.logoutLink.click();
  }

  /** 获取第N个商品名称（0-based） */
  async getItemNameAt(index: number): Promise<string> {
    return (await this.itemNames.nth(index).textContent()) ?? '';
  }

  /** 获取第N个商品价格（0-based） */
  async getItemPriceAt(index: number): Promise<string> {
    return (await this.itemPrices.nth(index).textContent()) ?? '';
  }

  /** 断言: 页面标题为 Products */
  async expectPageLoaded() {
    await expect(this.pageTitle).toHaveText('Products');
  }

  /** 断言: 商品数量 */
  async expectItemCount(count: number) {
    await expect(this.inventoryItems).toHaveCount(count);
  }

  /** 断言: 购物车徽标数字 */
  async expectCartBadge(count: string) {
    await expect(this.shoppingCartBadge).toHaveText(count);
  }

  /** 断言: 购物车徽标不存在（空购物车） */
  async expectCartEmpty() {
    await expect(this.shoppingCartBadge).not.toBeVisible();
  }
}