import { test, expect } from '@playwright/test';
import { SwagLabsLoginPage } from '../pages/SwagLabsLoginPage';
import { SwagLabsInventoryPage } from '../pages/SwagLabsInventoryPage';

test.describe('Swag Labs E2E测试套件', () => {
  
  test('完整购物流程 - 登录到添加商品', async ({ page }) => {
    const loginPage = new SwagLabsLoginPage(page);
    const inventoryPage = new SwagLabsInventoryPage(page);
    
    console.log('步骤1：访问Swag Labs登录页面');
    await loginPage.goto();
    
    console.log('步骤2：使用标准用户登录');
    await loginPage.loginAsStandardUser();
    
    console.log('步骤3：验证成功进入商品页面');
    await expect(page).toHaveURL(/.*inventory.html/);
    await expect(inventoryPage.pageTitle).toHaveText('Products');
    
    console.log('步骤4：添加Sauce Labs Backpack到购物车');
    await inventoryPage.addItemToCartByName('Sauce Labs Backpack');
    
    console.log('步骤5：验证购物车徽章显示1');
    const cartCount = await inventoryPage.getCartItemCount();
    expect(cartCount).toBe(1);
    
    console.log('步骤6：添加Sauce Labs Bike Light到购物车');
    await inventoryPage.addItemToCartByName('Sauce Labs Bike Light');
    
    console.log('步骤7：验证购物车徽章显示2');
    const updatedCount = await inventoryPage.getCartItemCount();
    expect(updatedCount).toBe(2);
    
    console.log('✅ 测试通过：完整购物流程验证成功');
  });

  test('商品排序功能验证', async ({ page }) => {
    const loginPage = new SwagLabsLoginPage(page);
    const inventoryPage = new SwagLabsInventoryPage(page);
    
    console.log('步骤1：登录系统');
    await loginPage.goto();
    await loginPage.loginAsStandardUser();
    
    console.log('步骤2：获取默认排序的商品名称');
    const defaultNames = await inventoryPage.getAllProductNames();
    
    console.log('步骤3：按名称Z-A排序');
    await inventoryPage.sortProducts('za');
    
    console.log('步骤4：验证排序结果');
    const sortedNames = await inventoryPage.getAllProductNames();
    const expectedOrder = [...defaultNames].sort().reverse();
    expect(sortedNames[0]).toBe(expectedOrder[0]);
    
    console.log('步骤5：按价格从低到高排序');
    await inventoryPage.sortProducts('lohi');
    
    console.log('步骤6：验证价格排序');
    const prices = await inventoryPage.getAllProductPrices();
    for (let i = 0; i < prices.length - 1; i++) {
      expect(prices[i]).toBeLessThanOrEqual(prices[i + 1]);
    }
    
    console.log('✅ 测试通过：商品排序功能验证成功');
  });

  test('批量添加商品到购物车', async ({ page }) => {
    const loginPage = new SwagLabsLoginPage(page);
    const inventoryPage = new SwagLabsInventoryPage(page);
    
    console.log('步骤1：登录系统');
    await loginPage.goto();
    await loginPage.loginAsStandardUser();
    
    console.log('步骤2：批量添加3个商品');
    await inventoryPage.addMultipleItemsToCart([
      'Sauce Labs Backpack',
      'Sauce Labs Bike Light',
      'Sauce Labs Bolt T-Shirt'
    ]);
    
    console.log('步骤3：验证购物车数量为3');
    const cartCount = await inventoryPage.getCartItemCount();
    expect(cartCount).toBe(3);
    
    console.log('步骤4：验证商品已在购物车中');
    const isBackpackInCart = await inventoryPage.isItemInCart('Sauce Labs Backpack');
    expect(isBackpackInCart).toBe(true);
    
    console.log('✅ 测试通过：批量添加商品验证成功');
  });

  test('登录失败场景验证', async ({ page }) => {
    const loginPage = new SwagLabsLoginPage(page);
    
    console.log('步骤1：访问登录页面');
    await loginPage.goto();
    
    console.log('步骤2：使用无效凭据登录');
    await loginPage.login('invalid_user', 'invalid_password');
    
    console.log('步骤3：验证错误消息显示');
    const isErrorVisible = await loginPage.isErrorMessageVisible();
    expect(isErrorVisible).toBe(true);
    
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain('Epic sadface');
    
    console.log('步骤4：关闭错误消息');
    await loginPage.closeErrorMessage();
    
    console.log('步骤5：验证错误消息已消失');
    const isStillVisible = await loginPage.isErrorMessageVisible();
    expect(isStillVisible).toBe(false);
    
    console.log('✅ 测试通过：登录失败场景验证成功');
  });

  test('登出功能验证', async ({ page }) => {
    const loginPage = new SwagLabsLoginPage(page);
    const inventoryPage = new SwagLabsInventoryPage(page);
    
    console.log('步骤1：登录系统');
    await loginPage.goto();
    await loginPage.loginAsStandardUser();
    
    console.log('步骤2：验证进入商品页面');
    await expect(inventoryPage.pageTitle).toHaveText('Products');
    
    console.log('步骤3：执行登出操作');
    await inventoryPage.logout();
    
    console.log('步骤4：验证返回登录页面');
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(loginPage.loginButton).toBeVisible();
    
    console.log('✅ 测试通过：登出功能验证成功');
  });

  test('商品详情页导航验证', async ({ page }) => {
    const loginPage = new SwagLabsLoginPage(page);
    const inventoryPage = new SwagLabsInventoryPage(page);
    
    console.log('步骤1：登录系统');
    await loginPage.goto();
    await loginPage.loginAsStandardUser();
    
    console.log('步骤2：点击第一个商品');
    await inventoryPage.clickProductByIndex(0);
    
    console.log('步骤3：验证进入商品详情页');
    await expect(page).toHaveURL(/.*inventory-item.html/);
    
    console.log('步骤4：返回商品列表页');
    await page.goBack();
    
    console.log('步骤5：验证返回商品页面');
    await expect(inventoryPage.pageTitle).toHaveText('Products');
    
    console.log('✅ 测试通过：商品详情页导航验证成功');
  });
});
