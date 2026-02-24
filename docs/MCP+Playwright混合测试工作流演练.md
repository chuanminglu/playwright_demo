# MCP + Playwright 混合测试工作流演练

> **场景定位**: AI 辅助测试开发的最佳实践，结合 Chrome DevTools MCP 的探索能力和 Playwright 的工程化能力
> 
> **适用对象**: 测试工程师、前端开发、DevOps 工程师
> 
> **预计时长**: 2-3 小时

---

## 📌 场景背景

### 业务场景

[Swag Labs](https://www.saucedemo.com/) 是一个用于自动化测试练习的电商演示网站，包含以下核心功能：
- 用户登录/登出
- 商品浏览与排序
- 添加商品到购物车
- 购物车管理
- 完整结账流程

测试团队需要：
1. **快速理解** Swag Labs 各页面的结构和交互逻辑
2. **生成** 可维护的自动化测试脚本（POM 模式）
3. **集成** 到 CI/CD 流水线
4. **诊断** 测试失败的根因

### 传统痛点

| 问题 | 传统方式 | 耗时 |
|------|----------|------|
| 理解新页面 | 手动点击探索 + 查看源码 | 2-4 小时 |
| 编写测试脚本 | 从零开始写 | 4-8 小时 |
| 定位元素选择器 | F12 反复查找 | 1-2 小时 |
| 诊断失败原因 | 本地复现 + 日志分析 | 1-3 小时 |

### 解决方案

**MCP + Playwright 混合工作流**：

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  阶段1: 探索 (MCP)     阶段2: 生成 (AI)     阶段3: 执行     │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐ │
│  │ 截图+快照   │  →   │ 分析+生成   │  →   │ Playwright  │ │
│  │ 理解页面    │      │ 测试代码    │      │ CI/CD 运行  │ │
│  └─────────────┘      └─────────────┘      └─────────────┘ │
│         ↑                                         │        │
│         │              阶段4: 诊断 (MCP)          │        │
│         │              ┌─────────────┐            │        │
│         └──────────────│ 失败分析    │←───────────┘        │
│                        │ 截图+日志   │                     │
│                        └─────────────┘                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 学习目标

完成本演练后，你将掌握：

1. **MCP 探索技能**: 使用 Chrome DevTools MCP 快速理解页面结构
2. **AI 生成技能**: 让 AI 基于探索结果生成高质量 Playwright 测试代码
3. **CI/CD 集成**: 将测试脚本集成到 GitHub Actions
4. **智能诊断**: 使用 MCP + AI 诊断测试失败原因

---

## 📋 前置准备

### 工具总览

本演练涉及 **4 类工具**，下表列出完整清单及其在工作流中的角色：

| 序号 | 工具名称 | 用途（在本演练中的角色） | 必须/可选 |
|:----:|----------|--------------------------|:---------:|
| 1 | **Node.js** (≥18) | JavaScript 运行时，Playwright 的执行基础 | 必须 |
| 2 | **npm / pnpm** | 包管理器，安装 Playwright 等依赖 | 必须 |
| 3 | **Playwright** | E2E 测试框架，编写和运行自动化测试脚本 | 必须 |
| 4 | **TypeScript** | Playwright 脚本的编程语言 | 必须 |
| 5 | **VS Code** | 代码编辑器 + AI 对话宿主 + MCP 集成入口 | 必须 |
| 6 | **GitHub Copilot（含 Chat）** | VS Code 中的 AI 编程助手，负责分析页面、生成测试代码 | 必须 |
| 7 | **Chrome DevTools MCP Server** | 让 AI 通过 MCP 协议远程操控 Chrome 浏览器（截图、快照、填写、点击等） | 必须 |
| 8 | **Google Chrome 浏览器** | 被 MCP Server 远程调控的浏览器实例 | 必须 |
| 9 | **Git + GitHub** | 版本控制与 CI/CD（阶段3 GitHub Actions） | 阶段3必须 |

> **一句话理解工具关系**: VS Code 内的 AI（GitHub Copilot）通过 **MCP 协议** 连接到 **Chrome DevTools MCP Server**，MCP Server 再通过 **Chrome DevTools Protocol (CDP)** 控制 **Chrome 浏览器**。AI "看到"浏览器截图后分析页面，并生成 **Playwright** 测试代码。

### 工具关系图

```
┌──────────────────────────────────────────────────────────────────┐
│  VS Code 编辑器                                                  │
│  ┌────────────────────┐     MCP 协议       ┌──────────────────┐ │
│  │ GitHub Copilot     │ ◄──────────────── │ Chrome DevTools  │ │
│  │ (AI Chat)          │ ────────────────► │ MCP Server       │ │
│  │                    │  截图/快照/点击    │ (@anthropic-ai/  │ │
│  │ ·分析页面截图      │  等指令与结果     │  mcp-server-     │ │
│  │ ·生成测试代码      │                   │  chrome-devtools)│ │
│  │ ·诊断失败原因      │                   └────────┬─────────┘ │
│  └────────────────────┘                            │            │
│                                              CDP 协议           │
│  ┌────────────────────┐                            │            │
│  │ Playwright 测试    │                   ┌────────▼─────────┐ │
│  │ (npx playwright    │                   │ Chrome 浏览器    │ │
│  │  test)             │ ─ 独立运行测试 ─► │ (--remote-       │ │
│  │                    │                   │  debugging-port) │ │
│  └────────────────────┘                   └──────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

---

### 环境安装步骤

#### ① Node.js 18+（运行时环境）

> **是什么**: JavaScript/TypeScript 的运行时环境，Playwright 和 MCP Server 都依赖它。

- **下载地址**: https://nodejs.org/ （推荐 LTS 版本，如 20.x）
- **验证安装**:
  ```bash
  node --version   # 应输出 v18.x.x 或更高
  npm --version    # 应输出 9.x 或更高
  ```
- **Windows 提示**: 安装时勾选 "Add to PATH"，安装完成后重启终端生效。

#### ② Playwright（E2E 测试框架）

> **是什么**: 微软开源的端到端(E2E)测试框架，能自动化操控 Chromium、Firefox、WebKit 浏览器执行测试。

- **官网**: https://playwright.dev/
- **初始化项目**（如果是全新项目）:
  ```bash
  # 在项目根目录执行，会自动创建配置文件和示例测试
  npm init playwright@latest
  ```
- **在已有项目中安装**:
  ```bash
  npm install -D @playwright/test
  npx playwright install          # 下载浏览器引擎（Chromium/Firefox/WebKit）
  npx playwright install-deps     # 安装系统级依赖（Linux 需要）
  ```
- **验证安装**:
  ```bash
  npx playwright --version   # 应输出 Version 1.40.0 或更高
  ```
- **关键文件说明**:
  | 文件 | 说明 |
  |------|------|
  | `playwright.config.ts` | 测试配置（浏览器、超时、报告格式等） |
  | `tests/` 目录 | 存放测试脚本 `*.spec.ts` |
  | `pages/` 目录 | 存放 Page Object Model 类 |
  | `test-results/` 目录 | 测试运行结果（截图、视频、日志） |
  | `playwright-report/` 目录 | HTML 格式测试报告 |

#### ③ VS Code + GitHub Copilot（AI 编程助手）

> **是什么**: VS Code 是代码编辑器；GitHub Copilot 是 VS Code 中的 AI 插件，提供代码补全和 Chat 对话能力。本演练中 AI 的"分析截图→生成代码"能力依赖于 Copilot Chat。

- **VS Code 下载**: https://code.visualstudio.com/
- **安装 Copilot 插件**: 在 VS Code 扩展市场搜索并安装：
  | 插件名称 | 插件 ID | 说明 |
  |----------|---------|------|
  | GitHub Copilot | `GitHub.copilot` | AI 代码补全 |
  | GitHub Copilot Chat | `GitHub.copilot-chat` | AI 对话（本演练核心交互窗口） |
- **前提条件**: 需要 GitHub Copilot 订阅（个人版/企业版/教育版均可）。
- **验证**: 打开 VS Code → 侧边栏点击 Copilot Chat 图标 → 能正常对话即可。

#### ④ Chrome DevTools MCP Server（核心工具）

> **是什么**: MCP（Model Context Protocol）是 Anthropic 提出的开放协议，让 AI 模型能调用外部工具。Chrome DevTools MCP Server 是一个实现了该协议的服务，允许 AI 通过指令远程操控 Chrome 浏览器——截图、获取 DOM 快照、点击、填写表单等。
>
> **通俗理解**: 它就像一个"翻译官"，把 AI 的自然语言指令（"截取页面截图"）翻译成 Chrome 浏览器能理解的操作，再把结果（截图图片）返回给 AI。

- **前提**: 需要先安装 Node.js（步骤①）和 Chrome 浏览器
- **NPM 包名**: `@anthropic-ai/mcp-server-chrome-devtools` （或社区替代 `@anthropic-ai/chrome-devtools-mcp`）
- **GitHub 仓库**: https://github.com/anthropics/chrome-devtools-mcp

##### 配置方式一：VS Code MCP 配置（推荐）

在项目根目录创建 `.vscode/mcp.json`：

```json
{
  "servers": {
    "chrome-devtools": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@anthropic-ai/chrome-devtools-mcp@latest"
      ],
      "description": "Chrome DevTools MCP Server - 让 AI 操控 Chrome 浏览器"
    }
  }
}
```

> **说明**: `npx -y` 会自动下载并运行该包，无需全局安装。VS Code 启动 Copilot Chat 时会自动拉起 MCP Server。

##### 配置方式二：VS Code 用户级 settings.json

```json
{
  "github.copilot.chat.mcpServers": {
    "chrome-devtools": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@anthropic-ai/chrome-devtools-mcp@latest"]
    }
  }
}
```

##### 验证 MCP Server 是否生效

1. 打开 VS Code → Copilot Chat 面板
2. 在 Chat 输入框中输入：`打开 https://www.saucedemo.com/ 并截图`
3. 如果 AI 能自动调用 MCP 工具打开浏览器并返回截图 → ✅ 配置成功
4. 如果提示"无法调用工具"或"MCP server not found" → ❌ 检查配置文件路径和 Node.js 环境

