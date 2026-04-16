# 用户登录功能测试用例清单

## 测试范围

- **系统**: Swag Labs 电商平台
- **功能模块**: 用户认证-登录
- **关联用户故事**: SWAG-US002 用户登录
- **测试用例总数**: 5
  - P0用例: 1
  - P1用例: 4
  - P2用例: 0
- **可自动化用例数**: 5

## 测试覆盖矩阵

| 测试场景 | 对应用例 | 覆盖状态 |
|----------|----------|----------|
| 正确凭证登录跳转商品页 | SWAG-LOGIN-001 | ✅ 已覆盖 |
| 错误密码显示错误提示 | SWAG-LOGIN-002 | ✅ 已覆盖 |
| 用户名为空显示必填提示 | SWAG-LOGIN-003 | ✅ 已覆盖 |
| 密码为空显示必填提示 | SWAG-LOGIN-004 | ✅ 已覆盖 |
| 双字段为空用户名优先提示 | SWAG-LOGIN-005 | ✅ 已覆盖 |

## 功能测试用例列表

| 用例编号 | 系统 | 功能模块 | 用例概述 | 优先级 | 标签 | 前提条件 | 输入数据或操作 | 预期结果 | 测试结果 |
|---------|------|---------|---------|--------|------|---------|--------------|---------|---------|
| SWAG-LOGIN-001 | Swag Labs | 用户认证-登录 | 正确凭证登录成功跳转商品列表 | P0 | 功能测试,可自动化 | 1. 打开 https://www.saucedemo.com/<br>2. 登录页正常加载 | 1. 用户名输入框输入 `standard_user`<br>2. 密码输入框输入 `secret_sauce`<br>3. 点击【Login】按钮 | 1. 页面 URL 变为 `/inventory.html`<br>2. 页面标题显示 `Products`<br>3. 商品列表可见（至少1件）<br>4. 不显示任何错误提示 | 待测试 |
| SWAG-LOGIN-002 | Swag Labs | 用户认证-登录 | 错误密码显示错误提示 | P1 | 异常测试,可自动化 | 1. 打开 https://www.saucedemo.com/<br>2. 登录页正常加载 | 1. 用户名输入框输入 `standard_user`<br>2. 密码输入框输入 `wrong_password`<br>3. 点击【Login】按钮 | 1. 页面 URL 保持 `https://www.saucedemo.com/`（未跳转）<br>2. 显示错误提示：`Epic sadface: Username and password do not match any user in this service`<br>3. 输入框显示红色错误状态 | 待测试 |
| SWAG-LOGIN-003 | Swag Labs | 用户认证-登录 | 用户名为空显示必填提示 | P1 | 参数验证,可自动化 | 1. 打开 https://www.saucedemo.com/<br>2. 登录页正常加载 | 1. 用户名输入框**留空**<br>2. 密码输入框输入 `secret_sauce`<br>3. 点击【Login】按钮 | 1. 页面 URL 保持 `https://www.saucedemo.com/`（未跳转）<br>2. 显示错误提示：`Epic sadface: Username is required` | 待测试 |
| SWAG-LOGIN-004 | Swag Labs | 用户认证-登录 | 密码为空显示必填提示 | P1 | 参数验证,可自动化 | 1. 打开 https://www.saucedemo.com/<br>2. 登录页正常加载 | 1. 用户名输入框输入 `standard_user`<br>2. 密码输入框**留空**<br>3. 点击【Login】按钮 | 1. 页面 URL 保持 `https://www.saucedemo.com/`（未跳转）<br>2. 显示错误提示包含 `Password is required`（推断，待 MCP 验证） | 待测试 |
| SWAG-LOGIN-005 | Swag Labs | 用户认证-登录 | 用户名和密码均为空显示用户名必填提示 | P1 | 参数验证,可自动化 | 1. 打开 https://www.saucedemo.com/<br>2. 登录页正常加载 | 1. 用户名输入框**留空**<br>2. 密码输入框**留空**<br>3. 点击【Login】按钮 | 1. 页面 URL 保持 `https://www.saucedemo.com/`（未跳转）<br>2. 显示错误提示：`Epic sadface: Username is required`（用户名优先校验，推断，待 MCP 验证） | 待测试 |
