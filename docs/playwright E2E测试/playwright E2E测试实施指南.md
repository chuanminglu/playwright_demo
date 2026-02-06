# Playwright E2E 测试完整实战指南 (基于 SauceDemo)

这份文档提供了一个完整的 Playwright 端到端 (E2E) 测试演练案例。我们将针对 [SauceDemo](https://www.saucedemo.com/) 电商网站，模拟 **登录 -> 购物 -> 结账** 的全流程。

项目采用企业级推荐的 **Page Object Model (POM)** 设计模式。

---

## 1. 快速开始 (一键生成项目)

为了避免手动创建多个文件，我们提供了一个 Node.js 脚本来自动生成整个项目结构。

### 前置条件

* 电脑已安装 Node.js (建议 v16 或更高版本)
* 终端 (Terminal / Command Prompt / PowerShell)

### 步骤 1：创建生成脚本

在你的电脑上新建一个文件夹（例如 `playwright-demo`），在其中创建一个名为 `setup.js` 的文件，并将以下代码粘贴进去：

```javascript
const fs = require('fs');
const path = require('path');

// 定义项目结构和文件内容
const files = {
  'package.json': JSON.stringify({
    "name": "playwright-e2e-demo",
    "version": "1.0.0",
    "scripts": {
      "test": "playwright test",
      "test:headed": "playwright test --headed",
      "test:ui": "playwright test --ui"
    },
    "devDependencies": {
      "@playwright/test": "^1.40.0",
      "@types/node": "^20.0.0",
      "typescript": "^5.0.0"
    }
  }, null, 2),

  'playwright.config.ts': `
import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: 'html',
  use: { trace: 'on-first-retry' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});`,

  'pages/LoginPage.ts': `
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

  async goto() { await this.page.goto('https://www.saucedemo.com/'); }
  async login(username: string, pass: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(pass);
    await this.loginButton.click();
  }
}`,

  'pages/InventoryPage.ts': `
import { type Locator, type Page } from '@playwright/test';

