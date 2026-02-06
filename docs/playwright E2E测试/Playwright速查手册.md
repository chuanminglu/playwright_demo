# Playwright E2E测试速查手册

> **📌 使用说明**: 学员实操时的快速参考指南，涵盖最常用的API和语法

---

## 🚀 快速开始

### 项目初始化
```bash
# 创建新项目
npm init playwright@latest

# 安装依赖  
npm install
npx playwright install

# 运行测试
npm test                 # 无头模式
npm run test:headed      # 有头模式
npm run test:ui         # UI调试模式
```

### 基础测试结构
```typescript
import { test, expect } from '@playwright/test';

test.describe('测试套件名称', () => {
  test('测试用例描述', async ({ page }) => {
    // 测试代码
  });
});
```

---

## 🎯 页面操作

### 页面导航
```typescript
await page.goto('https://example.com');           // 访问页面
await page.goBack();                               // 后退
await page.goForward();                            // 前进  
await page.reload();                               // 刷新
await page.close();                                // 关闭页面
```

### 页面信息
```typescript
const title = await page.title();                 // 获取标题
const url = page.url();                            // 获取URL
await page.screenshot({ path: 'screenshot.png' }); // 截图
```

---

## 🔍 元素定位（优先级从高到低）

### 1. 语义化定位（推荐）
```typescript
page.getByRole('button', { name: '登录' })        // 按角色
page.getByText('欢迎回来')                         // 按文本
page.getByLabel('用户名')                          // 按标签
page.getByPlaceholder('请输入密码')                // 按占位符
page.getByTestId('submit-btn')                     // 按测试ID
```

### 2. 属性定位（稳定）
```typescript
page.locator('[data-test="username"]')            // data-test属性（最佳）
page.locator('#login-btn')                        // ID选择器
page.locator('.login-form')                       // CSS类选择器
page.locator('input[type="email"]')               // 属性选择器
```

### 3. 组合定位
```typescript
page.locator('.card').filter({ hasText: '商品A' }) // 过滤定位
page.locator('.item').first()                      // 第一个
page.locator('.item').last()                       // 最后一个
page.locator('.item').nth(2)                       // 第3个（从0开始）
```

---

## 🖱️ 交互操作

### 点击操作
```typescript
await page.locator('#btn').click();               // 单击
await page.locator('#btn').dblclick();            // 双击
await page.locator('#btn').click({ button: 'right' }); // 右击
await page.locator('#btn').click({ force: true }); // 强制点击
```

### 输入操作
```typescript
await page.locator('#input').fill('文本内容');     // 填充文本
await page.locator('#input').clear();             // 清空内容
await page.locator('#input').type('逐字输入');     // 逐字输入
await page.locator('#input').press('Enter');      // 按键
```

### 选择操作
```typescript
await page.locator('#select').selectOption('value'); // 下拉选择
await page.locator('#checkbox').check();          // 勾选
await page.locator('#checkbox').uncheck();        // 取消勾选
await page.locator('#radio').check();             // 单选
```

---

## ⏱️ 等待操作

### 元素等待
```typescript
await page.locator('#element').waitFor();                    // 等待元素出现
await page.locator('#element').waitFor({ state: 'visible' }); // 等待可见
await page.locator('#element').waitFor({ state: 'hidden' }); // 等待隐藏
await page.waitForSelector('#element');                      // 等待选择器
```

### 页面等待
```typescript
await page.waitForLoadState('load');              // 等待加载完成
await page.waitForLoadState('networkidle');       // 等待网络空闲
await page.waitForURL('**/dashboard');            // 等待URL变化
await page.waitForTimeout(3000);                  // 固定等待（不推荐）
```

---

## ✅ 断言验证

### 元素状态断言
```typescript
// 可见性
await expect(page.locator('#element')).toBeVisible();
await expect(page.locator('#element')).toBeHidden();

// 启用状态
await expect(page.locator('#btn')).toBeEnabled();
await expect(page.locator('#btn')).toBeDisabled();

// 选中状态
await expect(page.locator('#checkbox')).toBeChecked();
await expect(page.locator('#checkbox')).not.toBeChecked();
```

### 文本和属性断言
```typescript
// 文本断言
await expect(page.locator('#title')).toHaveText('标题');
await expect(page.locator('#title')).toContainText('部分文本');

// 属性断言
await expect(page.locator('#link')).toHaveAttribute('href', '/home');
await expect(page.locator('#input')).toHaveValue('输入值');

// 数量断言
await expect(page.locator('.item')).toHaveCount(5);
```

### 页面断言
```typescript
await expect(page).toHaveTitle('页面标题');
await expect(page).toHaveURL('https://example.com/page');
```