##### MCP Server 提供的核心能力（本演练用到的）

| MCP 工具函数 | 功能说明 | 演练中的用途 |
|-------------|----------|-------------|
| `new_page` | 打开新页面/导航到 URL | 打开 Swag Labs 各页面 |
| `take_screenshot` | 截取页面截图（返回图片给 AI） | AI 视觉分析页面布局 |
| `take_snapshot` | 获取页面 DOM 无障碍树（文本格式） | 定位元素选择器和 uid |
| `fill` | 向输入框填写文本 | 填写用户名、密码、表单 |
| `click` | 点击页面元素 | 点击登录按钮、添加购物车 |
| `wait_for` | 等待页面出现指定文本 | 等待页面跳转完成 |
| `evaluate_script` | 在页面中执行 JavaScript | 提取元素属性、检查 DOM |
| `list_console_messages` | 获取浏览器控制台日志 | 诊断页面报错信息 |

#### ⑤ Chrome 浏览器

> **是什么**: Google Chrome 浏览器。MCP Server 通过 Chrome DevTools Protocol (CDP) 与它通信。

- **下载地址**: https://www.google.com/chrome/
- **版本要求**: 建议使用最新稳定版（≥120）
- **注意**: MCP Server 会自动启动 Chrome 实例（带远程调试端口），无需手动配置。

