# GitHub AI代码审查实施指南

> **📌 目标**: 在GitHub上借助AI工具实现自动化代码审查，提升代码质量和开发效率

---

## 🤖 AI代码审查方案对比

| 方案 | 工具 | 优势 | 适用场景 | 费用 |
|------|------|------|----------|------|
| **GitHub原生** | Copilot for PRs | 深度集成、上下文理解强 | 企业团队 | 💰💰 |
| **GitHub Actions** | AI Review Bots | 灵活、可定制 | 中小团队 | 💰 |
| **第三方平台** | CodeRabbit等 | 功能强大、专业 | 所有团队 | 💰💰 |
| **自建方案** | GPT API + Actions | 完全可控 | 技术团队 | 💰 |

---

## 🎯 方案1：GitHub Copilot for Pull Requests（推荐）

### 功能特性

**自动生成**：
- ✅ PR描述自动生成
- ✅ 代码变更摘要
- ✅ 风险分析
- ✅ 测试建议

**智能审查**：
- ✅ 潜在bug识别
- ✅ 性能问题检测
- ✅ 安全漏洞提示
- ✅ 最佳实践建议

### 启用步骤

#### 步骤1：订阅GitHub Copilot Business/Enterprise

```
Settings → Billing → Copilot Business
或通过组织管理员启用
```

#### 步骤2：在仓库中启用Copilot

```
Repository → Settings → Copilot
☑️ Enable Copilot
☑️ Pull Request Summaries
☑️ Code Review Suggestions
```

#### 步骤3：创建PR时自动触发

```markdown
当你创建PR时，Copilot会自动：
1. 分析代码变更
2. 生成PR描述
3. 标记潜在问题
4. 提供改进建议
```

### 实际效果示例

**PR描述自动生成**：
```markdown
## 📝 Summary
This PR adds user authentication functionality with JWT tokens.

## 🔍 Changes
- Added JWT token generation and validation
- Implemented login/logout endpoints
- Added middleware for protected routes
- Updated user model with password hashing

## ⚠️ Potential Issues
- Token expiration not configurable
- Missing rate limiting on login endpoint
- Password complexity requirements not enforced

## ✅ Testing Recommendations
- Add tests for token expiration scenarios
- Test concurrent login attempts
- Verify password hashing on different platforms
```

**代码审查评论示例**：
```markdown
💡 Copilot suggests:
This function might throw an unhandled exception if the database
connection fails. Consider adding error handling:

```typescript
try {
  const user = await db.users.findOne({ email });
  return user;
} catch (error) {
  logger.error('Database query failed', error);
  throw new DatabaseError('Failed to fetch user');
}
```
```

---

## 🎯 方案2：GitHub Actions + AI工具集成

### 2.1 使用OpenAI GPT进行代码审查

创建 `.github/workflows/ai-code-review.yml`：

```yaml
name: AI代码审查

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  ai-review:
    name: GPT代码审查
    runs-on: ubuntu-latest
    
    steps:
      - name: 📥 检出代码
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: 🤖 AI代码审查
        uses: anc95/ChatGPT-CodeReview@main
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          LANGUAGE: Chinese
        with:
          model: gpt-4
          review_comment_lgtm: false
```

**功能**：
- ✅ 自动审查每个PR的代码变更
- ✅ 识别潜在问题并添加评论
- ✅ 提供改进建议
- ✅ 支持中文/英文评论

**需要配置的Secrets**：
```
Settings → Secrets → Actions → New repository secret

OPENAI_API_KEY: 你的OpenAI API密钥
```

---

### 2.2 使用Claude进行代码审查

创建 `.github/workflows/claude-review.yml`：

```yaml
name: Claude AI代码审查

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  claude-review:
    name: Claude代码审查
    runs-on: ubuntu-latest
    
    steps:
      - name: 📥 检出代码
        uses: actions/checkout@v4
        with:
          fetch-depth: 2

      - name: 📊 获取代码变更
        id: get-diff
        run: |
          git diff HEAD^ HEAD > changes.diff
          echo "diff_size=$(wc -c < changes.diff)" >> $GITHUB_OUTPUT

      - name: 🤖 Claude代码审查
        if: steps.get-diff.outputs.diff_size != '0'
        uses: actions/github-script@v7
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        with:
          script: |
            const fs = require('fs');
            const https = require('https');
            
            const diff = fs.readFileSync('changes.diff', 'utf8');
            
            // 调用Claude API
            const claudeReview = await callClaudeAPI(diff);
            
            // 在PR中添加评论
            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body: `## 🤖 Claude AI代码审查\n\n${claudeReview}`
            });
            
            function callClaudeAPI(code) {
              // Claude API调用实现
              // 返回审查结果
            }
