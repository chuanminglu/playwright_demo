# SauceDemo 实战案例：登录与完整购物流程

> **靶站**: https://www.saucedemo.com/  
> **目标**: 演示完整 5 阶段工作流（ANALYZE → EXPLORE → CODE → EXECUTE → DIAGNOSE）  
> **账号**: `standard_user` / `secret_sauce`（所有测试账号共用同一密码）

---

## 站点速览

| 页面 | URL | 进入条件 |
|------|-----|---------|
| 登录页 | `/` | 直接访问 |
| 商品列表 | `/inventory.html` | 登录成功后自动跳转 |
| 商品详情 | `/inventory-item.html?id={N}` | 点击商品图片/名称 |
| 购物车 | `/cart.html` | 点击购物车图标 |
| 结账信息 | `/checkout-step-one.html` | 点击 Checkout 按钮 |
| 订单总览 | `/checkout-step-two.html` | 填写信息后点击 Continue |
| 订单完成 | `/checkout-complete.html` | 点击 Finish 按钮 |

---

## Phase 1: Analyze（需求 → 测试用例）

### 1.1 输入材料（粘贴给 Prompt 0）

```
## 材料1：用户故事
【故事ID】SWAG-US001
【故事标题】用户登录与完整购物流程
【用户故事】作为注册用户，我希望能够登录网站、浏览商品、加入购物车、
            完成结账，以便购买我需要的商品。

【验收标准】
AC1. 使用有效凭证登录后，跳转到商品列表页
AC2. 使用无效密码登录，显示错误提示信息
AC3. 被锁定用户登录，显示账号锁定提示
AC4. 可以将商品加入购物车，购物车角标实时更新
AC5. 购物车页面显示已添加商品的名称和价格
AC6. 填写收货信息后可以进入订单总览页
AC7. 收货信息为空时，显示字段缺失错误提示
AC8. 订单总览页显示商品小计、税费和总价
AC9. 点击 Finish 后跳转到订单完成页，显示成功确认信息

## 材料2：验收规则清单
【功能规则】
F1: 登录成功后 URL 变为 /inventory.html，页面标题为 "Products"
F2: 商品列表显示 6 件商品，每件有名称、价格、Add to cart 按钮
F3: 添加商品后，Add to cart 按钮变为 Remove，购物车角标数字加 1
F4: 购物车页面标题为 "Your Cart"，显示所有已添加商品

【数据规则】
D1: 错误密码提示文案: "Epic sadface: Username and password do not match any user in this service"
D2: 锁定账号提示文案: "Epic sadface: Sorry, this user has been locked out."
D3: 结账信息缺失提示（First Name）: "Error: First Name is required"
D4: 税率约为 8%（Backpack $29.99 + Bike Light $9.99 = $39.98，Tax $3.20，Total $43.18）

【异常规则】
E1: 用户名为空，提示 "Epic sadface: Username is required"
E2: 密码为空，提示 "Epic sadface: Password is required"

## 材料3：系统信息
【系统名称】Swag Labs 电商平台
【功能模块】用户认证-登录 / 商品管理-列表 / 购物车-结账
【测试环境】https://www.saucedemo.com/
```

### 1.2 Prompt 0 输出（测试用例文档节选）

生成后保存到 `docs/test-cases/saucedemo-购物流程-测试用例.md`，关键用例如下：

**测试覆盖矩阵**（部分）

| 规则ID | 规则描述 | 对应用例 | 覆盖状态 |
|-------|---------|---------|---------|
| F1 | 登录成功跳转 /inventory.html | SWAG-LOGIN-001 | ✅ |
| D1 | 错误密码提示文案 | SWAG-LOGIN-002 | ✅ |
| D2 | 锁定账号提示文案 | SWAG-LOGIN-003 | ✅ |
| E1 | 用户名为空提示 | SWAG-LOGIN-004 | ✅ |
| F3 | 添加商品角标更新 | SWAG-CART-001 | ✅ |
| D4 | 税费与总价计算 | SWAG-CHK-003 | ✅ |