---

## 📱 Page Object Model (POM)

### POM类结构模板
```typescript
import { type Locator, type Page } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
```

### POM使用示例
```typescript
test('用户登录测试', async ({ page }) => {
  const loginPage = new LoginPage(page);
  
  await loginPage.goto();
  await loginPage.login('testuser', 'password');
  
  await expect(page.locator('.welcome')).toBeVisible();
});
```

---

## 🎛️ 常用配置

### playwright.config.ts基础配置
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',                    // 测试目录
  timeout: 30 * 1000,                    // 测试超时
  expect: { timeout: 5 * 1000 },         // 断言超时
  fullyParallel: true,                   // 并行执行
  forbidOnly: !!process.env.CI,          // CI环境禁用only
  retries: process.env.CI ? 2 : 0,       // 重试次数
  workers: process.env.CI ? 1 : undefined, // 并发数
  reporter: 'html',                      // 报告格式

  use: {
    baseURL: 'http://localhost:3000',    // 基础URL
    trace: 'on-first-retry',             // 追踪设置
    screenshot: 'only-on-failure',       // 截图设置
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
```

---

## 🔧 调试技巧

### 调试模式运行
```bash
npx playwright test --debug              # 调试模式
npx playwright test --headed             # 显示浏览器
npx playwright test --ui                 # UI模式
```

### 代码中调试
```typescript
await page.pause();                      // 暂停执行，打开调试器

// 控制台输出
console.log('当前URL:', page.url());
console.log('元素文本:', await page.locator('#title').textContent());
```

### 元素检查
```typescript
// 获取元素信息
const element = page.locator('#target');
console.log('元素数量:', await element.count());
console.log('是否可见:', await element.isVisible());
console.log('元素文本:', await element.textContent());
console.log('元素HTML:', await element.innerHTML());
```

---

## 📋 SwagLabs测试数据

### 测试账号
```typescript
// 有效用户
const users = {
  standard: { username: 'standard_user', password: 'secret_sauce' },
  locked: { username: 'locked_out_user', password: 'secret_sauce' },
  problem: { username: 'problem_user', password: 'secret_sauce' },
  performance: { username: 'performance_glitch_user', password: 'secret_sauce' }
};

// 测试商品
const products = [
  'Sauce Labs Backpack',
  'Sauce Labs Bike Light', 
  'Sauce Labs Bolt T-Shirt',
  'Sauce Labs Fleece Jacket',
  'Sauce Labs Onesie',
  'Test.allTheThings() T-Shirt (Red)'
];
```

### 页面URL路径
```typescript
const urls = {
  login: 'https://www.saucedemo.com/',
  inventory: 'https://www.saucedemo.com/inventory.html',
  cart: 'https://www.saucedemo.com/cart.html',
  checkout: 'https://www.saucedemo.com/checkout-step-one.html',
  overview: 'https://www.saucedemo.com/checkout-step-two.html',
  complete: 'https://www.saucedemo.com/checkout-complete.html'
};
```

---

## 🚨 常见错误和解决方案

### 元素定位失败
```typescript
// ❌ 错误：元素定位失败
await page.locator('#dynamic-id').click();

// ✅ 解决：使用稳定的定位器
await page.locator('[data-test="submit-btn"]').click();

// ✅ 解决：等待元素出现
await page.locator('#submit-btn').waitFor();
await page.locator('#submit-btn').click();
```

### 超时错误
```typescript
// ❌ 错误：操作超时
await page.locator('#slow-element').click();

// ✅ 解决：增加超时时间
await page.locator('#slow-element').click({ timeout: 10000 });

// ✅ 解决：等待页面加载
await page.waitForLoadState('networkidle');
await page.locator('#element').click();
```

### 元素被遮挡
```typescript
// ❌ 错误：元素被其他元素遮挡
await page.locator('#covered-btn').click();

// ✅ 解决：强制点击
await page.locator('#covered-btn').click({ force: true });

// ✅ 解决：滚动到视口
await page.locator('#covered-btn').scrollIntoViewIfNeeded();
await page.locator('#covered-btn').click();
```

---

## 📚 快速参考链接

- 🔗 [Playwright官方文档](https://playwright.dev/)
- 🔗 [API参考手册](https://playwright.dev/docs/api/class-page)
- 🔗 [最佳实践指南](https://playwright.dev/docs/best-practices)
- 🔗 [VS Code插件](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright)

---

**💡 实用提示**: 
- 优先使用语义化定位器（getByRole, getByText等）
- 避免使用固定等待（waitForTimeout），优选智能等待
- 定期检查和更新不稳定的定位器
- 充分利用Playwright的调试工具进行问题排查