```

**需要配置的Secrets**：
```
ANTHROPIC_API_KEY: 你的Anthropic API密钥
```

---

### 2.3 使用多个AI模型的组合审查

创建 `.github/workflows/multi-ai-review.yml`：

```yaml
name: 多AI模型组合审查

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  prepare:
    name: 准备代码变更
    runs-on: ubuntu-latest
    outputs:
      has_changes: ${{ steps.check.outputs.has_changes }}
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 2
      
      - name: 检查是否有代码变更
        id: check
        run: |
          if git diff --name-only HEAD^ HEAD | grep -E '\.(js|ts|py|java|go|cpp)$'; then
            echo "has_changes=true" >> $GITHUB_OUTPUT
          else
            echo "has_changes=false" >> $GITHUB_OUTPUT
          fi

  gpt-review:
    name: GPT-4 审查
    needs: prepare
    if: needs.prepare.outputs.has_changes == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 2
      
      - name: GPT-4 代码审查
        uses: anc95/ChatGPT-CodeReview@main
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        with:
          model: gpt-4

  security-scan:
    name: 安全扫描
    needs: prepare
    if: needs.prepare.outputs.has_changes == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: CodeQL分析
        uses: github/codeql-action/analyze@v3

  quality-check:
    name: 代码质量检查
    needs: prepare
    if: needs.prepare.outputs.has_changes == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: SonarCloud扫描
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}

  summary:
    name: 生成审查摘要
    needs: [gpt-review, security-scan, quality-check]
    if: always()
    runs-on: ubuntu-latest
    steps:
      - name: 生成综合报告
        uses: actions/github-script@v7
        with:
          script: |
            const summary = `
            ## 🎯 AI代码审查综合报告
            
            ### ✅ 完成的检查
            - GPT-4 代码审查: ${{ needs.gpt-review.result }}
            - 安全扫描 (CodeQL): ${{ needs.security-scan.result }}
            - 代码质量 (SonarCloud): ${{ needs.quality-check.result }}
            
            ### 📊 建议
            请查看各个检查的详细评论和建议。
            `;
            
            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body: summary
            });
```

---

## 🎯 方案3：第三方AI代码审查平台

### 3.1 CodeRabbit（推荐⭐⭐⭐）

**功能特性**：
- ✅ AI驱动的代码审查
- ✅ 自动生成PR摘要
- ✅ 智能识别问题
- ✅ 学习团队编码风格
- ✅ 支持多种编程语言

**集成步骤**：

1. **访问CodeRabbit官网**
   ```
   https://coderabbit.ai
   ```

2. **授权GitHub仓库**
   ```
   Sign in with GitHub
   → 选择要审查的仓库
   → 授权权限
   ```

3. **配置审查规则**
   
   创建 `.coderabbit.yaml`：
   ```yaml
   language: zh-CN
   reviews:
     profile: assertive
     request_changes_workflow: true
     high_level_summary: true
     poem: false
     review_status: true
     collapse_walkthrough: false
     
   chat:
     auto_reply: true
     
   tools:
     shellcheck:
       enabled: true
     actionlint:
       enabled: true
   ```

4. **自动审查触发**
   ```
   创建PR → CodeRabbit自动分析 → 添加审查评论
   ```

**效果示例**：

```markdown
🐰 CodeRabbit Review

## Summary
This PR introduces JWT authentication with some security considerations.

## Issues Found
🔴 High Priority (2)
- Missing input validation on login endpoint (line 45)
- JWT secret stored in code instead of environment variable (line 12)

🟡 Medium Priority (3)
- No rate limiting on authentication endpoints
- Password requirements too weak
- Missing error logging

🟢 Suggestions (5)
- Consider using bcrypt with higher cost factor
- Add refresh token mechanism
- Implement token blacklist for logout
- Add API documentation
- Consider adding 2FA support

