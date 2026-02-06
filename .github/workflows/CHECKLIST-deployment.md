# 🚀 DeepSeek AI 代码审查工作流部署清单

> **目标**: 确保 AI 代码审查工作流正确配置并成功运行

---

## ✅ 部署前检查清单

### 1. 文件检查
- [ ] ✅ `.github/workflows/ai-code-review.yml` 文件存在
- [ ] ✅ 文件在 `main` 或 `master` 分支中
- [ ] ✅ YAML 语法正确（无警告/错误）
- [ ] ✅ 文件权限正常（可读）

**验证命令**:
```bash
# 检查文件是否存在
ls -la .github/workflows/ai-code-review.yml

# 验证 YAML 语法（可选）
# 需要安装 yamllint: pip install yamllint
yamllint .github/workflows/ai-code-review.yml
```

---

### 2. Secret 配置
- [ ] ✅ 已获取 DeepSeek API Key
- [ ] ✅ 已在 GitHub 仓库中配置 `DEEPSEEK_API_KEY` Secret
- [ ] ✅ Secret 名称拼写正确（区分大小写）
- [ ] ✅ Secret 值无多余空格或换行符

**验证步骤**:
1. 访问: `Settings` → `Secrets and variables` → `Actions`
2. 确认看到: `DEEPSEEK_API_KEY` (绿色勾选标记)
3. 更新时间应该是最近的

**测试 API Key**:
```bash
# 使用 curl 测试（替换 YOUR_API_KEY）
curl https://api.deepseek.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-coder",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 10
  }'

# 预期输出: JSON 响应包含 "choices" 字段
```

---

### 3. 仓库权限
- [ ] ✅ GitHub Actions 已启用
- [ ] ✅ Workflow 具有 PR 写权限
- [ ] ✅ Workflow 具有 Issues 写权限
- [ ] ✅ 仓库允许 Actions 创建评论

**验证步骤**:
1. 访问: `Settings` → `Actions` → `General`
2. 确认: **Actions permissions** = "Allow all actions and reusable workflows"
3. 确认: **Workflow permissions** = "Read and write permissions" ✅

或使用受限权限:
```yaml
permissions:
  pull-requests: write  # PR 评论
  contents: read        # 读取代码
  issues: write         # 发布 PR 评论（必需）
```

---

### 4. 分支保护规则（可选）
- [ ] ✅ 主分支已配置保护规则
- [ ] ✅ AI 代码审查不是必需的状态检查
- [ ] ✅ 允许管理员绕过审查（紧急情况）

**建议配置**:
```
Settings → Branches → Branch protection rules

✅ Require a pull request before merging
✅ Require approvals (1)
❌ Require status checks (AI 审查不作为阻塞条件)
✅ Allow administrators to bypass
```

---

## 🧪 功能测试清单

### 测试 1: 创建测试 PR

**步骤**:
```bash
# 1. 创建测试分支
git checkout -b test/ai-review-demo

# 2. 修改一个测试文件
echo "// Test change for AI review" >> tests/test-1.spec.ts

# 3. 提交并推送
git add tests/test-1.spec.ts
git commit -m "test: trigger AI code review"
git push origin test/ai-review-demo

# 4. 在 GitHub 上创建 PR
# 目标分支: main
# 源分支: test/ai-review-demo
```

**预期结果**:
- [ ] ✅ PR 创建后，Actions 页面出现 "AI Code Review with DeepSeek" 工作流
- [ ] ✅ 工作流状态从 🟡 运行中 → 🟢 成功
- [ ] ✅ PR 评论区出现 AI 审查结果
- [ ] ✅ 评论格式正确（包含标题、内容、时间戳）

---

### 测试 2: 验证工作流日志

**步骤**:
1. 进入 Actions 页面
2. 点击 "AI Code Review with DeepSeek" 工作流
3. 点击最新的运行记录
4. 展开每个步骤查看日志

**检查点**:

#### Step 1: Checkout code
```
✅ 看到: "Checking out the ref"
✅ 看到: "Fetching the repository"
```

#### Step 2: Get code changes
```
✅ 看到: "Analyzing code changes..."
✅ 看到: "Found X code files changed"
✅ 输出变量: files_changed=X, diff_size=Y
```

#### Step 3: DeepSeek AI Review
```
✅ 看到: "Starting DeepSeek AI code review..."
✅ 看到: "Diff size: XXXX chars"
✅ 看到: "Review completed"
❌ 不应该看到: "ERROR: DEEPSEEK_API_KEY not configured"
❌ 不应该看到: "urllib.error.URLError"
```

#### Step 4: Post review comment to PR
```
✅ 看到: "✅ Review comment posted successfully"
❌ 不应该看到: "❌ Failed to post review comment"
```

#### Step 5: Generate review summary
```
✅ 看到: Summary 页面有 "🎯 AI代码审查摘要"
✅ 看到: 变更文件数、审查状态、审查时间
```

#### Step 6: Upload review report
```
✅ 看到: Artifacts 中有 "ai-review-report-XXX"
✅ 可以下载并查看 review_result.md
```

---

### 测试 3: 验证审查质量

**步骤**:
```bash
# 1. 创建一个有明显问题的代码
git checkout -b test/buggy-code

# 2. 添加有问题的测试文件
cat > tests/buggy.spec.ts << 'EOF'
import { test, expect } from '@playwright/test';

test('buggy test with issues', async ({ page }) => {
  // Issue 1: 硬编码 URL
  await page.goto('http://localhost:3000');
  
  // Issue 2: 缺少错误处理
  const element = page.locator('#nonexistent');
  await element.click();
  
  // Issue 3: 使用 var 而不是 const/let
  var username = 'test';
  
  // Issue 4: 缺少断言
  await page.fill('#username', username);
});
EOF

# 3. 提交并创建 PR
git add tests/buggy.spec.ts
git commit -m "test: add buggy code for AI review"
git push origin test/buggy-code
```