#### ⑥ Git + GitHub（阶段3 CI/CD 需要）

> **是什么**: Git 是版本控制工具，GitHub 提供代码托管和 CI/CD（GitHub Actions）。

- **Git 下载**: https://git-scm.com/
- **GitHub 账号**: https://github.com/
- **验证安装**:
  ```bash
  git --version   # 应输出 git version 2.x.x
  ```

---

### 环境自检清单

完成安装后，逐项验证：

```bash
# ✅ 1. Node.js 版本 ≥ 18
node --version

# ✅ 2. Playwright 已安装
npx playwright --version

# ✅ 3. Playwright 浏览器引擎已下载
npx playwright install --dry-run    # 查看已安装的浏览器

# ✅ 4. VS Code 已安装 Copilot 插件
# 在 VS Code 中打开 Copilot Chat，确认能正常对话

# ✅ 5. MCP Server 能正常启动
# 在 Copilot Chat 中输入"打开 https://example.com 并截图"，确认返回截图

# ✅ 6. Git 已安装（阶段3需要）
git --version
```

| 检查项 | 预期结果 | 状态 |
|--------|----------|:----:|
| `node --version` | v18.x.x 或 v20.x.x | ☐ |
| `npx playwright --version` | Version 1.40+ | ☐ |
| VS Code Copilot Chat 可用 | 能发送消息并收到回复 | ☐ |
| MCP 截图测试 | AI 返回网页截图并分析 | ☐ |
| `git --version` | git version 2.x.x | ☐ |

---

### Swag Labs 页面结构

```
Swag Labs (https://www.saucedemo.com/)
├── /                           # 登录页
├── /inventory.html             # 商品列表页（需登录）
├── /cart.html                  # 购物车页
├── /checkout-step-one.html     # 结账-填写信息
├── /checkout-step-two.html     # 结账-订单确认
└── /checkout-complete.html     # 结账-完成
```

### 测试账号

| 用户名 | 密码 | 说明 |
|--------|------|------|
| standard_user | secret_sauce | 标准用户，正常流程 |
| locked_out_user | secret_sauce | 被锁定用户，无法登录 |
| problem_user | secret_sauce | 问题用户，部分功能异常 |

---

## 🔄 工作流详解

