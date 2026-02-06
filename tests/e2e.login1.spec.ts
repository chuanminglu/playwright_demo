import { test, expect } from '@playwright/test';
import { LoginPage1 } from '../pages/LoginPage1';
import { InventoryPage } from '../pages/InventoryPage';

test.describe('用户登录功能测试 - LoginPage1', () => {
  test('验证用户能够成功登录系统', async ({ page }) => {
    // 页面对象实例化
    const loginPage = new LoginPage1(page);
    const inventoryPage = new InventoryPage(page);

    console.log('步骤1：打开SwagLabs网站');
    await loginPage.goto();

    console.log('步骤2：输入有效用户名和密码（standard_user / secret_sauce）');
    await loginPage.login('standard_user', 'secret_sauce');

    console.log('步骤3：点击登录按钮（已包含在login方法中）');
    
    console.log('步骤4：验证成功进入商品页面');
    await expect(page).toHaveURL(/.*inventory.html/);
    console.log('✅ 登录成功后页面跳转正确');

    console.log('步骤5：验证页面显示商品列表标题 "Products"');
    await expect(inventoryPage.pageTitle).toHaveText('Products');
    console.log('✅ 页面显示商品列表标题');

    console.log('测试完成：用户登录功能验证通过');
  });
});
