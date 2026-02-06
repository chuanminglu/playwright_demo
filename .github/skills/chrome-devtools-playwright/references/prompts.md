# AI Generation Prompts

## Prompt 1: Generate Page Object

```
Based on the page exploration results, generate a Playwright Page Object Model.

**Page URL:** {URL}

**Elements found (from MCP snapshot):**
{PASTE_SNAPSHOT_OR_SELECTORS}

**Generate a TypeScript class with:**
1. Locators - readonly Locator properties
2. Actions - methods for user interactions  
3. Getters - methods returning page data
4. Assertions - expect helper methods

**Locator priority:** data-testid > data-test > role+name > label > text > class

**Output location:** tests/pages/{PageName}Page.ts
```

## Prompt 2: Generate Test Specs

```
Based on the {PageName}Page Page Object and test case document, generate Playwright tests.

**Test case document:** docs/test-cases/{功能}-测试用例.md

**Requirements:**
- Group with test.describe
- Common setup in test.beforeEach
- One focus per test
- Descriptive test names (Chinese supported)
- Use POM methods only (no raw selectors)
- Match test cases marked as "可自动化"

**Output location:** tests/{feature}.spec.ts
```

## Prompt 3: Analyze Page for Testing

```
Analyze this page screenshot/snapshot for E2E testing.

**Identify:**
1. Main functional areas
2. Interactive elements (buttons, inputs, links)
3. Data display regions
4. Key user flows

**For each element, suggest:**
- Test scenario
- Recommended selector strategy
- Edge cases to cover
```

## Prompt 4: Diagnose Test Failure

```
Test failed:
{ERROR_MESSAGE}

Console output:
{CONSOLE_MESSAGES}

Network requests:
{NETWORK_REQUESTS}

**Analyze:**
1. Direct cause
2. Root cause  
3. Fix recommendations
4. Verification steps
```

## Prompt 5: Generate Test Data

```
Generate test data for {FEATURE} covering:
- Valid inputs (happy path)
- Boundary values
- Invalid inputs
- Edge cases

**Output format:** JSON or TypeScript object
**Output location:** tests/fixtures/{feature}-data.ts
```

## Prompt 6: Generate Test Case Document 🆕

```
基于页面探索结果，生成功能测试用例文档。

**系统名称:** {SYSTEM_NAME}
**功能模块:** {MODULE_PATH}
**页面URL:** {URL}

**探索结果:**
{PASTE_EXPLORATION_RESULTS}

**生成要求:**
1. 使用Markdown表格格式
2. 包含测试覆盖矩阵
3. 每个功能生成5-15个测试用例
4. 优先级分布：P0(20%) / P1(50%) / P2(30%)
5. 标记可自动化的用例

**测试用例表格字段:**
- 用例编号: {系统}-{模块}-{序号}
- 系统
- 功能模块
- 用例概述
- 优先级 (P0/P1/P2)
- 标签 (功能测试,异常测试,边界测试,可自动化)
- 前提条件
- 输入数据或操作 (详细步骤，使用编号列表)
- 预期结果 (量化，使用编号列表)
- 测试结果 (默认"待测试")

**覆盖场景:**
1. 正常路径 (P0)
2. 参数验证 (P1)
3. 异常场景 (P1)
4. 边界值 (P1-P2)

**输出位置:** docs/test-cases/{功能名称}-测试用例.md

**参考模板:** references/test-case-template.md
```

## Prompt 7: Convert Test Case to Code 🆕

```
将测试用例文档转化为Playwright测试代码。

**测试用例文档:** docs/test-cases/{功能}-测试用例.md

**Page Objects:**
{PASTE_POM_DEFINITIONS}

**转化规则:**
1. 只转化标记为"可自动化"的用例
2. 前提条件 → test.beforeEach 或 test.step
3. 输入数据或操作 → await 语句
4. 预期结果 → expect() 断言
5. 用例概述 → test 名称

**输出位置:** tests/{feature}.spec.ts
```

## Prompt 8: AUTO模式 - 一键生成全部测试 🆕

```
根据测试用例文档，自动生成所有测试代码。

**输入:** docs/test-cases/{功能}-测试用例.md

**执行步骤:**

### Step 1: 分析测试文档
- 读取测试用例文档
- 提取所有标记为"可自动化"的用例
- 识别涉及的页面和功能模块

### Step 2: 生成 Page Objects
对每个涉及的页面，生成:
- pages/{PageName}Page.ts
- 包含所有需要的选择器和方法

### Step 3: 生成 pages/index.ts
```typescript
export * from './LoginPage';
export * from './InventoryPage';
// ... 导出所有Page Objects
```

### Step 4: 生成测试脚本
按功能模块分组，生成:
- tests/{module}.spec.ts
- 每个测试对应一个用例
- 使用 POM 方法

### Step 5: 生成 CI 配置
- .github/workflows/e2e.yml

### Step 6: 生成配置文件
- playwright.config.ts
- package.json (如不存在)

**输出结构:**
```
project/
├── docs/test-cases/          # 已有
├── pages/                    # 生成
│   ├── {PageName}Page.ts
│   └── index.ts
├── tests/                    # 生成
│   └── {module}.spec.ts
├── .github/workflows/e2e.yml # 生成
├── playwright.config.ts      # 生成
└── package.json              # 生成/更新
```

**验证命令:**
```bash
npm install
npx playwright install chromium
npx playwright test
```
```

## Tips

**Selector extraction:**
```
From this DOM snapshot, extract selectors for interactive elements.
Prefer data-testid > role+name > label > text > class
```

**Test naming:** `Feature_Scenario_ExpectedResult`
```typescript
test('Login_ValidCredentials_RedirectsToDashboard', ...)
test('Login_EmptyPassword_ShowsError', ...)
```
