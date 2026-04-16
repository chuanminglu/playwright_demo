# 完整 5 阶段工作流

## 流程图

```
需求文档 / User Story
       │
       ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Phase 1: ANALYZE（需求分析 → 测试用例）                              │
│  工具: AI + Prompt 0                                                 │
│  输入: User Story / 验收标准 / 业务规则                               │
│  输出: docs/test-cases/{功能}-测试用例.md                             │
│        ├── 测试覆盖矩阵（验收规则 → 测试用例映射）                      │
│        └── 测试用例表格（用例编号/优先级/标签/步骤/预期结果）           │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ 读取测试用例，识别涉及哪些页面
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Phase 2: EXPLORE（定向探索 → 提取选择器）                            │
│  工具: Chrome DevTools MCP                                           │
│  输入: 测试用例文档（涉及的页面 URL）                                 │
│  输出: 每个页面的 data-test 选择器表 + 交互验证截图                   │
│  原则: 只探索测试用例覆盖的页面，不做全站扫描                          │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ 选择器 + 测试用例 → 生成代码
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Phase 3: CODE（POM → 测试脚本）                                     │
│  工具: AI + Prompt 1（POM）+ Prompt 2（测试脚本）                    │
│  顺序: 必须先生成 POM，再生成测试脚本                                 │
│  输出:                                                               │
│    pages/{PageName}Page.ts  ← 所有选择器和交互方法在这里              │
│    tests/{feature}.spec.ts  ← 只调用 POM 方法，无原始选择器          │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Phase 4: EXECUTE（执行 → 测试报告）                                 │
│  工具: Playwright + GitHub Actions                                   │
│  本地: npx playwright test                                           │
│  CI: .github/workflows/e2e.yml                                       │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ 测试失败时
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Phase 5: DIAGNOSE（定位根因 → 修复）                                │
│  工具: Chrome DevTools MCP                                           │
│  流程: 重现 → 截图 → 控制台错误 → 网络请求 → 根因分析                │
│        修复后返回 Phase 3 更新 POM 或测试脚本                        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Analyze（需求 → 测试用例）

### 前提：收集输入材料

在执行 Prompt 0 之前，准备以下材料：

```
必须提供（至少1项）:
  ✅ User Story（用户故事，含验收标准）
  ✅ 验收规则清单（功能规则 / 数据规则 / 异常规则）

可选提供:
  📄 系统名称 + 功能模块路径
  📄 业务约束（测试环境 URL、测试数据规则）
```

### 测试用例覆盖要求

| 场景类型 | 优先级 | 说明 |
|----------|--------|------|
| 正常路径（Happy Path） | P0 | 核心业务流程端到端，每功能 1-3 个 |
| 参数验证 | P1 | 输入格式/长度/类型约束，每规则 1-2 个 |
| 异常场景 | P1 | 错误提示、边界值处理，每异常规则 1 个 |
| 性能/安全 | P2 | 响应时间、权限控制，按需添加 |

### 测试用例表格字段（标准格式）

| 字段 | 说明 | 规范 |
|------|------|------|
| 用例编号 | `{系统}-{模块}-{序号}` | 如 `SWAG-LOGIN-001` |
| 系统 | 被测系统名称 | 全称 |
| 功能模块 | 模块路径 | 用 `-` 分隔，如 `认证管理-登录` |
| 用例概述 | 10-20 字描述 | 含场景类型，如 `正常登录流程（有效凭证）` |
| 优先级 | P0/P1/P2 | 见上表 |
| 标签 | 测试类型 | `功能测试,正常流程,可自动化` |
| 前提条件 | 执行前置条件 | 编号列表 |
| 输入数据或操作 | 详细步骤 | 编号列表，操作对象+具体值 |
| 输出数据或操作 | 系统中间响应 | 可选 |
| 预期结果 | 量化验证点 | 编号列表，禁用模糊词 |
| 测试结果 | 执行结果 | 默认「待测试」 |

### 质量红线

```
❌ 禁止: "系统正常响应" "页面正确显示" "操作成功"
✅ 要求: "显示提示'用户名或密码错误'" "跳转到 /inventory.html" "购物车角标显示 '2'"

❌ 禁止: 测试用例从 UI 截图归纳而来
✅ 要求: 测试用例从验收标准中每条规则推导
```

---

## Phase 2: Explore（定向探索选择器）

### 探索策略

**读取测试用例文档 → 识别涉及的页面 → 逐页探索**

```
测试用例: SWAG-LOGIN-001「标准用户登录」
  涉及页面:
    - /（登录页）→ 需要: username输入框、password输入框、Login按钮、error提示
    - /inventory.html（成功后）→ 需要: 页面标题，验证跳转成功
```

### 标准探索步骤（每个页面执行一次）

```javascript
// --- Step 1: 打开目标页面 ---
mcp_io_github_chr_new_page({ url: "TARGET_URL" })

// --- Step 2: 截图（分析布局，确认是正确页面）---
mcp_io_github_chr_take_screenshot({ fullPage: true })

// --- Step 3: DOM 快照（获取 UID，用于后续交互验证）---
mcp_io_github_chr_take_snapshot({ verbose: true })

// --- Step 4: 提取所有 data-test / data-testid 选择器 ---
mcp_io_github_chr_evaluate_script({
  function: `() => {
    const r = {};
    document.querySelectorAll('[data-test],[data-testid],input,button,select').forEach(el => {
      const k = el.dataset?.test || el.dataset?.testid || el.id;
      if (k) r[k] = { tag: el.tagName, type: el.type || '', text: el.innerText?.slice(0,30) };
    });
    return r;
  }`
})