### 阶段 1️⃣：MCP 探索 Swag Labs

**目标**: 快速理解 Swag Labs 登录页和商品页的结构、元素、交互

#### Step 1.1: 打开目标页面

```
指令: 打开 Swag Labs 登录页 https://www.saucedemo.com/
```

MCP 调用:
```javascript
mcp_io_github_chr_new_page({ url: "https://www.saucedemo.com/" })
```

#### Step 1.2: 全页截图 + AI 视觉分析

> **原理说明**: MCP 的 `take_screenshot` 会截取页面图片并**直接返回给 AI 对话**。由于 Claude/GPT-4o 等大模型具备**多模态（Vision）能力**，能够"看懂"图片内容，AI 会自动识别页面中的布局区域、UI 组件、文本内容和交互元素，输出结构化的分析结果。**你不需要做额外操作，AI 看到截图后会自动分析。**

```
指令: 截取整个页面，分析页面布局和主要功能区域
```

MCP 调用:
```javascript
mcp_io_github_chr_take_screenshot({ fullPage: true })
```

**工作流程**:
```
take_screenshot() → 截图返回给 AI → AI 多模态视觉识别 → 输出结构化分析
```

**AI 分析输出示例**（AI 看到截图后自动生成）:
```markdown
## 登录页结构分析

### 主要区域
1. **Logo区域**: "Swag Labs" 标题
2. **登录表单**:
   - 用户名输入框 (Username)
   - 密码输入框 (Password)
   - 登录按钮 (Login)
3. **测试账号提示区**: 列出可用的测试用户名
   - standard_user
   - locked_out_user
   - problem_user
   - performance_glitch_user
   - error_user
   - visual_user
4. **密码提示**: secret_sauce

### 关键交互点
- 用户名输入框
- 密码输入框
- 登录按钮
- 错误提示信息区域
```

#### Step 1.3: 获取 DOM 快照定位元素

```
指令: 获取页面快照，找出所有可交互元素的选择器
```

MCP 调用:
```javascript
mcp_io_github_chr_take_snapshot({ verbose: true })
```

**快照输出示例**:
```
[document] Swag Labs
  [main]
    [heading "Swag Labs"]
    [form "登录表单"]
      [textbox "Username"] uid="e1" data-test="username"
      [textbox "Password"] uid="e2" data-test="password"
      [button "Login"] uid="e3" data-test="login-button"
    [region "登录凭据"]
      [heading "Accepted usernames are:"]
      [text "standard_user"]
      [text "locked_out_user"]
      [text "problem_user"]
      [heading "Password for all users:"]
      [text "secret_sauce"]
```

#### Step 1.4: 交互探索验证 - 登录流程

```
指令: 输入用户名密码并登录，验证跳转到商品页面
```

MCP 调用:
```javascript
// 填写用户名
mcp_io_github_chr_fill({ uid: "e1", value: "standard_user" })

// 填写密码
mcp_io_github_chr_fill({ uid: "e2", value: "secret_sauce" })

// 点击登录
mcp_io_github_chr_click({ uid: "e3" })

// 等待商品页面加载
mcp_io_github_chr_wait_for({ text: "Products", timeout: 5000 })

// 截图验证 - 应看到商品列表页
mcp_io_github_chr_take_screenshot({ fullPage: true })
```

#### Step 1.5: 探索商品列表页

```
指令: 获取商品页面快照，找出商品卡片和购物车相关元素
```

MCP 调用:
```javascript
mcp_io_github_chr_take_snapshot({ verbose: true })
```

**快照输出示例**:
```
[document] Swag Labs
  [header]
    [button "Open Menu"] uid="e10"
    [text "Swag Labs"]
    [link "购物车"] uid="e11" class="shopping_cart_link"
      [span ""] class="shopping_cart_badge"  // 购物车数量徽章
  [main]
    [heading "Products"] class="title"
    [select "排序"] uid="e12" data-test="product-sort-container"
    [list "商品列表"] class="inventory_list"
      [listitem] class="inventory_item"
        [img "Sauce Labs Backpack"]
        [link "Sauce Labs Backpack"] uid="e13"
        [text "$29.99"]
        [button "Add to cart"] uid="e14" data-test="add-to-cart-sauce-labs-backpack"
      [listitem] class="inventory_item"
        [img "Sauce Labs Bike Light"]
        [link "Sauce Labs Bike Light"] uid="e15"
        [text "$9.99"]
        [button "Add to cart"] uid="e16" data-test="add-to-cart-sauce-labs-bike-light"
      ... (更多商品)
```

#### Step 1.6: 提取精确选择器

```
指令: 提取关键元素的 CSS 选择器，用于 Playwright 脚本
```