## Security Score: 6.5/10
Needs improvement before merge.
```

---

### 3.2 Codacy

**功能特性**：
- ✅ 自动代码审查
- ✅ 代码质量分析
- ✅ 安全漏洞检测
- ✅ 代码复杂度分析
- ✅ 测试覆盖率跟踪

**集成步骤**：

1. **访问Codacy**
   ```
   https://www.codacy.com
   ```

2. **添加仓库**
   ```
   Dashboard → Add repository → 选择GitHub仓库
   ```

3. **配置质量门**
   
   创建 `.codacy.yml`：
   ```yaml
   engines:
     eslint:
       enabled: true
     pylint:
       enabled: true
     
   exclude_patterns:
     - 'tests/**'
     - '**/*.spec.ts'
   ```

---

### 3.3 DeepSource

**功能特性**：
- ✅ 持续代码审查
- ✅ 自动修复建议
- ✅ 技术债务跟踪
- ✅ 性能分析
- ✅ 安全检测

**集成步骤**：

1. **访问DeepSource**
   ```
   https://deepsource.io
   ```

2. **激活仓库**
   ```
   Add Repository → 选择GitHub仓库
   ```

3. **配置分析器**
   
   创建 `.deepsource.toml`：
   ```toml
   version = 1
   
   [[analyzers]]
   name = "javascript"
   enabled = true
   
   [[analyzers]]
   name = "python"
   enabled = true
   
   [[analyzers]]
   name = "test-coverage"
   enabled = true
   ```

---

## 🎯 方案4：自建AI代码审查系统

### 完整的自定义AI审查工作流

创建 `.github/workflows/custom-ai-review.yml`：

```yaml
name: 自定义AI代码审查

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  ai-review:
    name: AI智能审查
    runs-on: ubuntu-latest
    
    steps:
      - name: 📥 检出代码
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: 🔍 分析代码变更
        id: analyze
        run: |
          # 获取变更的文件
          git diff --name-only ${{ github.event.pull_request.base.sha }} ${{ github.sha }} > changed_files.txt
          
          # 统计变更
          echo "files_changed=$(wc -l < changed_files.txt)" >> $GITHUB_OUTPUT
          
          # 获取详细diff
          git diff ${{ github.event.pull_request.base.sha }} ${{ github.sha }} > full_diff.txt

      - name: 🤖 调用AI审查API
        id: ai-review
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        run: |
          # 创建审查脚本
          cat > review.py << 'EOF'
          import os
          import json
          import requests
          
          def review_code(diff_content):
              api_key = os.environ['OPENAI_API_KEY']
              
              prompt = f"""
              你是一位资深代码审查专家。请审查以下代码变更，重点关注：
              
              1. 🐛 潜在的Bug和错误
              2. 🔒 安全漏洞
              3. ⚡ 性能问题
              4. 🧹 代码质量和可维护性
              5. 📝 最佳实践建议
              
              代码变更：
              {diff_content}
              
              请以Markdown格式输出审查结果，包含：
              - 问题严重程度（🔴高 🟡中 🟢低）
              - 具体位置
              - 问题描述
              - 修复建议
              """
              
              response = requests.post(
                  'https://api.openai.com/v1/chat/completions',
                  headers={
                      'Authorization': f'Bearer {api_key}',
                      'Content-Type': 'application/json'
                  },
                  json={
                      'model': 'gpt-4',
                      'messages': [
                          {'role': 'system', 'content': '你是一位专业的代码审查专家。'},
                          {'role': 'user', 'content': prompt}
                      ],
                      'temperature': 0.3
                  }
              )
              
              return response.json()['choices'][0]['message']['content']
          
          # 读取diff
          with open('full_diff.txt', 'r', encoding='utf-8') as f:
              diff = f.read()
          
          # 如果diff太大，只取前10000字符
          if len(diff) > 10000:
              diff = diff[:10000] + "\n\n... (diff truncated)"
          
          # 执行审查
          review_result = review_code(diff)
          
          # 保存结果
          with open('review_result.md', 'w', encoding='utf-8') as f:
              f.write(review_result)
          
          print(review_result)
          EOF
          
          # 安装依赖并运行
          pip install requests
          python review.py

      - name: 💬 发布审查评论
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const reviewResult = fs.readFileSync('review_result.md', 'utf8');
            
            const comment = `
            ## 🤖 AI代码审查报告
            
            **审查时间**: ${new Date().toLocaleString('zh-CN')}
            **变更文件数**: ${{ steps.analyze.outputs.files_changed }}
            
            ${reviewResult}
            
            ---
            
            💡 **提示**: 这是AI自动生成的审查建议，请结合人工审查进行评估。
            `;
            
            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body: comment
            });

      - name: 📊 生成审查统计
        if: always()
        run: |
          echo "## AI审查统计" >> $GITHUB_STEP_SUMMARY
          echo "- 变更文件数: ${{ steps.analyze.outputs.files_changed }}" >> $GITHUB_STEP_SUMMARY
          echo "- 审查完成时间: $(date)" >> $GITHUB_STEP_SUMMARY
