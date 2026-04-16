# US002 实战案例：用户登录

> **靶站**: https://www.saucedemo.com/  
> **目标**: 用最小范围验证完整 5 阶段工作流（ANALYZE → EXPLORE → CODE → EXECUTE → DIAGNOSE）  
> **账号**: `standard_user` / `secret_sauce`

---

## Phase 1: Analyze（需求 → 测试用例）

### 1.1 输入材料（粘贴给 Prompt 0）

```
## 材料1：用户故事
【故事ID】SWAG-US002
【故事标题】用户登录
【用户故事】作为注册用户，我希望能够使用账号和密码登录系统，以便访问商品列表。

【验收标准】
AC1. 使用正确的用户名和密码，登录成功后跳转到商品列表页
AC2. 使用错误的密码，停留在登录页并显示错误提示
AC3. 用户名字段为空时，显示"用户名必填"提示

## 材料2：验收规则清单
【功能规则】
F1: 登录成功后 URL 变为 /inventory.html，页面标题显示 "Products"

【数据规则】
D1: 错误密码提示文案: "Epic sadface: Username and password do not match any user in this service"
D2: 用户名为空提示文案: "Epic sadface: Username is required"

## 材料3：系统信息
【系统名称】Swag Labs 电商平台
【功能模块】用户认证-登录
【测试环境】https://www.saucedemo.com/
```

### 1.2 Prompt 0 期望输出（测试用例文档）

生成后保存到 `docs/test-cases/US002-login-测试用例.md`

**测试覆盖矩阵**

| 规则ID | 规则描述 | 对应用例 | 覆盖状态 |
|-------|---------|---------|---------|
| F1 | 登录成功跳转 /inventory.html，标题 "Products" | US002-LOGIN-001 | ✅ |
| D1 | 错误密码提示文案 | US002-LOGIN-002 | ✅ |
| D2 | 用户名为空提示文案 | US002-LOGIN-003 | ✅ |

**测试用例表格**

| 用例编号 | 用例概述 | 优先级 | 标签 | 前提条件 | 输入数据或操作 | 预期结果 |
|---------|---------|-------|-----|---------|--------------|---------|
| US002-LOGIN-001 | 正确凭证登录成功 | P0 | 功能测试,可自动化 | 打开 https://www.saucedemo.com/ | 1. 输入用户名 `standard_user` 2. 输入密码 `secret_sauce` 3. 点击 Login | 1. URL 变为 /inventory.html 2. 页面标题显示 "Products" |
| US002-LOGIN-002 | 错误密码显示错误提示 | P1 | 异常测试,可自动化 | 打开登录页 | 1. 输入用户名 `standard_user` 2. 输入密码 `wrong_password` 3. 点击 Login | 1. 停留在登录页 2. 显示 "Epic sadface: Username and password do not match any user in this service" |
| US002-LOGIN-003 | 用户名为空显示提示 | P1 | 参数验证,可自动化 | 打开登录页 | 1. 用户名留空 2. 输入密码 `secret_sauce` 3. 点击 Login | 显示 "Epic sadface: Username is required" |

---

## Phase 2: Explore（定向探索，提取选择器）

> **读取测试用例 → 识别涉及的页面**：只涉及登录页 `/` 和商品列表页 `/inventory.html`（仅用于验证跳转）

### 2.1 探索登录页 `/`

```javascript
// Step 1: 打开页面截图
mcp_io_github_chr_new_page({ url: "https://www.saucedemo.com/" })
mcp_io_github_chr_take_screenshot({ fullPage: true })

// Step 2: 获取 DOM 快照
mcp_io_github_chr_take_snapshot({ verbose: true })

// Step 3: 提取 data-test 选择器
mcp_io_github_chr_evaluate_script({
  function: `() => {
    const result = {};
    document.querySelectorAll('[data-test]').forEach(el => {
      result[el.dataset.test] = { tag: el.tagName, type: el.type || '', text: el.innerText?.slice(0, 30) };
    });
    return result;
  }`
})

// Step 4: 验证正常登录交互
mcp_io_github_chr_fill({ uid: "<username-uid>", value: "standard_user" })
mcp_io_github_chr_fill({ uid: "<password-uid>", value: "secret_sauce" })
mcp_io_github_chr_click({ uid: "<login-button-uid>" })
mcp_io_github_chr_wait_for({ text: "Products", timeout: 3000 })
mcp_io_github_chr_take_screenshot()  // ✅ 确认跳转到 /inventory.html

// Step 5: 验证错误密码交互
mcp_io_github_chr_navigate_page({ type: "url", url: "https://www.saucedemo.com/" })
mcp_io_github_chr_fill({ uid: "<username-uid>", value: "standard_user" })
mcp_io_github_chr_fill({ uid: "<password-uid>", value: "wrong_password" })
mcp_io_github_chr_click({ uid: "<login-button-uid>" })
mcp_io_github_chr_wait_for({ text: "Username and password do not match" })
mcp_io_github_chr_take_screenshot()  // ✅ 确认错误提示出现
```

**登录页选择器表**

| data-test | 元素类型 | 用途 |
|-----------|---------|------|
| `username` | `input[text]` | 用户名输入框 |
| `password` | `input[password]` | 密码输入框 |
| `login-button` | `input[submit]` | 登录按钮 |
| `error` | `h3` | 错误提示（失败时出现） |