MCP 调用:
```javascript
mcp_io_github_chr_evaluate_script({
  function: `() => {
    const elements = {
      // 登录页
      username: document.querySelector('[data-test="username"]')?.outerHTML,
      password: document.querySelector('[data-test="password"]')?.outerHTML,
      loginBtn: document.querySelector('[data-test="login-button"]')?.outerHTML,
      // 商品页
      pageTitle: document.querySelector('.title')?.textContent,
      cartBadge: document.querySelector('.shopping_cart_badge')?.textContent,
      cartLink: document.querySelector('.shopping_cart_link')?.outerHTML,
      // 商品列表
      inventoryItems: document.querySelectorAll('.inventory_item').length,
      addToCartBtns: [...document.querySelectorAll('[data-test^="add-to-cart"]')]
        .map(el => ({ testId: el.getAttribute('data-test'), text: el.textContent }))
    };
    return elements;
  }`
})
```

---

### 阶段 2️⃣：AI 生成 Playwright 测试代码

**目标**: 基于探索结果，生成完整的测试脚本

#### Step 2.1: 整理测试要点

基于阶段1的探索，AI 总结测试要点：

```markdown
## Swag Labs 功能测试要点

### 核心功能
1. **用户登录**
   - 有效用户（standard_user）正常登录
   - 被锁定用户（locked_out_user）登录失败
   - 错误密码登录失败

2. **商品浏览**
   - 登录后显示商品列表，标题为 "Products"
   - 6 件商品正确展示（名称、价格、图片）
   - 商品排序功能（按名称/价格）

3. **购物车操作**
   - 点击 "Add to cart" 添加商品
   - 购物车徽章显示正确数量
   - 进入购物车查看商品列表
   - 移除购物车中的商品

4. **结账流程**
   - 填写收货信息（姓名、邮编）
   - 订单确认页显示商品和价格
   - 完成订单显示成功信息

5. **完整购物流程（E2E）**
   - 登录 → 添加商品 → 购物车 → 结账 → 完成
```

#### Step 2.2: 生成 Page Object Model (POM)

> **为什么使用 POM？**
> - **可维护性**: 选择器变更只需修改 Page Object 一处
> - **可读性**: 测试代码更清晰，体现业务意图
> - **可复用**: 多个测试文件共享同一个 Page Object

**提示词 (生成 Page Object)**:
```
基于以下页面分析结果，生成 Playwright Page Object Model：

1. 登录页 URL: https://www.saucedemo.com/
2. 元素选择器（从 MCP 探索获得）:
   - 用户名输入框: [data-test="username"]
   - 密码输入框: [data-test="password"]
   - 登录按钮: [data-test="login-button"]
   - 错误提示: [data-test="error"]

3. 商品页 URL: /inventory.html
4. 元素选择器:
   - 页面标题: .title
   - 商品列表: .inventory_item
   - 添加购物车按钮: [data-test="add-to-cart-{item-id}"]
   - 购物车徽章: .shopping_cart_badge
   - 购物车链接: .shopping_cart_link

5. 购物车页 URL: /cart.html
6. 元素选择器:
   - 购物车商品: .cart_item
   - 结账按钮: [data-test="checkout"]

7. 结账页 URL: /checkout-step-one.html
8. 元素选择器:
   - 姓名: [data-test="firstName"]
   - 姓氏: [data-test="lastName"]
   - 邮编: [data-test="postalCode"]
   - 继续按钮: [data-test="continue"]
   - 完成按钮: [data-test="finish"]
   - 完成标题: .complete-header

请生成符合 Playwright 最佳实践的 Page Object 类，包含：
1. 元素定位器（Locators）
2. 页面操作方法（Actions）
3. 断言辅助方法（Assertions）
```

**AI 生成 Page Object（4个类）**:

```typescript
// pages/LoginPage.ts
import { type Locator, type Page } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
    this.errorMessage = page.locator('[data-test="error"]');
  }

  async goto() {
    await this.page.goto('https://www.saucedemo.com/', { waitUntil: 'networkidle' });
  }

  async login(username: string, password: string) {
    await this.usernameInput.waitFor({ state: 'visible' });
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
```

```typescript
// pages/InventoryPage.ts
import { type Locator, type Page } from '@playwright/test';

export class InventoryPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly shoppingCartBadge: Locator;
  readonly shoppingCartLink: Locator;
  readonly inventoryItems: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('.title');
    this.shoppingCartBadge = page.locator('.shopping_cart_badge');
    this.shoppingCartLink = page.locator('.shopping_cart_link');
    this.inventoryItems = page.locator('.inventory_item');
  }

  async addItemToCart(itemName: string) {
    const itemId = itemName.toLowerCase().replace(/ /g, '-');
    await this.page.locator(`[data-test="add-to-cart-${itemId}"]`).click();
  }

  async gotoCart() {
    await this.shoppingCartLink.click();
  }
}
```