```

---

## 📋 审查标准配置

### 创建AI审查提示词模板

创建 `.github/ai-review-prompt.md`：

```markdown
# AI代码审查提示词模板

## 审查维度

### 1. 代码质量（权重：25%）
- [ ] 代码可读性和可维护性
- [ ] 命名规范和一致性
- [ ] 注释和文档完整性
- [ ] 代码复杂度是否合理

### 2. 潜在Bug（权重：30%）
- [ ] 空指针/未定义检查
- [ ] 边界条件处理
- [ ] 异常处理是否完善
- [ ] 并发安全问题

### 3. 安全性（权重：25%）
- [ ] SQL注入风险
- [ ] XSS攻击风险
- [ ] 敏感信息泄露
- [ ] 权限验证是否完整

### 4. 性能（权重：15%）
- [ ] 算法时间复杂度
- [ ] 数据库查询优化
- [ ] 内存使用合理性
- [ ] 缓存策略

### 5. 最佳实践（权重：5%）
- [ ] 设计模式应用
- [ ] SOLID原则遵循
- [ ] DRY原则遵循
- [ ] 测试覆盖情况

## 输出格式

```markdown
## 🔍 审查结果

### 🔴 高优先级问题 (Must Fix)
1. **[文件名:行号]** 问题描述
   - **风险**: 说明风险
   - **建议**: 修复方案

### 🟡 中优先级问题 (Should Fix)
1. **[文件名:行号]** 问题描述
   - **影响**: 说明影响
   - **建议**: 改进建议

### 🟢 优化建议 (Nice to Have)
1. **[文件名:行号]** 优化点
   - **收益**: 说明收益
   - **建议**: 实施方案

### 📊 代码质量评分
- 整体评分: X/10
- 可维护性: X/10
- 安全性: X/10
- 性能: X/10

### ✅ 审查结论
- [ ] ✅ 批准合并
- [ ] ⚠️ 需要修改后合并
- [ ] ❌ 需要重大修改
```
```

---

## 🎯 最佳实践

### 1. AI审查与人工审查结合

```yaml
# .github/workflows/review-strategy.yml
name: 混合审查策略

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  ai-pre-review:
    name: AI预审查
    runs-on: ubuntu-latest
    steps:
      # AI自动审查，快速反馈
      - name: AI快速审查
        run: echo "AI审查中..."
  
  human-review:
    name: 人工审查
    needs: ai-pre-review
    runs-on: ubuntu-latest
    steps:
      # 需要人工审查的标签
      - name: 添加需要审查标签
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.addLabels({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              labels: ['needs-review']
            });
```

### 2. 根据文件类型选择审查策略

```yaml
# 不同文件类型使用不同的AI模型
- name: 智能路由审查
  run: |
    if git diff --name-only | grep -E '\.(ts|js)$'; then
      echo "使用TypeScript专用审查"
    elif git diff --name-only | grep -E '\.py$'; then
      echo "使用Python专用审查"
    fi
```

### 3. 设置审查质量门

```yaml
- name: 评估审查结果
  run: |
    # 如果发现高优先级问题，阻止合并
    if grep -q "🔴 高优先级" review_result.md; then
      echo "发现高优先级问题，请修复后重新提交"
      exit 1
    fi
