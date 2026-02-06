# GitHub AI代码审查快速参考

## 🚀 5分钟快速开始

### 步骤1：配置OpenAI API密钥
```
GitHub仓库 → Settings → Secrets → Actions → New repository secret
名称: OPENAI_API_KEY
值: 你的OpenAI API密钥
```

### 步骤2：添加Workflow文件
```bash
# 已创建: .github/workflows/ai-code-review.yml
git add .github/workflows/ai-code-review.yml
git commit -m "feat: add AI code review workflow"
git push origin main
```

### 步骤3：创建测试PR
```bash
git checkout -b test/ai-review
# 修改一些代码
git add .
git commit -m "test: trigger AI review"
git push origin test/ai-review
# 在GitHub上创建PR
```

---

## 🎯 方案选择指南

| 方案 | 适合团队 | 成本 | 配置难度 | 推荐度 |
|------|---------|------|----------|--------|
| **GitHub Copilot** | 企业（已订阅Copilot） | 高 | ⭐ 简单 | ⭐⭐⭐⭐⭐ |
| **OpenAI + Actions** | 中小团队 | 中 | ⭐⭐ 中等 | ⭐⭐⭐⭐ |
| **CodeRabbit** | 所有团队 | 中 | ⭐ 简单 | ⭐⭐⭐⭐⭐ |
| **自建方案** | 技术团队 | 低 | ⭐⭐⭐ 复杂 | ⭐⭐⭐ |

---

## 📋 常用命令

### 本地测试AI审查
```bash
# 获取最近的代码变更
git diff HEAD~1 HEAD > diff.txt

# 手动调用审查（需要配置API密钥）
export OPENAI_API_KEY="your-key"
python review_script.py
```

### 查看AI审查历史
```bash
# 在GitHub Actions中查看
Actions → AI代码审查 → 选择运行记录
```

### 下载审查报告
```bash
# Actions页面 → 选择运行 → Artifacts → 下载
```

---

## ⚙️ 配置选项

### 调整审查严格程度

编辑 `.github/workflows/ai-code-review.yml`：

```yaml
# 修改temperature参数（0-1）
temperature: 0.3  # 更严格（推荐）
temperature: 0.7  # 更宽松
```

### 只审查特定文件类型

```yaml
on:
  pull_request:
    paths:
      - '**.ts'      # 只审查TypeScript
      - '**.py'      # 只审查Python
```

### 排除测试文件

```yaml
- name: 过滤文件
  run: |
    grep -v -E '(test|spec)\.(ts|js)$' changed_files.txt > files_to_review.txt
```

---

## 🔧 故障排查

### 问题1：API调用失败

**原因**：API密钥配置错误

**解决**：
```bash
# 检查Secrets配置
Settings → Secrets → OPENAI_API_KEY
确保密钥有效且有额度
```

### 问题2：审查超时

**原因**：代码变更太大

**解决**：
```yaml
# 增加超时时间
timeout-minutes: 10

# 或限制diff大小
head -c 50000 full_diff.txt > diff_truncated.txt
```

### 问题3：没有生成评论

**原因**：权限问题

**解决**：
```yaml
# 确保workflow有评论权限
permissions:
  pull-requests: write
  issues: write
```

---

## 📊 AI审查内容示例

### 典型审查输出

```markdown
## 🔍 审查结果

### 🔴 高优先级问题 (2个)

1. **app.ts:45** - 潜在的空指针异常
   - **风险**: 当user为undefined时会导致运行时错误
   - **建议**: 添加空值检查
   ```typescript
   if (!user) {
     throw new Error('User not found');
   }
   ```

2. **api.ts:12** - SQL注入风险
   - **风险**: 直接拼接SQL参数存在注入风险
   - **建议**: 使用参数化查询
   ```typescript
   db.query('SELECT * FROM users WHERE id = ?', [userId])
   ```

### 🟡 中优先级问题 (3个)

1. **utils.ts:88** - 性能优化建议
   - **影响**: 循环中的重复计算影响性能
   - **建议**: 将计算移到循环外
   
2. **service.ts:23** - 缺少错误处理
   - **影响**: 异常未捕获可能导致应用崩溃
   - **建议**: 添加try-catch

### 🟢 优化建议 (2个)

1. **index.ts:10** - 可以使用更简洁的语法
   - **收益**: 提高代码可读性
   - **建议**: 使用ES6解构

### 📊 代码质量评分
- 整体评分: 7.5/10
- 可维护性: 8/10
- 安全性: 6/10
- 性能: 8/10

### ✅ 审查结论
⚠️ 需要修改后合并（存在2个高优先级问题）
```

---

## 💡 最佳实践

### 1. AI审查 + 人工审查
```
AI审查（自动）→ 快速发现常见问题
    ↓
人工审查（必需）→ 架构决策、业务逻辑
    ↓
批准合并
```

### 2. 分级审查策略
```
高风险文件（认证、支付）→ 人工审查必需
中风险文件（业务逻辑）   → AI + 人工
低风险文件（样式、配置）  → AI审查即可
```

### 3. 持续优化
```
收集误报/漏报 → 调整审查提示词 → 提高准确率
```

---

## 📚 相关文档

- [完整实施指南](./GitHub AI代码审查实施指南.md)
- [Playwright质量门集成](./Playwright质量门集成指南.md)
- [OpenAI API文档](https://platform.openai.com/docs)

---

## 🔗 有用链接

- **GitHub Copilot**: https://github.com/features/copilot
- **CodeRabbit**: https://coderabbit.ai
- **ChatGPT-CodeReview**: https://github.com/anc95/ChatGPT-CodeReview
- **Codacy**: https://www.codacy.com

---

## ✅ 配置检查清单

- [ ] ✅ 配置了OPENAI_API_KEY
- [ ] ✅ 添加了AI审查workflow文件
- [ ] ✅ 测试workflow运行正常
- [ ] ✅ AI审查评论成功发布到PR
- [ ] ✅ 配置了分支保护规则（可选）
- [ ] ✅ 团队成员知道如何使用AI审查结果

---

**更新时间**: 2026-01-12
