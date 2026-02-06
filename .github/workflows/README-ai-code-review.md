# DeepSeek AI 代码审查工作流使用指南

## 📋 工作流概述

本工作流使用 DeepSeek Coder 模型自动审查 Pull Request 中的代码变更。

### 核心功能

- ✅ 自动分析 PR 中的代码变更
- ✅ 使用 DeepSeek AI 进行代码审查
- ✅ 将审查结果自动发布为 PR 评论
- ✅ 生成审查摘要到 GitHub Actions Summary
- ✅ 保存审查报告为 Artifacts

---

## 🚀 配置步骤

### 步骤 1: 获取 DeepSeek API Key

1. 访问 [DeepSeek 开放平台](https://platform.deepseek.com/)
2. 注册/登录账号
3. 进入"API Keys"页面
4. 创建新的 API Key（保存好，只显示一次）

### 步骤 2: 配置 GitHub Secrets

1. 进入 GitHub 仓库设置
   ```
   Settings → Secrets and variables → Actions
   ```

2. 点击 **New repository secret**

3. 添加密钥：
   - **Name**: `DEEPSEEK_API_KEY`
   - **Value**: `sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`（你的 DeepSeek API Key）

4. 点击 **Add secret** 保存

### 步骤 3: 验证工作流文件

确认 `.github/workflows/ai-code-review.yml` 文件已正确放置在仓库中。

---

## 🎯 触发条件

工作流在以下情况下自动触发：

### PR 事件
- ✅ PR 创建时 (`opened`)
- ✅ PR 更新时 (`synchronize`)
- ✅ PR 重新打开时 (`reopened`)

### 文件类型过滤
只审查以下类型的文件：
- `.js` / `.ts` - JavaScript/TypeScript
- `.jsx` / `.tsx` - React 组件
- `.py` - Python
- `.java` - Java
- `.go` - Go

### 排除条件
- ❌ Draft PR（草稿状态）不会触发审查

---

## 📊 工作流步骤说明

### Step 1: Checkout code
```yaml
- 克隆代码仓库
- 获取完整的 Git 历史 (fetch-depth: 0)
- 检出 PR 的 HEAD 提交
```

### Step 2: Get code changes
```yaml
- 对比 PR 分支与基础分支的差异
- 过滤出代码文件（排除文档、配置等）
- 生成完整的 diff 内容
- 如果 diff 超过 50KB，截断到前 50KB
- 输出变更文件数量和 diff 大小
```

### Step 3: DeepSeek AI Review
```yaml
- 读取 diff 内容
- 调用 DeepSeek API 进行代码审查
- 审查维度：
  ✓ 缺陷识别
  ✓ 安全问题
  ✓ 性能优化
  ✓ 代码质量
  ✓ 最佳实践
  ✓ 测试覆盖
- 按优先级分类问题
- 提供具体修复建议
- 将审查结果保存到 review_result.md
```

### Step 4: Post review comment to PR
```yaml
- 读取 review_result.md
- 格式化为 GitHub 评论
- 自动发布到 PR 评论区
- 包含时间戳和审查来源标识
```

### Step 5: Generate review summary
```yaml
- 生成审查摘要到 GitHub Actions Summary
- 显示关键指标：
  • 变更文件数
  • 审查状态
  • 审查时间
- 预览审查结果（前 50 行）
```

### Step 6: Upload review report
```yaml
- 上传完整审查报告为 Artifact
- 包含文件：
  • review_result.md (审查结果)
  • full_diff.txt (完整 diff)
  • changed_files.txt (变更文件列表)
- 保留 30 天
```

---

## 🔍 审查结果示例

### PR 评论格式
```markdown
## 🤖 DeepSeek AI Code Review

### 🔴 高优先级问题

#### 1. 潜在的空指针异常
- **文件**: `src/LoginPage.ts`
- **行号**: 45-48
- **问题**: `username` 可能为 `null`，直接访问会导致运行时错误
- **建议**: 添加空值检查
```javascript
if (username && username.trim()) {
  await this.usernameInput.fill(username);
}
```

### 🟡 中优先级建议

#### 2. 性能优化机会
- **文件**: `tests/e2e.spec.ts`
- **行号**: 30-35
- **问题**: 使用了多个 `waitForSelector`，可能导致测试变慢
- **建议**: 使用 `page.waitForLoadState('networkidle')` 等待页面加载完成

### 🟢 低优先级提示

#### 3. 代码风格
- **文件**: `pages/CartPage.ts`
- **行号**: 20
- **问题**: 箭头函数可以简化为单行
- **建议**: `async addToCart() => await this.addButton.click();`

---
*🔍 Powered by DeepSeek AI | ⏰ 2024-01-24 14:30:45*
```

### GitHub Actions Summary 格式
```markdown
## 🎯 AI代码审查摘要

- **变更文件数**: 5
- **审查状态**: success
- **审查时间**: 2024-01-24 14:30:45

### 📝 审查结果预览

[前 50 行的审查结果]
```

---

## ⚙️ 高级配置

### 自定义触发条件

#### 添加更多文件类型
```yaml
paths:
  - '**.js'
  - '**.ts'
  - '**.py'
  - '**.rb'      # Ruby
  - '**.php'     # PHP
  - '**.cpp'     # C++
  - '**.cs'      # C#
```

#### 排除特定路径
```yaml
paths-ignore:
  - 'docs/**'
  - 'scripts/**'
  - '**.test.js'
  - '**.spec.ts'
```

#### 添加手动触发
```yaml
on:
  pull_request:
    types: [opened, synchronize, reopened]
  workflow_dispatch:  # 允许手动触发
```

### 调整 DeepSeek 参数

在 Python 脚本中修改：

```python
payload = {
    "model": "deepseek-coder",
    "messages": [...],
    "temperature": 0.3,      # 降低随机性 (0.0-1.0)
    "max_tokens": 4000,      # 增加输出长度
    "top_p": 0.9,            # 采样参数
    "frequency_penalty": 0   # 惩罚重复
}
```

### 自定义审查提示词

修改 `system_msg` 变量：

```python
system_msg = """你是一位资深代码审查专家，拥有20年开发经验。

审查重点：
1. 🔴 致命缺陷：会导致系统崩溃或数据损坏的问题
2. 🟠 安全漏洞：SQL注入、XSS、CSRF、敏感信息泄露
3. 🟡 性能问题：内存泄漏、循环低效、数据库N+1查询
4. 🔵 代码质量：复杂度高、可读性差、缺少注释
5. 🟢 最佳实践：设计模式、SOLID原则、DRY原则
6. 🧪 测试覆盖：缺少单元测试、集成测试

输出格式：
- 使用中文
- 按优先级分类（🔴高 🟡中 🟢低）
- 每个问题包含：文件名、行号、问题描述、修复建议
- 提供可执行的代码示例
- 如果代码质量很好，给予积极反馈
"""
```

### 配置 Diff 大小限制

修改截断阈值（默认 50KB）：

```bash
if [ "${DIFF_SIZE}" -gt 100000 ]; then  # 改为 100KB
  head -c 100000 full_diff.txt > diff_truncated.txt
  ...
fi
```

---

## 🛠️ 故障排查

### 问题 1: 工作流未触发

**症状**: PR 创建后，Actions 中没有出现 AI Code Review 工作流

**排查步骤**:
1. 检查 PR 是否为 Draft 状态（Draft PR 不会触发）
2. 检查变更的文件类型是否在 `paths` 过滤列表中
3. 检查 `.github/workflows/ai-code-review.yml` 是否在主分支中
4. 查看 Actions 页面的"All workflows"选项卡

**解决方案**:
```bash
# 将 workflow 文件推送到主分支
git checkout main
git pull origin main
git add .github/workflows/ai-code-review.yml
git commit -m "Add AI code review workflow"
git push origin main
```

### 问题 2: API Key 错误

**症状**: 日志显示 `ERROR: DEEPSEEK_API_KEY not configured`

**排查步骤**:
1. 确认 Secret 名称是否正确（区分大小写）
2. 确认 Secret 是否在正确的仓库中配置
3. 确认 Secret 值是否正确复制（无多余空格）

**解决方案**:
```bash
# 重新配置 Secret
Settings → Secrets and variables → Actions
删除旧的 DEEPSEEK_API_KEY
重新创建 DEEPSEEK_API_KEY
```

### 问题 3: API 调用超时

**症状**: 日志显示 `urllib.error.URLError: <urlopen error timed out>`

**原因**: diff 内容过大或 API 响应慢

**解决方案**:
```python
# 增加超时时间
with urllib.request.urlopen(req, timeout=300) as response:  # 改为 5 分钟

# 或减少 diff 大小
if [ "${DIFF_SIZE}" -gt 30000 ]; then  # 改为 30KB
  head -c 30000 full_diff.txt > diff_truncated.txt
fi
```

### 问题 4: 评论未发布到 PR

**症状**: AI 审查完成，但 PR 中没有评论

**排查步骤**:
1. 检查 `Post review comment to PR` 步骤的日志
2. 确认 `review_result.md` 是否生成
3. 检查 GitHub Token 权限

**解决方案**:
```yaml
# 确保权限正确配置
permissions:
  pull-requests: write
  contents: read
  issues: write  # 必需！PR 评论使用 issues API
```

### 问题 5: Python 脚本错误

**症状**: 日志显示 Python 语法错误或导入错误

**排查步骤**:
1. 检查 heredoc 语法是否正确（`<< 'EOF'` 和 `EOF` 必须顶格）
2. 检查 Python 缩进是否一致
3. 查看完整错误堆栈

**解决方案**:
```bash
# 测试 Python 脚本
python3 << 'EOF'
import os
print("Test OK")
EOF
```

### 问题 6: 审查结果质量不佳

**症状**: DeepSeek 输出不符合预期，审查不够深入

**解决方案**:
```python
# 优化提示词
system_msg = """你是一位资深代码审查专家，拥有20年开发经验。

审查规则：
1. 深入分析代码逻辑，不要只看表面
2. 关注业务逻辑正确性和边界条件
3. 提供具体可执行的修复代码
4. 如果代码写得好，请明确指出优点

输出要求：
- 每个问题必须包含文件名、行号、代码片段
- 修复建议必须包含可运行的代码示例
- 按严重程度分级：P0(致命)、P1(严重)、P2(一般)、P3(优化)
"""

# 调整温度参数（降低随机性）
"temperature": 0.1,  # 更确定性的输出

# 增加输出长度
"max_tokens": 8000,  # 更详细的审查
```

---

## 📈 最佳实践

### 1. PR 大小控制
- ✅ 建议单个 PR 变更不超过 500 行
- ✅ 大型重构拆分为多个小 PR
- ✅ 超大 PR 会被截断，可能丢失重要审查信息

### 2. 审查时机
- ✅ 在 PR 创建后立即触发
- ✅ 每次 push 新提交时重新审查
- ✅ 结合人工审查，不完全依赖 AI

### 3. 审查结果使用
- ✅ 将 AI 审查作为第一轮筛查
- ✅ 人工审查员关注 AI 标记的高优先级问题
- ✅ 定期回顾 AI 审查的准确性，优化提示词

### 4. 成本控制
- ✅ 合理设置 diff 大小限制（50KB）
- ✅ 只审查代码文件，排除文档和配置
- ✅ 监控 API 调用次数和费用

### 5. 权限管理
- ✅ API Key 使用 GitHub Secrets 存储
- ✅ 最小化工作流权限（只读代码，写评论）
- ✅ 定期轮换 API Key

---

## 📚 参考资源

### DeepSeek 文档
- [DeepSeek API 文档](https://platform.deepseek.com/docs)
- [DeepSeek Coder 模型说明](https://github.com/deepseek-ai/DeepSeek-Coder)

### GitHub Actions 文档
- [Workflow 语法](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [GitHub Script Action](https://github.com/actions/github-script)
- [Secrets 管理](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

### Playwright 相关
- [Playwright 测试最佳实践](https://playwright.dev/docs/best-practices)
- [Playwright CI/CD 集成](https://playwright.dev/docs/ci)

---

## 🔄 更新日志

| 版本 | 日期 | 更新内容 |
|-----|------|---------|
| v1.0 | 2024-01-24 | 初始版本，支持 DeepSeek AI 代码审查 |

---

## 📞 支持与反馈

如有问题或建议，请：
1. 查看本文档的"故障排查"章节
2. 查看 GitHub Actions 日志
3. 创建 Issue 反馈问题

---

**祝使用愉快！🎉**