```typescript
// pages/CartPage.ts
import { type Locator, type Page } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly checkoutButton: Locator;
  readonly cartItems: Locator;
  readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.cartItems = page.locator('.cart_item');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
  }

  async checkout() {
    await this.checkoutButton.click();
  }
}
```

```typescript
// pages/CheckoutPage.ts
import { type Locator, type Page } from '@playwright/test';

export class CheckoutPage {
  readonly page: Page;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly finishButton: Locator;
  readonly completeHeader: Locator;
  readonly summaryTotal: Locator;

  constructor(page: Page) {
    this.page = page;
    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.finishButton = page.locator('[data-test="finish"]');
    this.completeHeader = page.locator('.complete-header');
    this.summaryTotal = page.locator('.summary_total_label');
  }

  async fillDetails(firstName: string, lastName: string, postalCode: string) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
    await this.continueButton.click();
  }

  async finishCheckout() {
    await this.finishButton.click();
  }
}
```

#### Step 2.3: 基于 Page Object 生成测试代码

**提示词 (生成测试代码)**:
```
基于已创建的 LoginPage、InventoryPage、CartPage、CheckoutPage，生成 Swag Labs 测试代码。
测试场景：
1. 简单登录验证（standard_user 登录成功，页面标题显示 "Products"）
2. 完整购物流程（登录 → 添加商品 → 购物车 → 结账 → 完成）
```

**AI 生成测试代码**:

```typescript
// tests/e2e.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';

test.describe('Swag Labs E2E 测试', () => {

  test.describe('用户登录', () => {
    test('标准用户成功登录', async ({ page }) => {
      const loginPage = new LoginPage(page);
      const inventoryPage = new InventoryPage(page);

      // 打开登录页
      await loginPage.goto();
      
      // 输入有效凭据并登录
      await loginPage.login('standard_user', 'secret_sauce');
      
      // 验证跳转到商品页面
      await expect(inventoryPage.pageTitle).toHaveText('Products');
      await expect(page).toHaveURL(/inventory/);
    });

    test('锁定用户登录失败', async ({ page }) => {
      const loginPage = new LoginPage(page);

      await loginPage.goto();
      await loginPage.login('locked_out_user', 'secret_sauce');
      
      // 验证错误提示
      await expect(loginPage.errorMessage).toBeVisible();
      await expect(loginPage.errorMessage).toContainText('locked out');
    });

    test('错误密码登录失败', async ({ page }) => {
      const loginPage = new LoginPage(page);

      await loginPage.goto();
      await loginPage.login('standard_user', 'wrong_password');
      
      // 验证错误提示
      await expect(loginPage.errorMessage).toBeVisible();
      await expect(loginPage.errorMessage).toContainText('do not match');
    });
  });

  test.describe('完整购物流程', () => {
    test('添加商品并完成结账', async ({ page }) => {
      const loginPage = new LoginPage(page);
      const inventoryPage = new InventoryPage(page);
      const cartPage = new CartPage(page);
      const checkoutPage = new CheckoutPage(page);

      // Step 1: 登录
      await loginPage.goto();
      await loginPage.login('standard_user', 'secret_sauce');
      await expect(inventoryPage.pageTitle).toHaveText('Products');

      // Step 2: 添加两件商品到购物车
      await inventoryPage.addItemToCart('sauce-labs-backpack');
      await inventoryPage.addItemToCart('sauce-labs-bike-light');
      
      // Step 3: 验证购物车徽章显示 "2"
      await expect(inventoryPage.shoppingCartBadge).toHaveText('2');

      // Step 4: 进入购物车，验证商品
      await inventoryPage.gotoCart();
      await expect(cartPage.cartItems).toHaveCount(2);

      // Step 5: 点击结账，填写用户信息
      await cartPage.checkout();
      await checkoutPage.fillDetails('John', 'Doe', '12345');

      // Step 6: 验证订单确认页（商品和价格）
      await expect(checkoutPage.summaryTotal).toBeVisible();

      // Step 7: 完成订单
      await checkoutPage.finishCheckout();
      
      // 验证成功页面
      await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
    });
  });
});
```

#### POM 模式的价值