**测试用例表格**（节选关键用例）

| 用例编号 | 用例概述 | 优先级 | 标签 | 前提条件 | 输入数据或操作 | 预期结果 |
|---------|---------|-------|-----|---------|--------------|---------|
| SWAG-LOGIN-001 | 标准用户正常登录 | P0 | 功能测试,可自动化 | 1. 打开 https://www.saucedemo.com/ | 1. 输入用户名 `standard_user` 2. 输入密码 `secret_sauce` 3. 点击 Login 按钮 | 1. URL 变为 /inventory.html 2. 页面标题显示 "Products" 3. 商品列表可见 |
| SWAG-LOGIN-002 | 错误密码显示错误提示 | P1 | 异常测试,可自动化 | 1. 打开登录页 | 1. 输入用户名 `standard_user` 2. 输入密码 `wrong_password` 3. 点击 Login 按钮 | 1. 停留在登录页 2. 显示错误提示 "Epic sadface: Username and password do not match any user in this service" |
| SWAG-LOGIN-003 | 被锁定用户显示锁定提示 | P1 | 异常测试,可自动化 | 1. 打开登录页 | 1. 输入用户名 `locked_out_user` 2. 输入密码 `secret_sauce` 3. 点击 Login 按钮 | 显示 "Epic sadface: Sorry, this user has been locked out." |
| SWAG-LOGIN-004 | 用户名为空提示 | P1 | 参数验证,可自动化 | 1. 打开登录页 | 1. 不填用户名 2. 输入密码 `secret_sauce` 3. 点击 Login | 显示 "Epic sadface: Username is required" |
| SWAG-CART-001 | 添加商品购物车角标更新 | P0 | 功能测试,可自动化 | 1. 已用 standard_user 登录 | 1. 点击 Backpack 的 Add to cart 2. 点击 Bike Light 的 Add to cart | 1. 购物车角标显示 "2" 2. 两个按钮文字变为 "Remove" |
| SWAG-CART-002 | 购物车页面显示商品信息 | P0 | 功能测试,可自动化 | 1. 已添加 Backpack 和 Bike Light | 1. 点击购物车图标 | 1. URL 为 /cart.html 2. 页面标题 "Your Cart" 3. 显示 Backpack ($29.99) 和 Bike Light ($9.99) |
| SWAG-CHK-001 | 结账信息为空显示提示 | P1 | 参数验证,可自动化 | 1. 购物车有商品 2. 在 /checkout-step-one.html | 1. 不填任何信息 2. 点击 Continue | 显示 "Error: First Name is required" |
| SWAG-CHK-002 | 完整结账流程 | P0 | 功能测试,可自动化 | 1. 购物车有 Backpack + Bike Light | 1. 点击 Checkout 2. 填写 First: John / Last: Doe / Zip: 10001 3. 点击 Continue 4. 确认订单总览 5. 点击 Finish | 1. /checkout-step-two.html 显示 Item total: $39.98 2. Tax: $3.20 3. Total: $43.18 4. 点击 Finish 后跳转 /checkout-complete.html 5. 显示 "Thank you for your order!" |
| SWAG-CHK-003 | 订单完成页显示确认信息 | P0 | 功能测试,可自动化 | 1. 已完成结账流程 | — | 1. URL 为 /checkout-complete.html 2. 显示 "Thank you for your order!" 3. 购物车角标消失 |

---

## Phase 2: Explore（定向探索，提取选择器）

> **读取测试用例 → 识别涉及的页面**：登录页 `/`、商品列表页 `/inventory.html`、购物车页 `/cart.html`、结账信息页、订单总览页、订单完成页

### 2.1 登录页 `/`

