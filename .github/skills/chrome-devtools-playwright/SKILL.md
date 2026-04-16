---
name: chrome-devtools-playwright
description: AI辅助E2E测试工作流，遵循需求驱动的专业测试流程：从User Story生成测试用例 → MCP定向探索页面提取选择器 → 生成POM和测试脚本 → CI执行 → MCP诊断失败。用于从需求出发建立完整E2E测试套件。
---

# Chrome DevTools + Playwright 测试技能

**需求驱动工作流**: 先从业务需求生成测试用例，再用 MCP 探索页面找选择器，最后生成代码执行

## 核心原则

> **测试用例来源于需求，不来源于 UI 探索**  
> MCP 探索的目的是「找到如何实现测试」，而不是「发现要测什么」

## 适用场景

- 从 User Story / 验收标准 / 需求文档出发，建立 E2E 测试套件
- 已有测试用例文档，需要生成 POM 和测试脚本
- 诊断 CI/CD 中失败的测试

## 5阶段工作流

```
ANALYZE → EXPLORE → CODE → EXECUTE → DIAGNOSE
  (AI)     (MCP)    (AI)    (CI)      (MCP)
    ↑                                    │
    └────────── (on failure) ────────────┘
```

| 阶段 | 驱动工具 | 输入 | 输出 | 放行条件 |
|------|---------|------|------|--------|
| **1. Analyze** | AI (Prompt 0) | User Story / 验收标准 | 测试用例文档 | 🛑 **Gate 1**: 人工评审通过 |
| **2. Explore** | MCP | 测试用例（涉及哪些页面） | 各页面选择器表 | 自动流转 |
| **3. Code** | AI (Prompt 1 → Prompt 2) | 测试用例 + 选择器 | POM 类 + 测试脚本 | 🛑 **Gate 2**: tsc 编译通过 + 人工抽查 |
| **4. Execute** | Playwright / CI | 测试脚本 | 测试报告 | 自动流转 |
| **5. Diagnose** | MCP + AI | 失败信息 | 根因 + 修复方案 | 自动流转 |

---

## Phase 1: Analyze（需求 → 测试用例）

**这是整个流程的起点，测试用例必须从需求中推导，而不是从 UI 归纳。**

### 输入
- User Story（用户故事）
- 验收标准（AC）
- 业务规则、约束条件

### 执行
使用 `references/prompts.md` → **Prompt 0**，输入需求材料，让 AI 生成测试用例文档。

### 输出位置
```
docs/test-cases/
└── {功能名称}-测试用例.md
```

### 测试用例文档结构
```markdown
# {功能名称}功能测试用例清单

## 测试范围
- 关联用户故事、总数、P0/P1/P2 分布、可自动化数量

## 测试覆盖矩阵
| 验收规则ID | 规则描述 | 对应测试用例 | 覆盖状态 |

## 功能测试用例列表
| 用例编号 | 系统 | 功能模块 | 用例概述 | 优先级 | 标签 |
| 前提条件 | 输入数据或操作 | 输出数据或操作 | 预期结果 | 测试结果 |
```

### 覆盖场景（必须包含）
- ✅ P0 — 正常路径（Happy Path）：核心业务流程端到端
- ✅ P1 — 参数验证：格式、长度、类型约束
- ✅ P1 — 异常场景：错误提示、边界值
- ✅ P2 — 性能/安全（按需）

See: `references/prompts.md` → Prompt 0

### 🛑 Gate 1 — 测试用例人工评审（必须通过才能进入 Phase 2）

在测试用例文档末尾添加以下评审记录后方可继续：

```markdown
## 评审记录
- [ ] 所有 AC / 规则均有对应用例（覆盖矩阵无空白行）
- [ ] P0 用例覆盖核心 Happy Path
- [ ] P1 用例覆盖参数验证和异常场景
- [ ] 推断用例已标注「待确认」
- [ ] 可自动化标签标注正确

**评审人**: ___  **日期**: ___  **状态**: ⬜ 待审 / ✅ 通过 / ❌ 退回
```

> ⚠️ 状态为 ✅ 通过 之前，禁止进入 Phase 2

---

## Phase 2: Explore（定向探索，提取选择器）

**目标**: 针对测试用例中涉及的页面，提取实现测试所需的选择器，**不做全站扫描**。

### 2.1 只探索用例涉及的页面

先阅读测试用例文档，识别需要哪些页面：
```
// 例：登录测试用例涉及的页面
- /login（登录页）
- /dashboard（登录成功后的目标页）
```