| 对比维度 | 无 POM | 有 POM |
|----------|--------|--------|
| **选择器变更** | 修改所有测试文件 | 只改 Page Object |
| **代码可读性** | `page.click('[data-test="login-button"]')` | `loginPage.login(user, pass)` |
| **复用性** | 复制粘贴 | 导入复用 |
| **维护成本** | 高 | 低 |
| **团队协作** | 易冲突 | 职责分离 |

**目录结构**:
```
tests/
├── pages/                  # Page Objects
│   ├── LoginPage.ts        # 登录页
│   ├── InventoryPage.ts    # 商品列表页
│   ├── CartPage.ts         # 购物车页
│   └── CheckoutPage.ts     # 结账页
├── e2e.spec.ts             # E2E 完整流程测试
└── login.spec.ts           # 登录功能测试
```

---

### 阶段 3️⃣：集成到 CI/CD

**目标**: 将测试脚本集成到 GitHub Actions，实现自动化门禁

#### Step 3.1: 创建 GitHub Actions 工作流

```yaml
# .github/workflows/e2e-tests.yml
name: Swag Labs E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium
      
      # 注意：Swag Labs 是外部网站，无需启动本地服务
      - name: Run Playwright tests
        run: npx playwright test
      
      - name: Upload test report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
      
      - name: Upload screenshots on failure
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: failure-screenshots
          path: test-results/
          retention-days: 7
```

#### Step 3.2: 配置 Playwright

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['github']  // GitHub Actions 友好的输出
  ],
  use: {
    // Swag Labs 是外部网站，直接访问
    baseURL: 'https://www.saucedemo.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // 无需 webServer 配置，Swag Labs 是外部服务
});
```

---

### 阶段 4️⃣：MCP + AI 诊断测试失败

**目标**: 当测试失败时，使用 MCP 快速定位问题

#### 场景：登录测试失败

假设有人修改了 `LoginPage.ts` 中的定位器，导致测试失败：

```
❌ FAILED: Swag Labs E2E 测试 › 用户登录 › 标准用户成功登录

Error: expect(locator).toHaveText('Products')
Locator: locator('.title')
Expected: "Products"
Received: 测试超时

Call log:
  - waiting for locator('.title') to have text 'Products'
  - locator resolved to 0 elements
  - Timeout 30000ms exceeded
```

#### Step 4.1: 用 MCP 复现场景

```
指令: 打开 Swag Labs 登录页，复现登录测试失败的场景
```

MCP 调用序列:
```javascript
// 1. 打开登录页
mcp_io_github_chr_new_page({ url: "https://www.saucedemo.com/" })

// 2. 截图查看初始状态
mcp_io_github_chr_take_screenshot()

// 3. 获取页面快照，确认元素选择器
mcp_io_github_chr_take_snapshot({ verbose: true })

// 4. 填写用户名
mcp_io_github_chr_fill({ uid: "e1", value: "standard_user" })

// 5. 填写密码
mcp_io_github_chr_fill({ uid: "e2", value: "secret_sauce" })

// 6. 点击登录
mcp_io_github_chr_click({ uid: "e3" })

// 7. 等待页面跳转
mcp_io_github_chr_wait_for({ text: "Products", timeout: 5000 })

// 8. 截图验证结果
mcp_io_github_chr_take_screenshot()
```

#### Step 4.2: 检查控制台错误

```javascript
mcp_io_github_chr_list_console_messages({ types: ["error", "warn"] })
```

**可能输出**:
```
[error] Epic sadance: Sorry, this user has been locked out.
```

或者如果是定位器错误，控制台可能没有报错。此时需要对比代码中的定位器和实际 DOM 元素。

#### Step 4.3: 对比定位器与实际 DOM

```javascript
// 检查测试代码中使用的定位器是否存在
mcp_io_github_chr_evaluate_script({
  function: `() => {
    return {
      // 检查测试代码中的定位器
      'data-test=username': !!document.querySelector('[data-test="username"]'),
      'data-test=password': !!document.querySelector('[data-test="password"]'),
      'data-test=login-button': !!document.querySelector('[data-test="login-button"]'),
      // 检查是否有错误提示
      'data-test=error': !!document.querySelector('[data-test="error"]'),
      'error-text': document.querySelector('[data-test="error"]')?.textContent || 'none',
      // 检查是否仍在登录页
      'current-url': window.location.href
    };
  }`
})
```

**可能输出**:
```json
{
  "data-test=username": false,
  "data-test=password": false,
  "data-test=login-button": false,
  "data-test=error": false,
  "error-text": "none",
  "current-url": "https://www.saucedemo.com/"
}
```

> 发现问题！定位器 `[data-test="username"]` 在页面上找不到。说明 Swag Labs 网站更新了 DOM 结构，或者测试代码中的定位器被错误修改。

#### Step 4.4: AI 诊断总结

> **测试失败诊断报告**

**失败原因**: 登录页元素定位器与实际 DOM 不匹配

**根因分析**:

| 层级 | 原因 |
|------|------|
| 直接原因 | `locator('.title')` 超时，页面未跳转到商品页 |
| 根本原因 | LoginPage.ts 中的定位器被错误修改（如 `[data-test="username"]` 被改成了不存在的选择器） |
| 影响范围 | 所有依赖登录的测试用例均失败 |

**修复建议**:

**方案1: 恢复正确的定位器**

```typescript
// LoginPage.ts - 修复定位器
// ❌ 错误的定位器
this.usernameInput = page.locator('#username');  // 这个不存在