```javascript
// 打开并截图
mcp_io_github_chr_new_page({ url: "https://www.saucedemo.com/" })
mcp_io_github_chr_take_screenshot({ fullPage: true })
mcp_io_github_chr_take_snapshot({ verbose: true })

// 提取选择器
mcp_io_github_chr_evaluate_script({
  function: `() => {
    const r = {};
    document.querySelectorAll('[data-test], input, button').forEach(el => {
      const k = el.dataset?.test || el.id;
      if (k) r[k] = { tag: el.tagName, type: el.type || '', text: el.value || el.innerText?.slice(0,30) };
    });
    return r;
  }`
})
```

**登录页选择器表**

| data-test | 元素类型 | 用途 |
|-----------|---------|------|
| `username` | `input[text]` | 用户名输入框 |
| `password` | `input[password]` | 密码输入框 |
| `login-button` | `input[submit]` | 登录按钮 |
| `error` | `h3` | 错误提示（失败时出现） |

**交互验证（正常登录）**
```javascript
mcp_io_github_chr_fill({ uid: "<username-uid>", value: "standard_user" })
mcp_io_github_chr_fill({ uid: "<password-uid>", value: "secret_sauce" })
mcp_io_github_chr_click({ uid: "<login-button-uid>" })
mcp_io_github_chr_wait_for({ text: "Products", timeout: 3000 })
mcp_io_github_chr_take_screenshot()  // ✅ 确认跳转到商品列表
```

**交互验证（错误密码）**
```javascript
mcp_io_github_chr_navigate_page({ type: "url", url: "https://www.saucedemo.com/" })
mcp_io_github_chr_fill({ uid: "<username-uid>", value: "standard_user" })
mcp_io_github_chr_fill({ uid: "<password-uid>", value: "wrong_password" })
mcp_io_github_chr_click({ uid: "<login-button-uid>" })
mcp_io_github_chr_wait_for({ text: "Username and password do not match" })
mcp_io_github_chr_take_screenshot()  // ✅ 确认错误提示出现
```

---

### 2.2 商品列表页 `/inventory.html`

**选择器表**

| data-test | 用途 |
|-----------|------|
| `shopping-cart-link` | 购物车图标 |
| `shopping-cart-badge` | 购物车数量角标 |
| `add-to-cart-sauce-labs-backpack` | 添加 Backpack（$29.99） |
| `add-to-cart-sauce-labs-bike-light` | 添加 Bike Light（$9.99） |
| `add-to-cart-sauce-labs-bolt-t-shirt` | 添加 Bolt T-Shirt（$15.99） |
| `add-to-cart-sauce-labs-fleece-jacket` | 添加 Fleece Jacket（$49.99） |
| `add-to-cart-sauce-labs-onesie` | 添加 Onesie（$7.99） |
| `add-to-cart-test.allthethings()-t-shirt-(red)` | 添加 Red T-Shirt（$15.99） |
| `open-menu` | 汉堡菜单 |
| `logout-sidebar-link` | 退出登录 |

**交互验证（添加商品 → 角标更新）**
```javascript
mcp_io_github_chr_click({ uid: "<add-backpack-uid>" })
mcp_io_github_chr_wait_for({ text: "1" })
mcp_io_github_chr_take_screenshot()  // ✅ 角标显示 1，按钮变为 Remove
mcp_io_github_chr_click({ uid: "<add-bike-light-uid>" })
mcp_io_github_chr_wait_for({ text: "2" })
mcp_io_github_chr_take_screenshot()  // ✅ 角标显示 2
```

---

### 2.3 购物车页 `/cart.html`

**选择器表**

| data-test | 用途 |
|-----------|------|
| `title` | 页面标题（"Your Cart"） |
| `inventory-item-name` | 商品名称 |
| `inventory-item-price` | 商品价格 |
| `remove-sauce-labs-backpack` | 移除 Backpack |
| `remove-sauce-labs-bike-light` | 移除 Bike Light |
| `continue-shopping` | 继续购物 |
| `checkout` | 去结账 |

---

### 2.4 结账信息页 `/checkout-step-one.html`

**选择器表**