### 2.2 定向探索每个页面

```javascript
// Step 1: 打开页面截图
mcp_io_github_chr_new_page({ url: "TARGET_PAGE_URL" })
mcp_io_github_chr_take_screenshot({ fullPage: true })

// Step 2: 获取 DOM 快照（含 UID）
mcp_io_github_chr_take_snapshot({ verbose: true })

// Step 3: 提取 data-test / data-testid 选择器
mcp_io_github_chr_evaluate_script({
  function: `() => {
    const result = {};
    document.querySelectorAll('[data-test], [data-testid], input, button, a').forEach(el => {
      const key = el.dataset?.test || el.dataset?.testid || el.id;
      if (key) result[key] = { tag: el.tagName, type: el.type, text: el.innerText?.slice(0,30) };
    });
    return result;
  }`
})

// Step 4: 验证关键交互（按测试用例步骤验证可行性）
mcp_io_github_chr_fill({ uid: "USERNAME_UID", value: "test_user" })
mcp_io_github_chr_click({ uid: "SUBMIT_UID" })
mcp_io_github_chr_wait_for({ text: "EXPECTED_RESULT_TEXT", timeout: 3000 })
mcp_io_github_chr_take_screenshot()
```

### 2.3 选择器优先级

| 优先级 | 方法 | 稳定性 |
|--------|------|--------|
| 1 | `data-test` / `data-testid` | ⭐⭐⭐ 最稳定 |
| 2 | Role + Name | ⭐⭐⭐ |
| 3 | Label / Placeholder | ⭐⭐ |
| 4 | 文本内容 | ⭐ |
| 5 | CSS class | ⚠️ 避免 |

### 2.4 选择器表输出格式（Phase 2 产出物）

MCP `evaluate_script` 返回原始 JSON 后，整理为以下标准表格格式，
作为 Phase 3 Prompt 1 的输入材料：

```markdown
### {页面名称} 选择器表
URL: {页面 URL}
属性类型: data-test   ← 记录实际属性名，供 POM 生成时选择 locator 方式

| 属性值 | 标签 | type | placeholder | 用途（结合测试用例推断） |
|--------|-----|------|-------------|------------------------|
| login-container    | div   | —        | —        | 登录表单容器（仅布局，不需选择） |
| username           | input | text     | Username | 用户名输入框 |
| password           | input | password | Password | 密码输入框 |
| login-button       | input | submit   | —        | 登录按钮 |
| error              | h3    | —        | —        | 错误提示（失败时出现）|
```

> **注意**：原始 JSON 可能包含布局容器等不需要选择的元素，
> 整理时只保留测试用例中实际需要交互或断言的元素。

See: `references/prompts.md` → Prompt 1（生成 POM）

---

## Phase 3: Code（生成 POM → 生成测试脚本）

**顺序严格**: 先生成 Page Objects，再生成测试脚本

### 3.1 生成 Page Objects

**输入**: Explore 阶段的选择器 + 截图  
**使用**: `references/prompts.md` → Prompt 1  
**输出位置**: `pages/{PageName}Page.ts`

```typescript
// ✅ POM 负责所有选择器和交互方法
export class LoginPage {
  readonly usernameInput = this.page.getByTestId('username');
  readonly loginButton   = this.page.getByTestId('login-button');
  async login(user: string, pass: string) { ... }
}

// ❌ 测试脚本中不能有原始选择器
await page.click('[data-test="login-button"]');  // 错误

// ✅ 测试脚本只调用 POM 方法
await loginPage.login('standard_user', 'secret_sauce');  // 正确
```

### 3.2 生成测试脚本

**输入**: 测试用例文档（标记「可自动化」的条目）+ POM 类  
**使用**: `references/prompts.md` → Prompt 2  
**输出位置**: `tests/{feature}.spec.ts`

**映射规则**:
| 测试用例字段 | 代码元素 |
|-------------|---------|
| 前提条件 | `test.beforeEach()` 或 `test.step()` |
| 输入数据或操作 | POM 方法调用（`await` 语句） |
| 预期结果 | `expect()` 断言 |
| 用例概述 | `test('用例概述', ...)` 名称 |

### 输出文件结构

```
pages/                          # Page Objects（选择器在这里）
├── LoginPage.ts
├── InventoryPage.ts
└── index.ts                    # 统一导出
tests/
├── fixtures/
│   └── {feature}-data.ts       # 测试数据
└── {feature}.spec.ts           # 测试脚本（无原始选择器）
```