// ✅ 正确的定位器（通过 MCP 快照确认）
this.usernameInput = page.locator('[data-test="username"]');
```

**方案2: 使用 MCP 获取最新的定位器**

```javascript
// 用 MCP 重新探索页面，获取正确的元素属性
mcp_io_github_chr_take_snapshot({ verbose: true })
// 检查输出中的 data-test 属性，更新 POM 文件
```

**验证步骤**:
1. 用 MCP 确认登录页元素的实际属性
2. 修复 `LoginPage.ts` 中的定位器
3. 本地运行 `npx playwright test --grep "登录"`
4. 确认测试通过后提交

---

## 📊 效率对比

| 任务 | 传统方式 | MCP + Playwright | 提升 |
|------|----------|------------------|------|
| 理解新页面 | 2-4 小时 | 15-30 分钟 | **80%+** |
| 编写测试脚本 | 4-8 小时 | 1-2 小时 | **75%+** |
| 定位元素选择器 | 1-2 小时 | 5-10 分钟 | **90%+** |
| 诊断失败原因 | 1-3 小时 | 15-30 分钟 | **80%+** |
| **总计** | 8-17 小时 | 2-4 小时 | **75%+** |

---

## 🎯 实战演练任务

### 任务1: 探索阶段（30分钟）

使用 Chrome DevTools MCP 探索 **Swag Labs 登录页**（https://www.saucedemo.com/）：
1. 截图并分析页面布局（登录表单、测试账号提示区）
2. 获取 DOM 快照，找出所有表单元素（用户名、密码、登录按钮）
3. 执行 JS 提取元素的 `data-test` 属性
4. 测试登录流程（输入 standard_user / secret_sauce → 点击登录 → 验证跳转到 Products 页面）

### 任务2: 生成阶段（45分钟）

基于探索结果，让 AI 生成 Swag Labs 的 Playwright 测试：
- **测试用例1（基础）**: 标准用户成功登录，页面显示 "Products"
- **测试用例2（进阶）**: 完整购物流程
  - 登录 → 添加 "Sauce Labs Backpack" 和 "Sauce Labs Bike Light"
  - 验证购物车徽章显示 "2"
  - 进入购物车 → 结账 → 填写信息（John / Doe / 12345）
  - 完成订单 → 验证 "Thank you for your order!"

### 任务3: 集成阶段（30分钟）

将测试集成到 GitHub Actions：
1. 创建 `.github/workflows/e2e-tests.yml`
2. 配置 `playwright.config.ts`（baseURL 为 `https://www.saucedemo.com`，无需本地服务器）
3. 提交代码并触发 CI
4. 查看测试报告

### 任务4: 诊断阶段（30分钟）

模拟测试失败场景，使用 MCP 诊断：
1. 故意修改 `LoginPage.ts` 中的定位器（如将 `[data-test="username"]` 改为 `#username`）
2. 运行测试观察失败
3. 用 MCP 打开页面，获取快照对比定位器
4. 生成诊断报告并修复

---

## 📚 延伸阅读

- [Playwright 官方文档](https://playwright.dev/)
- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Chrome DevTools MCP 应用场景](./Chrome-DevTools-MCP典型应用场景分析.md)

---

## ✅ 检查清单

完成演练后，确认你已经掌握：

- [ ] 使用 MCP `take_screenshot` 和 `take_snapshot` 分析页面
- [ ] 使用 MCP `evaluate_script` 提取精确数据
- [ ] 使用 MCP 交互操作（click, fill, wait_for）验证功能
- [ ] 让 AI 基于探索结果生成 Playwright 测试代码
- [ ] 配置 GitHub Actions 运行 Playwright 测试
- [ ] 使用 MCP 检查控制台和网络请求诊断问题
- [ ] 生成结构化的诊断报告

---

> **文档版本**: v1.0
> 
> **创建日期**: 2026-01-28
> 
> **适用课程**: AI+DevOps 全流程培训 - 软件质量模块
