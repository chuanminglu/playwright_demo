import { test, expect } from '@playwright/test';
import { Login3Page } from '../pages/Login3Page';

test.describe('用户登录功能测试', () => {
  test('验证用户能够成功登录系统', async ({ page }) => {
    const loginPage = new Login3Page(page);
    
    console.log('步骤1：打开SwagLabs网站');
    await loginPage.goto();
    
    console.log('步骤2：输入有效用户名和密码（standard_user / secret_sauce）');
    await loginPage.fillUsername('standard_user');
    await loginPage.fillPassword('secret_sauce');
    
    console.log('步骤3：点击登录按钮');
    await loginPage.clickLogin();
    
    console.log('步骤4：验证成功进入商品页面');
    await expect(page).toHaveURL(/.*inventory.html/);
    
    const pageTitle = page.locator('.title');
    await expect(pageTitle).toHaveText('Products');
    
    console.log('✅ 测试通过：用户成功登录系统');
  });

  test('使用便捷方法完成登录流程', async ({ page }) => {
    const loginPage = new Login3Page(page);
    
    console.log('步骤1：打开SwagLabs网站');
    await loginPage.goto();
    
    console.log('步骤2-3：使用login方法完成登录');
    await loginPage.login('standard_user', 'secret_sauce');
    
    console.log('步骤4：验证登录成功');
    await expect(page).toHaveURL(/.*inventory.html/);
    await expect(page.locator('.title')).toHaveText('Products');
    
    console.log('✅ 测试通过：一站式登录方法验证成功');
  });

  test('验证登录错误消息显示', async ({ page }) => {
    const loginPage = new Login3Page(page);
    
    console.log('步骤1：打开登录页面');
    await loginPage.goto();
    
    console.log('步骤2：使用无效凭据登录');
    await loginPage.login('invalid_user', 'invalid_password');
    
    console.log('步骤3：验证错误消息是否显示');
    const isErrorVisible = await loginPage.isErrorMessageVisible();
    expect(isErrorVisible).toBeTruthy();
    
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain('Epic sadface');
    
    console.log('✅ 测试通过：错误消息正确显示');
  });
});