// --- Step 5: 验证测试用例中的关键交互 ---
// 按测试用例「输入数据或操作」步骤，逐一验证可行性
mcp_io_github_chr_fill({ uid: "UID_FROM_SNAPSHOT", value: "test_value" })
mcp_io_github_chr_click({ uid: "BUTTON_UID" })
mcp_io_github_chr_wait_for({ text: "预期出现的文本", timeout: 3000 })
mcp_io_github_chr_take_screenshot()  // 验证截图
```

### 探索输出整理（提供给 Prompt 1）

每个页面产出一张选择器表：

```markdown
## {页面名} 选择器表
URL: {URL}

| data-test / data-testid | HTML ID | 元素类型 | 用途 |
|------------------------|---------|---------|------|
| username               | user-name | input[text] | 用户名输入框 |
| password               | password | input[password] | 密码输入框 |
| login-button           | login-button | button | 登录提交 |
| error                  | — | h3 | 错误提示（失败时出现） |
```

---

## Phase 3: Code（生成 POM → 生成测试脚本）

### 3.1 先生成 Page Objects（Prompt 1）

**输入**: Phase 2 整理的选择器表 + 截图  
**输出**: `pages/{PageName}Page.ts`

```typescript
// 每个页面一个类，包含 4 类成员:
export class LoginPage {
  // 1. Locators（选择器，全部在这里，不在测试文件里）
  readonly usernameInput = this.page.getByTestId('username');
  readonly passwordInput = this.page.getByTestId('password');
  readonly loginButton   = this.page.getByTestId('login-button');
  readonly errorMessage  = this.page.getByTestId('error');

  // 2. Navigation
  async goto() { await this.page.goto('https://...'); }

  // 3. Actions（封装操作步骤）
  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  // 4. Assertions（封装断言）
  async expectLoginError(message: string) {
    await expect(this.errorMessage).toContainText(message);
  }
}
```

### 3.2 再生成测试脚本（Prompt 2）

**输入**: 测试用例文档中标记「可自动化」的条目 + 已生成的 POM 类  
**输出**: `tests/{feature}.spec.ts`

```typescript
// 测试文件只做三件事：实例化 POM、调用方法、断言结果
test.describe('SWAG-LOGIN 登录功能', () => {
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  // 用例 SWAG-LOGIN-001: 正常登录流程
  test('SWAG-LOGIN-001 标准用户正常登录', async ({ page }) => {
    await loginPage.login('standard_user', 'secret_sauce');
    await expect(page).toHaveURL(/inventory/);
    await expect(page.getByTestId('title')).toHaveText('Products');
  });

  // 用例 SWAG-LOGIN-002: 错误密码
  test('SWAG-LOGIN-002 错误密码显示错误提示', async () => {
    await loginPage.login('standard_user', 'wrong_password');
    await loginPage.expectLoginError('Username and password do not match');
  });
});
```

---

## Phase 4: Execute（执行）

### 本地执行
```bash
npx playwright test                        # 全部测试
npx playwright test tests/login.spec.ts    # 指定文件
npx playwright test --grep "SWAG-LOGIN"    # 按名称过滤
npx playwright test --debug                # 调试模式（带浏览器 UI）
npx playwright test --ui                   # Playwright UI 模式
npx playwright show-report                 # 查看 HTML 报告
```

### GitHub Actions 配置
```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: test-results
          path: |
            test-results/
            playwright-report/
```

---

## Phase 5: Diagnose（故障诊断）

### 诊断流程

```
失败报告
   │
   ▼ 读取错误信息（元素未找到 / 超时 / 断言失败）
   │
   ▼ 用 MCP 重现失败
      mcp_io_github_chr_navigate_page({ type: "url", url: FAILING_URL })
      // 执行失败前的操作步骤
   │
   ▼ 并行诊断
      mcp_io_github_chr_take_screenshot()
      mcp_io_github_chr_list_console_messages({ types: ["error"] })
      mcp_io_github_chr_list_network_requests({ resourceTypes: ["xhr","fetch"] })
   │
   ▼ 根因定位（见下表）
   │
   ▼ 修复：更新 POM 选择器 / 修复测试步骤 / 修复后端 API
```

### 症状 → 根因 → 修复

| 症状 | MCP 诊断命令 | 常见根因 | 修复方向 |
|------|------------|---------|---------|
| `locator not found` 元素未找到 | `take_snapshot` | 选择器变更；条件渲染未出现 | 更新 POM 选择器；加等待条件 |
| `Timeout exceeded` 等待超时 | `list_network_requests` | API 慢 / 返回错误 | 增加超时；Mock API；修复后端 |
| `toContainText` 断言失败 | `evaluate_script` 读取实际值 | 数据未加载；文本变更 | 加载等待；更新预期值 |
| 隐式错误 / 页面空白 | `list_console_messages` | JS 异常；资源加载失败 | 修复 JS 错误；检查资源路径 |
| 跳转到错误 URL | `take_screenshot` | 前置状态不满足；环境差异 | 检查 beforeEach；环境变量 |

---

## 附：AUTO 模式（测试用例文档已就绪时）

当 `docs/test-cases/{功能}-测试用例.md` 已完整时，可一键生成：

**触发**: 使用 `references/prompts.md` → Prompt 3

```
输入: docs/test-cases/{功能}-测试用例.md
自动输出:
  pages/{PageName}Page.ts   （每个涉及的页面生成一个 POM）
  pages/index.ts             （统一导出）
  tests/{feature}.spec.ts    （标记「可自动化」的用例全部生成）
  .github/workflows/e2e.yml  （CI 配置，如未存在）
```

> ⚠️ AUTO 模式的前提是 Phase 2 已完成：各页面选择器已通过 MCP 探索确认
