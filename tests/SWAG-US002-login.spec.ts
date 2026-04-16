import { test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

// 测试数据常量
const VALID_USER = {
  username: 'standard_user',
  password: 'secret_sauce',
};

const ERROR_MESSAGES = {
  wrongPassword: 'Username and password do not match any user in this service',
  usernameRequired: 'Username is required',
  passwordRequired: 'Password is required',
};

test.describe('SWAG-US002 用户登录', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    console.log('前提条件: 打开登录页');
    await loginPage.goto();
  });

  test('SWAG-LOGIN-001 正确凭证登录成功跳转商品列表', async () => {
    console.log('步骤1: 输入正确用户名');
    console.log('步骤2: 输入正确密码');
    console.log('步骤3: 点击 Login 按钮');
    await loginPage.login(VALID_USER.username, VALID_USER.password);

    console.log('验证: URL 变为 /inventory.html，页面标题显示 Products');
    await loginPage.expectLoginSuccess();
  });

  test('SWAG-LOGIN-002 错误密码显示错误提示', async () => {
    console.log('步骤1: 输入用户名 standard_user');
    console.log('步骤2: 输入错误密码 wrong_password');
    console.log('步骤3: 点击 Login 按钮');
    await loginPage.login(VALID_USER.username, 'wrong_password');

    console.log('验证: 显示错误提示文案');
    await loginPage.expectLoginError(ERROR_MESSAGES.wrongPassword);
  });

  test('SWAG-LOGIN-003 用户名为空显示必填提示', async () => {
    console.log('步骤1: 用户名留空');
    console.log('步骤2: 输入密码 secret_sauce');
    console.log('步骤3: 点击 Login 按钮');
    await loginPage.login('', VALID_USER.password);

    console.log('验证: 显示用户名必填提示');
    await loginPage.expectLoginError(ERROR_MESSAGES.usernameRequired);
  });

  test('SWAG-LOGIN-004 密码为空显示必填提示', async () => {
    console.log('步骤1: 输入用户名 standard_user');
    console.log('步骤2: 密码留空');
    console.log('步骤3: 点击 Login 按钮');
    await loginPage.login(VALID_USER.username, '');

    console.log('验证: 显示密码必填提示');
    await loginPage.expectLoginError(ERROR_MESSAGES.passwordRequired);
  });

  test('SWAG-LOGIN-005 用户名和密码均为空显示用户名必填提示', async () => {
    console.log('步骤1: 用户名留空');
    console.log('步骤2: 密码留空');
    console.log('步骤3: 点击 Login 按钮');
    await loginPage.login('', '');

    console.log('验证: 显示用户名优先校验提示');
    await loginPage.expectLoginError(ERROR_MESSAGES.usernameRequired);
  });
});