```

---

## 📊 效果对比

| 指标 | 无AI审查 | 有AI审查 | 提升 |
|------|----------|----------|------|
| 审查速度 | 2-4小时 | 5-10分钟 | ⬆️ 90% |
| Bug发现率 | 60% | 85% | ⬆️ 42% |
| 审查覆盖率 | 40% | 95% | ⬆️ 138% |
| 人工审查时间 | 30分钟 | 10分钟 | ⬇️ 67% |
| 代码质量评分 | 7.2/10 | 8.5/10 | ⬆️ 18% |

---

## 🔧 配置检查清单

### 基础配置
- [ ] 选择AI审查方案（GitHub Copilot/Actions/第三方）
- [ ] 配置必要的API密钥（Secrets）
- [ ] 创建workflow配置文件
- [ ] 测试workflow是否正常运行

### 高级配置
- [ ] 配置分支保护规则
- [ ] 设置审查质量门标准
- [ ] 定制审查提示词模板
- [ ] 配置多AI模型组合审查

### 团队协作
- [ ] 制定AI审查与人工审查的协作流程
- [ ] 培训团队成员使用AI审查结果
- [ ] 建立反馈机制优化审查质量
- [ ] 定期评估和调整审查策略

---

## 💡 实用技巧

### 1. 控制审查成本

```yaml
# 只审查重要文件
- name: 选择性审查
  run: |
    # 排除测试文件和配置文件
    git diff --name-only | grep -v -E '(test|spec|config)\.' > files_to_review.txt
```

### 2. 缓存审查结果

```yaml
- name: 缓存审查结果
  uses: actions/cache@v3
  with:
    path: .ai-review-cache
    key: review-${{ github.sha }}
```

### 3. 增量审查

```yaml
# 只审查新增和修改的代码
- name: 增量审查
  run: |
    git diff --unified=0 ${{ github.event.pull_request.base.sha }} \
      | grep '^[+]' | grep -v '^[+][+][+]' > new_code.txt
```

---

## 🚀 快速开始指南

### 5分钟快速配置

1. **选择方案**
   ```
   推荐：GitHub Actions + GPT-4（性价比高）
   ```

2. **配置Secrets**
   ```
   Settings → Secrets → Actions
   添加 OPENAI_API_KEY
   ```

3. **创建workflow**
   ```bash
   mkdir -p .github/workflows
   # 复制上面的 ai-code-review.yml
   ```

4. **提交并测试**
   ```bash
   git add .github/workflows/ai-code-review.yml
   git commit -m "feat: add AI code review"
   git push origin main
   
   # 创建测试PR
   git checkout -b test/ai-review
   # 修改一些代码
   git push origin test/ai-review
   # 在GitHub创建PR，观察AI审查效果
   ```

---

## 📚 参考资源

### 官方文档
- [GitHub Copilot for Business](https://docs.github.com/en/copilot)
- [GitHub Actions](https://docs.github.com/en/actions)
- [OpenAI API](https://platform.openai.com/docs)

### 开源项目
- [ChatGPT-CodeReview](https://github.com/anc95/ChatGPT-CodeReview)
- [ai-codereviewer](https://github.com/freeedcom/ai-codereviewer)
- [CodeRabbit](https://coderabbit.ai)

### 最佳实践
- [Google Engineering Practices](https://google.github.io/eng-practices/review/)
- [Code Review Best Practices](https://www.kevinlondon.com/2015/05/05/code-review-best-practices.html)

---

## ❓ 常见问题

### Q1: AI审查会完全替代人工审查吗？

**A**: 不会。AI审查是辅助工具，应该与人工审查结合使用：
- AI：快速发现常见问题、最佳实践违反
- 人工：架构决策、业务逻辑、用户体验

### Q2: 如何控制AI审查的成本？

**A**: 
- 只审查关键代码文件
- 使用增量审查（只审查变更部分）
- 设置合理的Token限制
- 使用缓存避免重复审查

### Q3: AI审查的准确率如何？

**A**: 
- Bug检测准确率：约85%
- 误报率：约15%
- 最适合：代码规范、常见安全问题、性能优化
- 需要人工判断：业务逻辑、架构设计

### Q4: 如何提高AI审查质量？

**A**:
- 提供清晰的审查标准和提示词
- 结合多个AI模型（GPT-4、Claude、Codex）
- 持续优化提示词模板
- 收集反馈并调整配置

---

**文档更新时间**: 2026-01-12