---

## Phase 3: Code（生成 POM → 生成测试脚本）

### 3.1 Prompt 1 输入（生成 LoginPage）

```
## 目标页面
URL: https://www.saucedemo.com/
页面名称: LoginPage

## 选择器表
| data-test    | 元素类型         | 用途     |
|-------------|-----------------|---------|
| username    | input[text]     | 用户名输入框 |
| password    | input[password] | 密码输入框 |
| login-button| input[submit]   | 登录按钮 |
| error       | h3              | 错误提示 |

## 测试用例涉及的交互
- 正常登录: 填写用户名 → 密码 → 点击 Login → 验证跳转到 /inventory.html
- 登录失败: 填写用户名 + 错误密码 → 点击 Login → 验证错误提示文案
- 空用户名: 不填用户名 → 填密码 → 点击 Login → 验证错误提示文案
```

### 3.2 生成的 POM 文件

```typescript
// pages/LoginPage.ts
import { Page, expect } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  // --- Locators ---
  readonly usernameInput = this.page.getByTestId('username');
  readonly passwordInput = this.page.getByTestId('password');
  readonly loginButton   = this.page.getByTestId('login-button');
  readonly errorMessage  = this.page.getByTestId('error');

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
  async expectLoginSuccess() {
    await expect(this.page).toHaveURL(/inventory\.html/);
    await expect(this.page.getByText('Products')).toBeVisible();
  }

  async expectLoginError(message: string) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(message);
  }
}
```

### 3.3 Prompt 2 输入（生成测试脚本）

```
## 材料1：测试用例文档（可自动化部分）
| US002-LOGIN-001 | 正确凭证登录成功 | P0 | 前提: 打开登录页 | 输入 standard_user/secret_sauce → 点击 Login | URL=/inventory.html, 标题显示 Products |
| US002-LOGIN-002 | 错误密码显示错误提示 | P1 | 前提: 打开登录页 | 输入 standard_user/wrong_password → 点击 Login | 显示 "Username and password do not match..." |
| US002-LOGIN-003 | 用户名为空显示提示 | P1 | 前提: 打开登录页 | 用户名留空/输入密码 → 点击 Login | 显示 "Username is required" |

## 材料2：POM 类方法定义
class LoginPage:
  - goto()
  - login(username: string, password: string)
  - expectLoginSuccess()
  - expectLoginError(message: string)

## 材料3：测试数据
有效账号: standard_user / secret_sauce
错误密码: wrong_password
```

### 3.4 生成的测试脚本

```typescript
// tests/us002-login.spec.ts
import { test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

const VALID_USER = { username: 'standard_user', password: 'secret_sauce' };

test.describe('US002 用户登录', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('US002-LOGIN-001 正确凭证登录成功', async () => {
    await loginPage.login(VALID_USER.username, VALID_USER.password);
    await loginPage.expectLoginSuccess();
  });

  test('US002-LOGIN-002 错误密码显示错误提示', async () => {
    await loginPage.login(VALID_USER.username, 'wrong_password');
    await loginPage.expectLoginError(
      'Username and password do not match any user in this service'
    );
  });

  test('US002-LOGIN-003 用户名为空显示提示', async () => {
    await loginPage.login('', VALID_USER.password);
    await loginPage.expectLoginError('Username is required');
  });
});
```

---

## Phase 4: Execute（执行）

```bash
# 运行 US002 登录测试
npx playwright test tests/us002-login.spec.ts

# 带 UI 调试
npx playwright test tests/us002-login.spec.ts --debug

# 查看报告
npx playwright show-report
```

**预期结果**: 3 个测试全部通过，执行时间 < 15 秒

---

## Phase 5: Diagnose（故障诊断示例）

### 示例：US002-LOGIN-001 登录后 URL 断言失败

**错误信息**:
```
Error: expect(received).toHaveURL(expected)
Expected pattern: /inventory\.html/
Received: "https://www.saucedemo.com/"
```

**诊断步骤**:

```javascript
// 1. 截图确认当前页面状态
mcp_io_github_chr_navigate_page({ type: "url", url: "https://www.saucedemo.com/" })
mcp_io_github_chr_take_screenshot({ fullPage: true })

// 2. 检查登录按钮是否可点击
mcp_io_github_chr_take_snapshot({ verbose: true })

// 3. 手动执行登录，观察响应
mcp_io_github_chr_fill({ uid: "<username-uid>", value: "standard_user" })
mcp_io_github_chr_fill({ uid: "<password-uid>", value: "secret_sauce" })
mcp_io_github_chr_click({ uid: "<login-button-uid>" })
mcp_io_github_chr_take_screenshot()  // 看跳转后的实际页面

// 4. 读取当前 URL 确认
mcp_io_github_chr_evaluate_script({
  function: `() => window.location.href`
})
```

**常见根因**:
- 凭证变更 → 检查测试账号是否仍有效
- 页面加载慢 → 在 `expectLoginSuccess()` 中增加 `timeout` 参数
- 选择器失效 → 重新执行 Phase 2 确认 `data-test` 属性未变

---

## 文件结构总览

```
project/
├── docs/test-cases/
│   └── US002-login-测试用例.md       ← Phase 1 输出
├── pages/
│   └── LoginPage.ts                  ← Phase 3 输出
└── tests/
    └── us002-login.spec.ts           ← Phase 3 输出
```
