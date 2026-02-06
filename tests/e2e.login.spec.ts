import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';

test.describe('用户登录功能测试', () => {
  test('验证用户能够成功登录系统', async ({ page }) => {
    // 页面对象实例化
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    console.log('步骤1：打开SwagLabs网站');
    await loginPage.goto();

    console.log('步骤2：输入有效用户名和密码');
    await loginPage.login('standard_user', 'secret_sauce');

    console.log('步骤3：验证成功进入商品页面');
    await expect(page).toHaveURL(/.*inventory.html/);
    console.log('✅ 登录成功后页面跳转正确');

    console.log('步骤4：验证页面显示商品列表标题');
    await expect(inventoryPage.pageTitle).toHaveText('Products');
    console.log('✅ 页面显示商品列表标题');

    console.log('测试完成：用户登录功能验证通过');
  });
});