| data-test | 用途 |
|-----------|------|
| `firstName` | 名字输入框 |
| `lastName` | 姓氏输入框 |
| `postalCode` | 邮政编码输入框 |
| `cancel` | 取消（返回购物车） |
| `continue` | 继续（提交信息） |
| `error` | 错误提示 |

---

### 2.5 订单总览页 `/checkout-step-two.html`

**选择器表**

| data-test | 用途 |
|-----------|------|
| `subtotal-label` | 商品小计（如 "Item total: $39.98"） |
| `tax-label` | 税费（如 "Tax: $3.20"） |
| `total-label` | 总计（如 "Total: $43.18"） |
| `finish` | 完成订单 |
| `cancel` | 取消 |

---

### 2.6 订单完成页 `/checkout-complete.html`

**选择器表**

| data-test | 用途 |
|-----------|------|
| `complete-header` | 确认标题（"Thank you for your order!"） |
| `back-to-products` | "Back Home" 按钮 |

---

## Phase 3: Code（生成 POM → 生成测试脚本）

### 3.1 Prompt 1 输入示例（LoginPage）

```
## 目标页面
URL: https://www.saucedemo.com/
页面名称: LoginPage

## 选择器表
| data-test    | 元素类型        | 用途       |
|-------------|----------------|-----------|
| username    | input[text]    | 用户名输入框 |
| password    | input[password]| 密码输入框  |
| login-button| input[submit]  | 登录按钮    |
| error       | h3             | 错误提示    |

## 测试用例中涉及的交互
- 正常登录: 填写用户名 → 密码 → 点击 Login → 等待 "Products" 出现
- 登录失败: 同上，验证 [data-test="error"] 包含指定文案
```

### 3.2 生成的 POM 文件

```typescript
// pages/LoginPage.ts
import { Page, expect } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  // --- Locators ---
  readonly usernameInput  = this.page.getByTestId('username');
  readonly passwordInput  = this.page.getByTestId('password');
  readonly loginButton    = this.page.getByTestId('login-button');
  readonly errorMessage   = this.page.getByTestId('error');

  // --- Navigation ---
  async goto() {
    await this.page.goto('https://www.saucedemo.com/');
  }

  // --- Actions ---
  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  // --- Assertions ---
  async expectLoginError(message: string) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(message);
  }
}
```

```typescript
// pages/InventoryPage.ts
import { Page, expect } from '@playwright/test';

export class InventoryPage {
  constructor(private page: Page) {}

  // --- Locators ---
  readonly cartBadge       = this.page.getByTestId('shopping-cart-badge');
  readonly cartLink        = this.page.getByTestId('shopping-cart-link');
  readonly menuButton      = this.page.getByTestId('open-menu');
  readonly logoutLink      = this.page.getByTestId('logout-sidebar-link');

  addToCartButton(slug: string) {
    return this.page.getByTestId(`add-to-cart-${slug}`);
  }

  // --- Navigation ---
  async gotoCart() {
    await this.cartLink.click();
  }

  // --- Actions ---
  async addItemToCart(slug: string) {
    await this.addToCartButton(slug).click();
  }

  async logout() {
    await this.menuButton.click();
    await this.logoutLink.click();
  }

  // --- Assertions ---
  async expectCartBadge(count: number) {
    await expect(this.cartBadge).toHaveText(String(count));
  }

  async expectOnPage() {
    await expect(this.page).toHaveURL(/inventory\.html/);
  }
}
```

```typescript
// pages/CheckoutInfoPage.ts
import { Page, expect } from '@playwright/test';

export class CheckoutInfoPage {
  constructor(private page: Page) {}

  // --- Locators ---
  readonly firstNameInput = this.page.getByTestId('firstName');
  readonly lastNameInput  = this.page.getByTestId('lastName');
  readonly postalCodeInput= this.page.getByTestId('postalCode');
  readonly continueButton = this.page.getByTestId('continue');
  readonly cancelButton   = this.page.getByTestId('cancel');
  readonly errorMessage   = this.page.getByTestId('error');

  // --- Actions ---
  async fillInfo(firstName: string, lastName: string, postalCode: string) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
    await this.continueButton.click();
  }

  async submitEmpty() {
    await this.continueButton.click();
  }

  // --- Assertions ---
  async expectError(message: string) {
    await expect(this.errorMessage).toContainText(message);
  }
}
```

