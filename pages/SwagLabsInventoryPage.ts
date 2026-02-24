import { type Locator, type Page } from '@playwright/test';

/**
 * Swag Labs商品页面对象模型
 * 
 * 页面元素分析：
 * - 页面标题: class="title", text="Products"
 * - 商品容器: class="inventory_list"
 * - 商品卡片: class="inventory_item"
 * - 商品名称: class="inventory_item_name"
 * - 商品描述: class="inventory_item_desc"
 * - 商品价格: class="inventory_item_price"
 * - 添加购物车按钮: data-test="add-to-cart-{product-name}"
 * - 购物车图标: class="shopping_cart_link"
 * - 购物车徽章: class="shopping_cart_badge"
 * - 排序下拉框: class="product_sort_container", data-test="product_sort_container"
 * - 菜单按钮: id="react-burger-menu-btn"
 */
export class SwagLabsInventoryPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly inventoryList: Locator;
  readonly inventoryItems: Locator;
  readonly shoppingCartLink: Locator;
  readonly shoppingCartBadge: Locator;
  readonly sortDropdown: Locator;
  readonly menuButton: Locator;
  readonly logoutLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('.title');
    this.inventoryList = page.locator('.inventory_list');
    this.inventoryItems = page.locator('.inventory_item');
    this.shoppingCartLink = page.locator('.shopping_cart_link');
    this.shoppingCartBadge = page.locator('.shopping_cart_badge');
    this.sortDropdown = page.locator('[data-test="product_sort_container"]');
    this.menuButton = page.locator('#react-burger-menu-btn');
    this.logoutLink = page.locator('#logout_sidebar_link');
  }

  /**
   * 直接导航到商品页面（需要已登录）
   */
  async goto() {
    await this.page.goto('https://www.saucedemo.com/inventory.html');
  }

  /**
   * 根据商品名称添加到购物车
   * @param productName 商品名称（如: "Sauce Labs Backpack"）
   */
  async addItemToCartByName(productName: string) {
    const kebabName = productName.toLowerCase().replace(/\s+/g, '-');
    await this.page.locator(`[data-test="add-to-cart-${kebabName}"]`).click();
  }

  /**
   * 根据商品名称从购物车移除
   * @param productName 商品名称
   */
  async removeItemFromCartByName(productName: string) {
    const kebabName = productName.toLowerCase().replace(/\s+/g, '-');
    await this.page.locator(`[data-test="remove-${kebabName}"]`).click();
  }

  /**
   * 根据索引添加商品到购物车（从0开始）
   * @param index 商品索引
   */
  async addItemToCartByIndex(index: number) {
    await this.inventoryItems.nth(index).locator('button').first().click();
  }

  /**
   * 点击购物车图标进入购物车页面
   */
  async gotoCart() {
    await this.shoppingCartLink.click();
  }

  /**
   * 获取购物车商品数量
   * @returns 购物车中的商品数量
   */
  async getCartItemCount(): Promise<number> {
    const isVisible = await this.shoppingCartBadge.isVisible();
    if (!isVisible) return 0;
    const text = await this.shoppingCartBadge.textContent();
    return text ? parseInt(text) : 0;
  }

  /**
   * 获取所有商品名称列表
   * @returns 商品名称数组
   */
  async getAllProductNames(): Promise<string[]> {
    const nameLocators = this.page.locator('.inventory_item_name');
    const count = await nameLocators.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const name = await nameLocators.nth(i).textContent();
      if (name) names.push(name);
    }
    return names;
  }

  /**
   * 获取所有商品价格列表
   * @returns 商品价格数组（数字）
   */
  async getAllProductPrices(): Promise<number[]> {
    const priceLocators = this.page.locator('.inventory_item_price');
    const count = await priceLocators.count();
    const prices: number[] = [];
    for (let i = 0; i < count; i++) {
      const priceText = await priceLocators.nth(i).textContent();
      if (priceText) {
        const price = parseFloat(priceText.replace('$', ''));
        prices.push(price);
      }
    }
    return prices;
  }

  /**
   * 根据商品名称点击进入详情页
   * @param productName 商品名称
   */
  async clickProductByName(productName: string) {
    await this.page.locator('.inventory_item_name', { hasText: productName }).click();
  }

  /**
   * 根据商品索引点击进入详情页
   * @param index 商品索引
   */
  async clickProductByIndex(index: number) {
    await this.inventoryItems.nth(index).locator('.inventory_item_name').click();
  }

  /**
   * 设置商品排序方式
   * @param sortType 排序类型: "az" | "za" | "lohi" | "hilo"
   */
  async sortProducts(sortType: 'az' | 'za' | 'lohi' | 'hilo') {
    const sortValues = {
      az: 'az',
      za: 'za',
      lohi: 'lohi',
      hilo: 'hilo'
    };
    await this.sortDropdown.selectOption(sortValues[sortType]);
  }

  /**
   * 打开侧边菜单
   */
  async openMenu() {
    await this.menuButton.click();
  }

  /**
   * 执行登出操作
   */
  async logout() {
    await this.openMenu();
    await this.logoutLink.click();
  }

  /**
   * 获取页面显示的商品数量
   * @returns 商品数量
   */
  async getProductCount(): Promise<number> {
    return await this.inventoryItems.count();
  }

  /**
   * 检查商品是否在购物车中（通过按钮文本判断）
   * @param productName 商品名称
   * @returns 是否已添加到购物车
   */
  async isItemInCart(productName: string): Promise<boolean> {
    const kebabName = productName.toLowerCase().replace(/\s+/g, '-');
    const removeButton = this.page.locator(`[data-test="remove-${kebabName}"]`);
    return await removeButton.isVisible();
  }

  /**
   * 添加多个商品到购物车
   * @param productNames 商品名称数组
   */
  async addMultipleItemsToCart(productNames: string[]) {
    for (const name of productNames) {
      await this.addItemToCartByName(name);
    }
  }

  /**
   * 验证页面标题是否为"Products"
   * @returns 标题是否正确
   */
  async hasCorrectTitle(): Promise<boolean> {
    const title = await this.pageTitle.textContent();
    return title === 'Products';
  }
}