export class InventoryPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly shoppingCartBadge: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('.title');
    this.shoppingCartBadge = page.locator('.shopping_cart_badge');
  }

  async addItemToCart(itemName: string) {
    const itemId = itemName.toLowerCase().replace(/ /g, '-');
    await this.page.locator(\`[data-test="add-to-cart-\${itemId}"]\`).click();
  }
  async gotoCart() { await this.page.locator('.shopping_cart_link').click(); }
}`,

  'pages/CartPage.ts': `
import { type Locator, type Page } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly checkoutButton: Locator;
  readonly cartItems: Locator;

  constructor(page: Page) {
    this.page = page;
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.cartItems = page.locator('.cart_item');
  }
  async checkout() { await this.checkoutButton.click(); }
}`,

  'pages/CheckoutPage.ts': `
import { type Locator, type Page } from '@playwright/test';

export class CheckoutPage {
  readonly page: Page;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly finishButton: Locator;
  readonly completeHeader: Locator;

  constructor(page: Page) {
    this.page = page;
    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.finishButton = page.locator('[data-test="finish"]');
    this.completeHeader = page.locator('.complete-header');
  }
  async fillDetails(first: string, last: string, zip: string) {
    await this.firstNameInput.fill(first);
    await this.lastNameInput.fill(last);
    await this.postalCodeInput.fill(zip);
    await this.continueButton.click();
  }
  async finishCheckout() { await this.finishButton.click(); }
}`,

  'tests/e2e.spec.ts': `
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';

test.describe('E2E Shopping Flow', () => {
  test('User should be able to purchase an item completely', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    console.log('Step 1: Logging in...');
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');
    await expect(inventoryPage.pageTitle).toHaveText('Products');

    console.log('Step 2: Adding item to cart...');
    await inventoryPage.addItemToCart('Sauce Labs Backpack');
    await expect(inventoryPage.shoppingCartBadge).toHaveText('1');

    console.log('Step 3: Checking cart...');
    await inventoryPage.gotoCart();
    await expect(cartPage.cartItems).toHaveCount(1);

    console.log('Step 4: Checking out...');
    await cartPage.checkout();
    await checkoutPage.fillDetails('John', 'Doe', '12345');
  
    console.log('Step 5: Finishing order...');
    await checkoutPage.finishCheckout();
    await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
  });
});`
};

// 执行文件生成
console.log('🚀 开始生成 Playwright E2E 演示项目...');
Object.entries(files).forEach(([filePath, content]) => {
  const fullPath = path.join(__dirname, filePath);
  if (!fs.existsSync(path.dirname(fullPath))) {
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  }
  fs.writeFileSync(fullPath, content.trim());
  console.log(`✅ 已创建: ${filePath}`);
});
console.log('\n🎉 项目生成成功！');
```

### 步骤 2：初始化与运行

打开终端，进入该文件夹，依次执行以下命令：

1. **生成项目文件** ：

```bash
   node setup.js
```

1. **安装依赖包** ：

```bash
   npm install
```

1. **安装 Playwright 浏览器驱动** ：

```bash
   npx playwright install
```

1. **运行测试 (带浏览器界面)** ：

```bash
   npm run test:headed
```

---

## 2. 项目结构说明

运行脚本后，你会得到以下目录结构，这是典型的 **POM (Page Object Model)** 结构：

```text
playwright-demo/
├── pages/                  # 页面对象层 (存放元素定位和页面操作)
│   ├── LoginPage.ts        # 登录页逻辑
│   ├── InventoryPage.ts    # 商品列表页逻辑
│   ├── CartPage.ts         # 购物车页逻辑
│   └── CheckoutPage.ts     # 结账流程页逻辑
├── tests/                  # 测试用例层
│   └── e2e.spec.ts         # 完整的购物流程测试脚本
├── package.json            # 项目依赖配置
├── playwright.config.ts    # Playwright 配置文件
└── setup.js                # (刚才使用的生成脚本)
```

### 核心概念：Page Object Model (POM)

POM 模式的核心思想是将**页面细节（HTML元素定位）**与**测试逻辑**分离。

* **如果不使用 POM** ：你的测试代码里会充满 `page.locator('#some-id').click()`。如果网页改版，你需要修改所有测试文件。
* **使用 POM** ：测试代码只调用 `loginPage.login()`。如果网页改版，你只需要在 `LoginPage.ts` 一个地方修改定位器。

---

## 3. 常用运行命令

在 `package.json` 中我们已经预置了几个命令：

| 命令                    | 作用                            | 适用场景                                        |
| :---------------------- | :------------------------------ | :---------------------------------------------- |
| `npm run test`        | 无头模式运行 (Headless)         | CI/CD 流水线，速度最快，看不到界面              |
| `npm run test:headed` | **有头模式运行 (Headed)** | **本地开发** ，可以看到浏览器自动操作     |
| `npm run test:ui`     | **启动 UI 调试模式**      | **调试代码** ，拥有时间轴，可以回放每一步 |

---

## 4. 关键代码解析

### 定位器最佳实践 (Locators)

我们在代码中大量使用了 `data-test` 属性，这是 Playwright 官方推荐的方式：

```typescript
// 推荐：稳定，不受 CSS 样式变化影响
this.usernameInput = page.locator('[data-test="username"]');

// 不推荐：容易因样式重构而失效
// this.usernameInput = page.locator('.login_input'); 
```

### 断言 (Assertions)

Playwright 的 `expect` 具有**自动重试 (Auto-retrying)** 机制：

```typescript
// 这行代码会等待直到 cartItems 的数量变为 1，或者直到超时（默认 5秒）
await expect(cartPage.cartItems).toHaveCount(1);
```

### 动态选择器

在 `InventoryPage.ts` 中，我们展示了如何处理动态元素：

```typescript
async addItemToCart(itemName: string) {
  // 将 "Sauce Labs Backpack" 转换为 "sauce-labs-backpack"
  const itemId = itemName.toLowerCase().replace(/ /g, '-');
  // 动态拼接 Selector
  await this.page.locator(`[data-test="add-to-cart-${itemId}"]`).click();
}
```