**预期 AI 审查结果应包含**:
- [ ] ✅ 识别硬编码 URL 问题
- [ ] ✅ 识别缺少错误处理
- [ ] ✅ 识别使用 `var` 的问题
- [ ] ✅ 识别缺少断言
- [ ] ✅ 提供具体修复建议
- [ ] ✅ 按优先级分类（P0/P1/P2/P3）

---

### 测试 4: 边界情况测试

#### 测试 4.1: 无代码变更
```bash
# 只修改文档文件
git checkout -b test/doc-only
echo "# Test" > README-test.md
git add README-test.md
git commit -m "docs: update readme"
git push origin test/doc-only
```

**预期结果**:
- [ ] ✅ 工作流不触发（因为没有代码文件变更）

#### 测试 4.2: Draft PR
```bash
# 创建 Draft PR
git checkout -b test/draft-pr
echo "// Draft change" >> tests/test-1.spec.ts
git add tests/test-1.spec.ts
git commit -m "test: draft pr"
git push origin test/draft-pr
# 在 GitHub 上创建 Draft PR
```

**预期结果**:
- [ ] ✅ 工作流不触发（Draft PR 被跳过）

#### 测试 4.3: 超大 PR
```bash
# 创建超过 50KB 的变更
git checkout -b test/large-pr
for i in {1..100}; do
  echo "test('test $i', async () => { /* ... */ });" >> tests/large.spec.ts
done
git add tests/large.spec.ts
git commit -m "test: large pr"
git push origin test/large-pr
```

**预期结果**:
- [ ] ✅ 工作流成功运行
- [ ] ✅ Diff 被截断到 50KB
- [ ] ✅ 日志显示 "diff truncated due to size limit"

---

## 🐛 故障排查清单

### 问题: 工作流未触发

**检查项**:
- [ ] PR 是否为 Draft 状态？
- [ ] 变更的文件是否匹配 `paths` 过滤？
- [ ] `.github/workflows/ai-code-review.yml` 是否在主分支？
- [ ] GitHub Actions 是否启用？

**修复步骤**:
```bash
# 确保 workflow 文件在主分支
git checkout main
git pull origin main
git log --oneline -1 .github/workflows/ai-code-review.yml

# 查看 Actions 权限
# Settings → Actions → General → Actions permissions
```

---

### 问题: API Key 错误

**检查项**:
- [ ] Secret 名称是否为 `DEEPSEEK_API_KEY`？（区分大小写）
- [ ] API Key 是否有效？（未过期）
- [ ] API Key 是否有余额？

**修复步骤**:
```bash
# 测试 API Key
curl https://api.deepseek.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-coder","messages":[{"role":"user","content":"test"}],"max_tokens":10}'

# 如果返回 401 Unauthorized，需要重新生成 API Key
```

---

### 问题: 评论未发布

**检查项**:
- [ ] `Post review comment to PR` 步骤是否成功？
- [ ] 权限是否包含 `issues: write`？
- [ ] `review_result.md` 文件是否生成？

**修复步骤**:
```yaml
# 确保权限正确
permissions:
  pull-requests: write
  contents: read
  issues: write  # 必需！
```

---

### 问题: Python 脚本错误

**检查项**:
- [ ] Python 版本是否为 3.x？
- [ ] heredoc 语法是否正确？（`<< 'EOF'` 和 `EOF` 顶格）
- [ ] Python 代码缩进是否一致？

**修复步骤**:
```bash
# 测试 Python 环境
python3 --version

# 测试 urllib 导入
python3 -c "import urllib.request; print('OK')"
```

---

## 📊 成功标准

所有以下条件满足，视为部署成功：

- [ ] ✅ 测试 PR 触发了 AI 代码审查工作流
- [ ] ✅ 工作流所有步骤均成功（绿色勾选）
- [ ] ✅ PR 评论区出现 AI 审查结果
- [ ] ✅ 审查结果质量良好（识别出明显问题）
- [ ] ✅ GitHub Actions Summary 显示审查摘要
- [ ] ✅ Artifacts 中可下载审查报告
- [ ] ✅ 无任何错误或警告日志

---

## 🎉 部署完成后续步骤

1. **通知团队**
   - 在团队频道发布部署通知
   - 分享 `README-ai-code-review.md` 使用指南

2. **观察期**
   - 前 10 个 PR 仔细观察审查质量
   - 收集团队反馈

3. **优化调整**
   - 根据反馈优化提示词
   - 调整审查参数（temperature、max_tokens）

4. **定期维护**
   - 每月检查 API 调用次数和费用
   - 每季度更新 DeepSeek 模型版本
   - 定期轮换 API Key

---

## 📝 部署记录

| 日期 | 操作人 | 操作内容 | 结果 | 备注 |
|-----|-------|---------|------|------|
| YYYY-MM-DD | 姓名 | 配置 Secret | ✅ | - |
| YYYY-MM-DD | 姓名 | 创建 workflow | ✅ | - |
| YYYY-MM-DD | 姓名 | 测试 PR #123 | ✅ | - |
| YYYY-MM-DD | 姓名 | 正式启用 | ✅ | - |

---

**部署者签名**: _______________  **日期**: _______________