```typescript
// pages/CheckoutOverviewPage.ts
import { Page, expect } from '@playwright/test';

export class CheckoutOverviewPage {
  constructor(private page: Page) {}

  // --- Locators ---
  readonly subtotalLabel = this.page.getByTestId('subtotal-label');
  readonly taxLabel      = this.page.getByTestId('tax-label');
  readonly totalLabel    = this.page.getByTestId('total-label');
  readonly finishButton  = this.page.getByTestId('finish');

  // --- Actions ---
  async finish() {
    await this.finishButton.click();
  }

  // --- Assertions ---
  async expectTotals(subtotal: string, tax: string, total: string) {
    await expect(this.subtotalLabel).toContainText(subtotal);
    await expect(this.taxLabel).toContainText(tax);
    await expect(this.totalLabel).toContainText(total);
  }
}
```

### 3.3 Prompt 2 输入示例

```
## 材料1：测试用例文档（可自动化部分）
[粘贴上方 Phase 1 中标记「可自动化」的用例行]

## 材料2：POM 类方法定义
class LoginPage:
  - goto()
  - login(username: string, password: string)
  - expectLoginError(message: string)

class InventoryPage:
  - addItemToCart(slug: string)       // slug 如 'sauce-labs-backpack'
  - gotoCart()
  - expectCartBadge(count: number)
  - expectOnPage()

class CheckoutInfoPage:
  - fillInfo(firstName, lastName, postalCode)
  - submitEmpty()
  - expectError(message: string)

class CheckoutOverviewPage:
  - expectTotals(subtotal, tax, total)
  - finish()

## 材料3：测试数据
用户: standard_user / secret_sauce
锁定用户: locked_out_user / secret_sauce
商品: Backpack slug=sauce-labs-backpack, Bike Light slug=sauce-labs-bike-light
收货信息: John / Doe / 10001
```

### 3.4 生成的测试脚本（节选）

```typescript
// tests/login.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';

const USERS = {
  standard:  { username: 'standard_user',  password: 'secret_sauce' },
  locked:    { username: 'locked_out_user', password: 'secret_sauce' },
};

test.describe('SWAG-LOGIN 登录功能', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('SWAG-LOGIN-001 标准用户正常登录', async ({ page }) => {
    console.log('步骤1: 输入有效凭据');
    await loginPage.login(USERS.standard.username, USERS.standard.password);
    console.log('步骤2: 验证跳转到商品列表页');
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.expectOnPage();
  });

  test('SWAG-LOGIN-002 错误密码显示错误提示', async () => {
    console.log('步骤1: 输入错误密码');
    await loginPage.login(USERS.standard.username, 'wrong_password');
    console.log('步骤2: 验证错误提示文案');
    await loginPage.expectLoginError('Username and password do not match any user in this service');
  });

  test('SWAG-LOGIN-003 被锁定用户显示锁定提示', async () => {
    await loginPage.login(USERS.locked.username, USERS.locked.password);
    await loginPage.expectLoginError('Sorry, this user has been locked out.');
  });

  test('SWAG-LOGIN-004 用户名为空提示', async () => {
    await loginPage.login('', USERS.standard.password);
    await loginPage.expectLoginError('Username is required');
  });
});
```

