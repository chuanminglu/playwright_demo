import { test, expect } from '@playwright/test';
import { SwagLabsLoginPage } from '../pages/SwagLabsLoginPage';
import { SwagLabsInventoryPage } from '../pages/SwagLabsInventoryPage';
import { SwagLabsCartPage } from '../pages/SwagLabsCartPage';
import { SwagLabsCheckoutPage } from '../pages/SwagLabsCheckoutPage';

/**
 * Swag Labs完整E2E测试套件
 * 基于测试用例文档: docs/test-cases/SwagLabs-E2E测试用例.md
 * 覆盖15个测试用例，涵盖登录、购物车、商品浏览、结账、系统功能5大模块
 */

test.describe('Swag Labs E2E测试套件', () => {
  let loginPage: SwagLabsLoginPage;
  let inventoryPage: SwagLabsInventoryPage;
  let cartPage: SwagLabsCartPage;
  let checkoutPage: SwagLabsCheckoutPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new SwagLabsLoginPage(page);
    inventoryPage = new SwagLabsInventoryPage(page);
    cartPage = new SwagLabsCartPage(page);
    checkoutPage = new SwagLabsCheckoutPage(page);
    
    await page.goto('https://www.saucedemo.com/');
  });

  test.describe('1️⃣ 用户登录模块', () => {
    test('[SWAG-LOGIN-001] P0 - 标准用户正常登录', async () => {
      console.log('📋 测试用例: SWAG-LOGIN-001 - 标准用户正常登录');
      
      // 输入数据或操作
      await loginPage.login('standard_user', 'secret_sauce');
      
      // 预期结果验证
      await expect(inventoryPage.page).toHaveURL(/.*inventory.html/);
      await expect(inventoryPage.pageTitle).toBeVisible();
      await expect(inventoryPage.pageTitle).toHaveText('Products');
      
      const itemCount = await inventoryPage.getAllProductNames();
      expect(itemCount.length).toBeGreaterThan(0);
      
      console.log('✅ 测试通过: 用户成功登录，商品列表显示正常');
    });

    test('[SWAG-LOGIN-002] P1 - 无效用户名登录失败', async () => {
      console.log('📋 测试用例: SWAG-LOGIN-002 - 无效用户名登录失败');
      
      // 输入数据或操作
      await loginPage.login('invalid_user', 'secret_sauce');
      
      // 预期结果验证
      await expect(loginPage.page).toHaveURL(/.*saucedemo.com\/?$/);
      
      const errorMessage = await loginPage.getErrorMessage();
      expect(errorMessage).toContain('Username and password do not match');
      
      await expect(loginPage.errorMessageContainer).toBeVisible();
      await expect(loginPage.usernameInput).toHaveClass(/error/);
      
      console.log('✅ 测试通过: 无效用户名拒绝登录，错误提示正常');
    });

    test('[SWAG-LOGIN-003] P1 - 锁定用户登录失败', async () => {
      console.log('📋 测试用例: SWAG-LOGIN-003 - 锁定用户登录失败');
      
      // 输入数据或操作
      await loginPage.login('locked_out_user', 'secret_sauce');
      
      // 预期结果验证
      await expect(loginPage.page).toHaveURL(/.*saucedemo.com\/?$/);
      
      const errorMessage = await loginPage.getErrorMessage();
      expect(errorMessage).toContain('Sorry, this user has been locked out');
      
      // 验证可以关闭错误消息
      const hasError = await loginPage.isErrorMessageVisible();
      expect(hasError).toBe(true);
      
      await loginPage.closeErrorMessage();
      const hasErrorAfter = await loginPage.isErrorMessageVisible();
      expect(hasErrorAfter).toBe(false);
      
      console.log('✅ 测试通过: 锁定用户拒绝登录，错误提示可关闭');
    });
  });

  test.describe('2️⃣ 购物车管理模块', () => {
    test.beforeEach(async () => {
      // 登录前置条件
      await loginPage.loginAsStandardUser();
      await expect(inventoryPage.pageTitle).toBeVisible();
    });

    test('[SWAG-CART-001] P0 - 添加单个商品到购物车', async () => {
      console.log('📋 测试用例: SWAG-CART-001 - 添加单个商品到购物车');
      
      // 输入数据或操作
      await inventoryPage.addItemToCartByName('Sauce Labs Backpack');
      
      // 预期结果验证
      const removeButton = inventoryPage.page.locator('button[id="remove-sauce-labs-backpack"]');
      await expect(removeButton).toBeVisible();
      await expect(removeButton).toHaveText('Remove');
      
      const cartCount = await inventoryPage.getCartItemCount();
      expect(cartCount).toBe('1');
      
      console.log('✅ 测试通过: 商品添加到购物车，按钮状态更新');
    });

    test('[SWAG-CART-002] P0 - 批量添加多个商品到购物车', async () => {
      console.log('📋 测试用例: SWAG-CART-002 - 批量添加多个商品到购物车');
      
      // 输入数据或操作
      await inventoryPage.addItemToCartByName('Sauce Labs Backpack');
      await inventoryPage.addItemToCartByName('Sauce Labs Bike Light');
      await inventoryPage.addItemToCartByName('Sauce Labs Bolt T-Shirt');
      
      // 预期结果验证
      const cartCount = await inventoryPage.getCartItemCount();
      expect(cartCount).toBe('3');
      
      // 验证所有按钮都变为Remove
      const backpackBtn = inventoryPage.page.locator('button[id="remove-sauce-labs-backpack"]');
      const bikeLightBtn = inventoryPage.page.locator('button[id="remove-sauce-labs-bike-light"]');
      const tshirtBtn = inventoryPage.page.locator('button[id="remove-sauce-labs-bolt-t-shirt"]');
      
      await expect(backpackBtn).toHaveText('Remove');
      await expect(bikeLightBtn).toHaveText('Remove');
      await expect(tshirtBtn).toHaveText('Remove');
      
      console.log('✅ 测试通过: 3个商品成功添加，购物车数量正确');
    });

    test('[SWAG-CART-003] P1 - 从商品列表移除已添加商品', async () => {
      console.log('📋 测试用例: SWAG-CART-003 - 从商品列表移除已添加商品');
      
      // 前置条件: 购物车有1个商品
      await inventoryPage.addItemToCartByName('Sauce Labs Backpack');
      let cartCount = await inventoryPage.getCartItemCount();
      expect(cartCount).toBe('1');
      
      // 输入数据或操作
      await inventoryPage.removeItemFromCartByName('Sauce Labs Backpack');
      
      // 预期结果验证
      const addButton = inventoryPage.page.locator('button[id="add-to-cart-sauce-labs-backpack"]');
      await expect(addButton).toBeVisible();
      await expect(addButton).toHaveText('Add to cart');
      
      cartCount = await inventoryPage.getCartItemCount();
      expect(cartCount).toBe('');  // 购物车为空时徽章不显示
      
      console.log('✅ 测试通过: 商品从购物车移除，按钮状态恢复');
    });

    test('[SWAG-CART-004] P1 - 购物车页面移除商品', async ({ page }) => {
      console.log('📋 测试用例: SWAG-CART-004 - 购物车页面移除商品');
      
      // 前置条件: 购物车有2个商品
      await inventoryPage.addItemToCartByName('Sauce Labs Backpack');
      await inventoryPage.addItemToCartByName('Sauce Labs Bike Light');
      
      // 输入数据或操作: 进入购物车页面
      await inventoryPage.gotoCart();
      await expect(page).toHaveURL(/.*cart.html/);
      
      const itemCountBefore = await cartPage.getCartItemCount();
      expect(itemCountBefore).toBe(2);
      
      // 移除一个商品
      await cartPage.removeItemByName('Sauce Labs Backpack');
      
      // 预期结果验证
      const itemCountAfter = await cartPage.getCartItemCount();
      expect(itemCountAfter).toBe(1);
      
      const cartBadge = await cartPage.getCartBadgeCount();
      expect(cartBadge).toBe('1');
      
      const hasBackpack = await cartPage.hasItem('Sauce Labs Backpack');
      expect(hasBackpack).toBe(false);
      
      console.log('✅ 测试通过: 购物车页面商品移除成功');
    });

    test('[SWAG-CART-005] P0 - 购物车页面信息验证', async ({ page }) => {
      console.log('📋 测试用例: SWAG-CART-005 - 购物车页面信息验证');
      
      // 前置条件: 购物车有2个商品
      await inventoryPage.addItemToCartByName('Sauce Labs Backpack');
      await inventoryPage.addItemToCartByName('Sauce Labs Bike Light');
      
      // 输入数据或操作
      await inventoryPage.gotoCart();
      
      // 预期结果验证
      await expect(page).toHaveURL(/.*cart.html/);
      await expect(cartPage.pageTitle).toHaveText('Your Cart');
      
      const itemCount = await cartPage.getCartItemCount();
      expect(itemCount).toBe(2);
      
      const itemNames = await cartPage.getAllItemNames();
      expect(itemNames).toContain('Sauce Labs Backpack');
      expect(itemNames).toContain('Sauce Labs Bike Light');
      
      const itemPrices = await cartPage.getAllItemPrices();
      expect(itemPrices.length).toBe(2);
      expect(itemPrices[0]).toMatch(/\$\d+\.\d{2}/);  // 价格格式验证
      
      const quantities = await cartPage.getAllItemQuantities();
      expect(quantities.every(q => q === '1')).toBe(true);  // 默认数量为1
      
      await expect(cartPage.continueShoppingButton).toBeVisible();
      await expect(cartPage.checkoutButton).toBeVisible();
      
      console.log('✅ 测试通过: 购物车页面所有信息正确显示');
    });
  });

  test.describe('3️⃣ 商品浏览模块', () => {
    test.beforeEach(async () => {
      await loginPage.loginAsStandardUser();
      await expect(inventoryPage.pageTitle).toBeVisible();
    });

    test('[SWAG-INV-001] P1 - 按名称A-Z排序', async () => {
      console.log('📋 测试用例: SWAG-INV-001 - 按名称A-Z排序');
      
      // 输入数据或操作
      await inventoryPage.sortProducts('az');
      
      // 预期结果验证
      const productNames = await inventoryPage.getAllProductNames();
      expect(productNames.length).toBeGreaterThan(0);
      
      // 验证第一个商品
      expect(productNames[0]).toBe('Sauce Labs Backpack');
      
      // 验证排序正确性
      const sortedNames = [...productNames].sort();
      expect(productNames).toEqual(sortedNames);
      
      console.log('✅ 测试通过: 商品按名称A-Z正确排序');
    });

    test('[SWAG-INV-002] P1 - 按价格从低到高排序', async () => {
      console.log('📋 测试用例: SWAG-INV-002 - 按价格从低到高排序');
      
      // 输入数据或操作
      await inventoryPage.sortProducts('lohi');
      
      // 预期结果验证
      const productPrices = await inventoryPage.getAllProductPrices();
      
      // 提取价格数字
      const prices = productPrices.map(p => parseFloat(p.replace('$', '')));
      
      // 验证第一个商品价格最低
      expect(prices[0]).toBe(7.99);
      
      // 验证价格递增
      for (let i = 0; i < prices.length - 1; i++) {
        expect(prices[i]).toBeLessThanOrEqual(prices[i + 1]);
      }
      
      console.log('✅ 测试通过: 商品按价格从低到高正确排序');
    });

    test('[SWAG-INV-003] P0 - 点击商品进入详情页', async ({ page }) => {
      console.log('📋 测试用例: SWAG-INV-003 - 点击商品进入详情页');
      
      // 输入数据或操作
      await inventoryPage.clickProductByName('Sauce Labs Backpack');
      
      // 预期结果验证
      await expect(page).toHaveURL(/.*inventory-item.html/);
      
      const detailName = page.locator('.inventory_details_name');
      await expect(detailName).toHaveText('Sauce Labs Backpack');
      
      const detailImg = page.locator('.inventory_details_img');
      await expect(detailImg).toBeVisible();
      
      const detailDesc = page.locator('.inventory_details_desc');
      await expect(detailDesc).toBeVisible();
      
      const addToCartBtn = page.locator('button[id^="add-to-cart-"]');
      await expect(addToCartBtn).toBeVisible();
      
      const backBtn = page.locator('[data-test="back-to-products"]');
      await expect(backBtn).toBeVisible();
      
      console.log('✅ 测试通过: 商品详情页所有元素正确显示');
    });

    test('[SWAG-INV-004] P0 - 从详情页添加商品到购物车', async ({ page }) => {
      console.log('📋 测试用例: SWAG-INV-004 - 从详情页添加商品到购物车');
      
      // 前置条件: 进入商品详情页
      await inventoryPage.clickProductByName('Sauce Labs Backpack');
      await expect(page).toHaveURL(/.*inventory-item.html/);
      
      // 输入数据或操作
      const addToCartBtn = page.locator('button[id^="add-to-cart-"]');
      await addToCartBtn.click();
      
      // 预期结果验证
      const removeBtn = page.locator('button[id^="remove-"]');
      await expect(removeBtn).toBeVisible();
      await expect(removeBtn).toHaveText('Remove');
      
      const cartBadge = page.locator('.shopping_cart_badge');
      await expect(cartBadge).toHaveText('1');
      
      console.log('✅ 测试通过: 详情页添加商品成功');
    });
  });

  test.describe('4️⃣ 订单结账模块', () => {
    test.beforeEach(async () => {
      await loginPage.loginAsStandardUser();
      await expect(inventoryPage.pageTitle).toBeVisible();
      
      // 添加商品到购物车
      await inventoryPage.addItemToCartByName('Sauce Labs Backpack');
      await inventoryPage.addItemToCartByName('Sauce Labs Bike Light');
    });

    test('[SWAG-CHK-001] P0 - 完成完整结账流程', async ({ page }) => {
      console.log('📋 测试用例: SWAG-CHK-001 - 完成完整结账流程');
      
      // Step 1: 进入购物车
      await inventoryPage.gotoCart();
      await expect(page).toHaveURL(/.*cart.html/);
      
      // Step 2: 点击Checkout
      await cartPage.checkout();
      await expect(page).toHaveURL(/.*checkout-step-one.html/);
      
      // Step 3: 填写结账信息
      await checkoutPage.fillCheckoutInformation('John', 'Doe', '12345');
      await checkoutPage.continue();
      await expect(page).toHaveURL(/.*checkout-step-two.html/);
      
      // Step 4: 验证订单概览
      const itemCount = await checkoutPage.getOrderItemCount();
      expect(itemCount).toBe(2);
      
      const paymentInfo = await checkoutPage.getPaymentInfo();
      expect(paymentInfo).toBeTruthy();
      
      const shippingInfo = await checkoutPage.getShippingInfo();
      expect(shippingInfo).toBeTruthy();
      
      const itemTotal = await checkoutPage.getItemTotal();
      expect(itemTotal).toContain('$');
      
      // Step 5: 完成订单
      await checkoutPage.finish();
      await expect(page).toHaveURL(/.*checkout-complete.html/);
      
      // Step 6: 验证完成页面
      const completeHeader = await checkoutPage.getCompleteHeader();
      expect(completeHeader).toContain('Thank you for your order');
      
      await expect(checkoutPage.backHomeButton).toBeVisible();
      
      console.log('✅ 测试通过: 完整结账流程执行成功');
    });

    test('[SWAG-CHK-002] P1 - 结账信息必填项验证', async ({ page }) => {
      console.log('📋 测试用例: SWAG-CHK-002 - 结账信息必填项验证');
      
      // 前置条件: 进入结账信息页
      await inventoryPage.gotoCart();
      await cartPage.checkout();
      await expect(page).toHaveURL(/.*checkout-step-one.html/);
      
      // 输入数据或操作: 不填First Name，直接Continue
      await checkoutPage.continue();
      
      // 预期结果验证
      await expect(page).toHaveURL(/.*checkout-step-one.html/);
      
      const hasError = await checkoutPage.hasErrorMessage();
      expect(hasError).toBe(true);
      
      const errorMessage = await checkoutPage.getErrorMessage();
      expect(errorMessage).toContain('First Name is required');
      
      console.log('✅ 测试通过: 必填项验证生效');
    });

    test('[SWAG-CHK-003] P0 - 订单概览页信息正确性', async ({ page }) => {
      console.log('📋 测试用例: SWAG-CHK-003 - 订单概览页信息正确性');
      
      // 前置条件: 完成信息填写，进入概览页
      await inventoryPage.gotoCart();
      await cartPage.checkout();
      await checkoutPage.fillCheckoutInformation('John', 'Doe', '12345');
      await checkoutPage.continue();
      await expect(page).toHaveURL(/.*checkout-step-two.html/);
      
      // 预期结果验证
      const itemCount = await checkoutPage.getOrderItemCount();
      expect(itemCount).toBe(2);
      
      const paymentInfo = await checkoutPage.getPaymentInfo();
      expect(paymentInfo).not.toBeNull();
      
      const shippingInfo = await checkoutPage.getShippingInfo();
      expect(shippingInfo).not.toBeNull();
      
      const itemTotal = await checkoutPage.getItemTotal();
      const taxAmount = await checkoutPage.getTaxAmount();
      const totalAmount = await checkoutPage.getTotalAmount();
      
      expect(itemTotal).toContain('Item total:');
      expect(taxAmount).toContain('Tax:');
      expect(totalAmount).toContain('Total:');
      
      // 验证价格计算正确性
      const isPriceCorrect = await checkoutPage.validatePriceCalculation();
      expect(isPriceCorrect).toBe(true);
      
      console.log('✅ 测试通过: 订单概览页所有信息正确');
    });
  });

  test.describe('5️⃣ 系统功能模块', () => {
    test.beforeEach(async () => {
      await loginPage.loginAsStandardUser();
      await expect(inventoryPage.pageTitle).toBeVisible();
    });

    test('[SWAG-SYS-001] P0 - 用户正常登出', async ({ page }) => {
      console.log('📋 测试用例: SWAG-SYS-001 - 用户正常登出');
      
      // 输入数据或操作
      await inventoryPage.logout();
      
      // 预期结果验证
      await expect(page).toHaveURL(/.*saucedemo.com\/?$/);
      await expect(loginPage.usernameInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
      await expect(loginPage.loginButton).toBeVisible();
      
      console.log('✅ 测试通过: 用户成功登出，返回登录页');
    });

    test('[SWAG-SYS-002] P2 - 侧边菜单功能验证', async ({ page }) => {
      console.log('📋 测试用例: SWAG-SYS-002 - 侧边菜单功能验证');
      
      // 输入数据或操作: 打开菜单
      const menuButton = page.locator('#react-burger-menu-btn');
      await menuButton.click();
      
      // 预期结果验证: 验证菜单项
      const allItemsLink = page.locator('#inventory_sidebar_link');
      const aboutLink = page.locator('#about_sidebar_link');
      const logoutLink = page.locator('#logout_sidebar_link');
      const resetLink = page.locator('#reset_sidebar_link');
      
      await expect(allItemsLink).toBeVisible();
      await expect(aboutLink).toBeVisible();
      await expect(logoutLink).toBeVisible();
      await expect(resetLink).toBeVisible();
      
      // 验证菜单可关闭
      const closeButton = page.locator('#react-burger-cross-btn');
      await closeButton.click();
      
      await expect(allItemsLink).not.toBeVisible();
      
      console.log('✅ 测试通过: 侧边菜单所有功能正常');
    });
  });
});
