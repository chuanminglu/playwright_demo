import { Page, Locator } from '@playwright/test';

/**
 * Swag Labs购物车页面对象模型
 * 对应页面: /cart.html
 * 测试用例: SWAG-CART-004, SWAG-CART-005
 */
export class SwagLabsCartPage {
  readonly page: Page;
  
  // 页面标识
  readonly pageTitle: Locator;
  
  // 商品列表
  readonly cartItems: Locator;
  readonly cartItemNames: Locator;
  readonly cartItemPrices: Locator;
  readonly cartItemQuantities: Locator;
  
  // 操作按钮
  readonly continueShoppingButton: Locator;
  readonly checkoutButton: Locator;
  readonly removeButtons: Locator;
  
  // 购物车徽章
  readonly cartBadge: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // 页面标识
    this.pageTitle = page.locator('.title');
    
    // 商品列表
    this.cartItems = page.locator('.cart_item');
    this.cartItemNames = page.locator('.inventory_item_name');
    this.cartItemPrices = page.locator('.inventory_item_price');
    this.cartItemQuantities = page.locator('.cart_quantity');
    
    // 操作按钮
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.removeButtons = page.locator('button[id^="remove-"]');
    
    // 购物车徽章
    this.cartBadge = page.locator('.shopping_cart_badge');
  }

  /**
   * 获取购物车中的商品数量
   */
  async getCartItemCount(): Promise<number> {
    return await this.cartItems.count();
  }

  /**
   * 获取购物车中所有商品名称
   */
  async getAllItemNames(): Promise<string[]> {
    return await this.cartItemNames.allTextContents();
  }

  /**
   * 获取购物车中所有商品价格
   */
  async getAllItemPrices(): Promise<string[]> {
    return await this.cartItemPrices.allTextContents();
  }

  /**
   * 获取购物车中所有商品数量
   */
  async getAllItemQuantities(): Promise<string[]> {
    return await this.cartItemQuantities.allTextContents();
  }

  /**
   * 通过商品名称移除商品
   * @param itemName - 商品名称
   */
  async removeItemByName(itemName: string): Promise<void> {
    const itemNameNormalized = itemName.toLowerCase().replace(/\s+/g, '-');
    const removeButton = this.page.locator(`button[id="remove-${itemNameNormalized}"]`);
    await removeButton.click();
  }

  /**
   * 点击继续购物按钮
   */
  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
  }

  /**
   * 点击结账按钮
   */
  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }

  /**
   * 验证购物车页面已加载
   */
  async isLoaded(): Promise<boolean> {
    try {
      await this.pageTitle.waitFor({ state: 'visible', timeout: 5000 });
      const title = await this.pageTitle.textContent();
      return title === 'Your Cart';
    } catch {
      return false;
    }
  }

  /**
   * 获取购物车徽章数字
   */
  async getCartBadgeCount(): Promise<string | null> {
    try {
      return await this.cartBadge.textContent();
    } catch {
      return null;
    }
  }

  /**
   * 验证商品是否在购物车中
   * @param itemName - 商品名称
   */
  async hasItem(itemName: string): Promise<boolean> {
    const allNames = await this.getAllItemNames();
    return allNames.includes(itemName);
  }

  /**
   * 验证购物车是否为空
   */
  async isEmpty(): Promise<boolean> {
    const count = await this.getCartItemCount();
    return count === 0;
  }
}