```typescript
// tests/shopping-flow.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CheckoutInfoPage } from '../pages/CheckoutInfoPage';
import { CheckoutOverviewPage } from '../pages/CheckoutOverviewPage';

test.describe('SWAG-CART / SWAG-CHK 购物与结账流程', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');
    await inventoryPage.expectOnPage();
  });

  test('SWAG-CART-001 添加商品购物车角标更新', async () => {
    console.log('步骤1: 添加 Backpack');
    await inventoryPage.addItemToCart('sauce-labs-backpack');
    console.log('步骤2: 验证角标为 1');
    await inventoryPage.expectCartBadge(1);
    console.log('步骤3: 添加 Bike Light');
    await inventoryPage.addItemToCart('sauce-labs-bike-light');
    console.log('步骤4: 验证角标为 2');
    await inventoryPage.expectCartBadge(2);
  });

  test('SWAG-CHK-001 结账信息为空显示提示', async ({ page }) => {
    await inventoryPage.addItemToCart('sauce-labs-backpack');
    await inventoryPage.gotoCart();
    await page.getByTestId('checkout').click();
    const infoPage = new CheckoutInfoPage(page);
    await infoPage.submitEmpty();
    await infoPage.expectError('First Name is required');
  });

  test('SWAG-CHK-002 完整结账流程验证金额', async ({ page }) => {
    console.log('步骤1: 添加 Backpack + Bike Light');
    await inventoryPage.addItemToCart('sauce-labs-backpack');
    await inventoryPage.addItemToCart('sauce-labs-bike-light');
    console.log('步骤2: 进入结账流程');
    await inventoryPage.gotoCart();
    await page.getByTestId('checkout').click();
    console.log('步骤3: 填写收货信息');
    const infoPage = new CheckoutInfoPage(page);
    await infoPage.fillInfo('John', 'Doe', '10001');
    console.log('步骤4: 验证订单总览金额');
    const overviewPage = new CheckoutOverviewPage(page);
    await overviewPage.expectTotals('$39.98', '$3.20', '$43.18');
    console.log('步骤5: 完成订单');
    await overviewPage.finish();
    await expect(page).toHaveURL(/checkout-complete/);
    await expect(page.getByTestId('complete-header')).toContainText('Thank you for your order!');
  });
});
```

---

## Phase 4: Execute（执行）

```bash
# 运行全部测试
npx playwright test

# 只运行登录测试
npx playwright test tests/login.spec.ts

# 只运行购物流程
npx playwright test tests/shopping-flow.spec.ts

# 调试模式（带 UI）
npx playwright test --debug

# 查看 HTML 报告
npx playwright show-report
```

**预期结果**: 9 个测试全部通过，执行时间 < 30 秒（无 headed 模式）

---

## Phase 5: Diagnose（故障诊断示例）

### 示例：SWAG-CHK-002 金额断言失败

**错误信息**:
```
Error: expect(received).toContainText(expected)
Expected: "$43.18"
Received: "Total: $42.98"
```

**诊断步骤**:

```javascript
// 1. 导航到订单总览页（需先完成前置步骤）
mcp_io_github_chr_new_page({ url: "https://www.saucedemo.com/" })
// ... 重复登录 → 加商品 → 结账步骤

// 2. 截图查看当前页面状态
mcp_io_github_chr_take_screenshot({ fullPage: true })

// 3. 用 evaluate_script 读取实际金额
mcp_io_github_chr_evaluate_script({
  function: `() => ({
    subtotal: document.querySelector('[data-test="subtotal-label"]')?.innerText,
    tax:      document.querySelector('[data-test="tax-label"]')?.innerText,
    total:    document.querySelector('[data-test="total-label"]')?.innerText,
  })`
})
```

**根因**: 税率数据发生变化（从 8% 调整为约 7.5%）  
**类型**: 断言值错误  
**修复**: 更新 `CheckoutOverviewPage.expectTotals()` 中的期望值，或改为正则匹配允许 ±$0.50 浮动

---

## 文件结构总览

```
project/
├── docs/
│   └── test-cases/
│       └── saucedemo-购物流程-测试用例.md    ← Phase 1 输出
├── pages/
│   ├── LoginPage.ts                          ← Phase 3 输出
│   ├── InventoryPage.ts
│   ├── CheckoutInfoPage.ts
│   ├── CheckoutOverviewPage.ts
│   └── index.ts
└── tests/
    ├── login.spec.ts                         ← Phase 3 输出
    └── shopping-flow.spec.ts
```