See: `references/page-object-template.md` — POM 模板  
See: `references/prompts.md` → Prompt 1, Prompt 2

### 🛑 Gate 2 — POM 代码评审（必须通过才能进入 Phase 4）

```bash
# 自动检查：编译通过（0 错误）
npx tsc --noEmit
```

人工抽查清单：
```markdown
- [ ] Locators 区：每个 locator 与 Phase 2 选择器表一一对应
- [ ] locator 写法为 page.locator('[data-test="..."]')（不依赖 config）
- [ ] Actions 区：方法名语义清晰，步骤顺序与测试用例一致
- [ ] Assertions 区：断言覆盖测试用例中所有预期结果字段
- [ ] spec 文件中无原始 CSS/XPath 选择器
- [ ] npx tsc --noEmit 无报错

**检查人**: ___  **日期**: ___  **状态**: ⬜ 待查 / ✅ 通过 / ❌ 需修改
```

> ⚠️ 状态为 ✅ 通过 之前，禁止执行 Phase 4

---

## Phase 4: Execute（执行）

```bash
npx playwright test                    # 全部测试
npx playwright test login.spec         # 指定文件
npx playwright test --debug            # 调试模式
npx playwright test --ui               # UI 交互模式
```

```yaml
# .github/workflows/e2e.yml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: failure()
        with: { name: test-results, path: test-results/ }
```

---

## Phase 5: Diagnose（故障诊断）

```javascript
// 1. 重现失败场景
mcp_io_github_chr_navigate_page({ type: "url", url: FAILING_URL })
// ... 重复失败操作

// 2. 检查控制台错误
mcp_io_github_chr_list_console_messages({ types: ["error"] })

// 3. 检查网络请求
mcp_io_github_chr_list_network_requests({ resourceTypes: ["xhr", "fetch"] })

// 4. 截图查看当前状态
mcp_io_github_chr_take_screenshot()
```

| 症状 | MCP 命令 | 检查项 |
|------|---------|--------|
| 元素未找到 | `take_snapshot` | 选择器是否变更 |
| 等待超时 | `list_network_requests` | API 是否慢/失败 |
| 值断言失败 | `list_console_messages` + `evaluate_script` | 实际值是什么 |
| 视觉异常 | `take_screenshot` | 页面状态对比 |

See: `references/diagnosis.md` — 故障诊断详细模式

---

## 推荐目录结构

```
project/
├── docs/
│   └── test-cases/                   # Phase 1 输出
│       └── {功能}-测试用例.md
├── pages/                            # Phase 3 输出（POM）
│   ├── LoginPage.ts
│   └── index.ts
├── tests/                            # Phase 3 输出（脚本）
│   ├── fixtures/
│   │   └── {feature}-data.ts
│   └── {feature}.spec.ts
├── .github/workflows/e2e.yml
├── playwright.config.ts
└── package.json
```

---

## 🚀 AUTO 模式：文档已就绪时一键生成代码

当 Phase 1 的测试用例文档（`docs/test-cases/*.md`）已完整，可跳过 Prompt 0 直接触发：

```
[测试用例文档] → AUTO → [POM] + [测试脚本] + [CI配置]
```

**触发方式**:
```
请根据测试用例文档，自动生成所有测试代码

输入: docs/test-cases/{功能}-测试用例.md
输出:
- pages/*.ts            (所有 Page Objects)
- tests/*.spec.ts       (所有测试脚本)
- .github/workflows/e2e.yml
```

See: `references/prompts.md` → Prompt 3（AUTO 模式）

---

## 快速开始

### 标准流程（从需求开始）

```bash
# Phase 1: AI 生成测试用例（使用 Prompt 0）
# 输出: docs/test-cases/{功能}-测试用例.md

# Phase 2: MCP 定向探索各页面，提取选择器

# Phase 3: AI 生成 POM（Prompt 1）和测试脚本（Prompt 2）
# 输出: pages/*.ts + tests/*.spec.ts

# Phase 4: 执行
npx playwright test

# Phase 5: 诊断失败（使用 MCP 命令）
```

### 快速通道（测试用例已就绪）

```bash
# 1. 确认已有 docs/test-cases/{功能}-测试用例.md
# 2. MCP 探索选择器（Phase 2）
# 3. 触发 AUTO 模式（Prompt 3）自动生成所有代码
npx playwright test
```
