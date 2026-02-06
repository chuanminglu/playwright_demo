# 完整5阶段工作流

## 概览

| 阶段 | 工具 | 输入 | 输出 |
|------|------|------|------|
| **1. Explore** | Chrome DevTools MCP | 目标URL | 选择器、交互验证 |
| **2. Document** | AI + 模板 | 探索数据 | 测试用例文档 |
| **3. Code** | AI + POM模板 | 测试文档 | POM + 测试代码 |
| **4. Execute** | Playwright + CI | 测试代码 | 测试报告 |
| **5. Diagnose** | Chrome DevTools MCP | 失败信息 | 根因 + 修复 |

## Phase 1: Explore (MCP探索)

### 1.1 打开并截图
```javascript
mcp_io_github_chr_new_page({ url: TARGET_URL })
mcp_io_github_chr_take_screenshot({ fullPage: true })
```
AI分析：布局、区域、交互元素

### 1.2 DOM快照
```javascript
mcp_io_github_chr_take_snapshot({ verbose: true })
```
提取：元素UID、ARIA角色、表单结构

### 1.3 提取选择器
```javascript
mcp_io_github_chr_evaluate_script({
  function: `() => {
    const result = {};
    document.querySelectorAll('[data-testid], [data-test], button, input, a').forEach(el => {
      const id = el.dataset?.testid || el.dataset?.test || el.id || el.className;
      if (id) result[id] = { tag: el.tagName, type: el.type };
    });
    return result;
  }`
})
```

### 1.4 验证交互
```javascript
mcp_io_github_chr_click({ uid: "TARGET_UID" })
mcp_io_github_chr_wait_for({ text: "EXPECTED", timeout: 3000 })
mcp_io_github_chr_take_screenshot()
```

## Phase 2: Document (生成测试文档) 🆕

**在编写代码之前，先生成测试用例文档！**

### 2.1 创建测试矩阵

| 功能 | 正常路径 | 边界值 | 异常场景 |
|------|----------|--------|----------|
| 登录 | 有效凭证 | 空字段 | 错误密码 |
| 表单 | 完整填写 | 部分填写 | 无效数据 |
| 列表 | 有数据 | 空列表 | 最大数量 |

### 2.2 生成测试用例文档

使用 `prompts.md` → Prompt 6

**输出位置:** `docs/test-cases/{功能名称}-测试用例.md`

**表格字段:**
| 用例编号 | 系统 | 功能模块 | 用例概述 | 优先级 | 标签 | 前提条件 | 输入数据或操作 | 预期结果 | 测试结果 |

### 2.3 审查测试覆盖

确保覆盖：
- ✅ 所有正常流程 (P0)
- ✅ 参数验证 (P1)
- ✅ 异常处理 (P1)
- ✅ 边界值 (P1-P2)

## Phase 3: Code (生成测试代码)

### 3.1 生成Page Object

使用 `prompts.md` → Prompt 1

**输出位置:** `pages/{PageName}Page.ts`

### 3.2 生成测试脚本

使用 `prompts.md` → Prompt 2 或 Prompt 7

**输入:** 测试用例文档中标记为"可自动化"的用例
**输出位置:** `tests/{feature}.spec.ts`

### 3.3 AUTO模式（推荐）

如果测试用例文档已完整，可使用 AUTO 模式一键生成：
- `prompts.md` → Prompt 8

**一次性生成:**
- `pages/*.ts` - 所有 Page Objects
- `tests/*.spec.ts` - 所有测试脚本
- `.github/workflows/e2e.yml` - CI 配置

## Phase 4: Execute (CI执行)

### 本地执行
```bash
npx playwright test              # 全部测试
npx playwright test login.spec   # 指定文件
npx playwright test --debug      # 调试模式
npx playwright test --ui         # UI模式
```

### CI配置 (GitHub Actions)
```yaml
- run: npx playwright install --with-deps chromium
- run: npx playwright test
- uses: actions/upload-artifact@v4
  if: failure()
  with: { name: test-results, path: test-results/ }
```

## Phase 5: Diagnose (故障诊断)

### 故障→诊断映射

| 症状 | MCP命令 | 检查项 |
|------|---------|--------|
| 元素未找到 | `take_snapshot` | 选择器变更 |
| 超时 | `list_network_requests` | API慢/失败 |
| 值错误 | `list_console_messages` | JS错误 |
| 状态异常 | `take_screenshot` | 视觉差异 |

### 快速诊断
```javascript
// 1. 重现
mcp_io_github_chr_new_page({ url: FAILING_PAGE })
// ... 重复失败操作

// 2. 检查错误
mcp_io_github_chr_list_console_messages({ types: ["error"] })

// 3. 检查网络
mcp_io_github_chr_list_network_requests({ resourceTypes: ["xhr", "fetch"] })

// 4. 截图状态
mcp_io_github_chr_take_screenshot()
```

详见: `diagnosis.md`

## 效率对比

| 任务 | 传统方式 | 使用Skill |
|------|----------|-----------|
| 页面分析 | 2-4小时 | 15-30分钟 |
| 测试文档 | 2-3小时 | 20-30分钟 |
| 测试代码 | 4-8小时 | 1-2小时 |
| 选择器提取 | 1-2小时 | 5-10分钟 |
| 故障诊断 | 1-3小时 | 15-30分钟 |

// 2. Check errors
mcp_io_github_chr_list_console_messages({ types: ["error"] })

// 3. Check network
mcp_io_github_chr_list_network_requests({ resourceTypes: ["xhr", "fetch"] })

// 4. Capture state
mcp_io_github_chr_take_screenshot()
```

See: `diagnosis.md` for detailed patterns.

## Efficiency Gains

| Task | Traditional | With Skill |
|------|-------------|------------|
| Understand page | 2-4 hrs | 15-30 min |
| Write tests | 4-8 hrs | 1-2 hrs |
| Find selectors | 1-2 hrs | 5-10 min |
| Debug failures | 1-3 hrs | 15-30 min |
