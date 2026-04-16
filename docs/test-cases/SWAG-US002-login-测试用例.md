# 用户登录功能测试用例清单

## 测试范围

- **系统**: Swag Labs 电商平台
- **功能模块**: 用户认证-登录
- **测试环境**: https://www.saucedemo.com/
- **关联用户故事**: SWAG-US002 用户登录
- **测试用例总数**: 5（P0: 1 / P1: 4 / P2: 0）
- **可自动化用例数**: 5

---

## 测试覆盖矩阵

| 验收规则ID | 规则描述 | 对应用例编号 | 覆盖状态 |
|-----------|---------|------------|---------|
| AC1 / F1 | 使用正确凭证登录后，URL 变为 /inventory.html，页面标题显示 "Products" | SWAG-LOGIN-001 | ✅ 已覆盖 |
| AC2 / D1 | 使用错误密码，停留在登录页，显示 "Epic sadface: Username and password do not match any user in this service" | SWAG-LOGIN-002 | ✅ 已覆盖 |
| AC3 / D2 | 用户名字段为空时，显示 "Epic sadface: Username is required" | SWAG-LOGIN-003 | ✅ 已覆盖 |
| 推断规则 | 密码字段为空时，显示密码必填提示（与 AC3 同类型，推断存在） | SWAG-LOGIN-004 | ✅ 已覆盖 |
| 推断规则 | 用户名和密码均为空时，以用户名优先显示提示（与 AC3 同类型） | SWAG-LOGIN-005 | ✅ 已覆盖 |

---

## 功能测试用例列表

| 用例编号 | 系统 | 功能模块 | 用例概述 | 优先级 | 标签 |
|---------|------|---------|---------|-------|-----|
| SWAG-LOGIN-001 | Swag Labs | 用户认证-登录 | 正确凭证登录成功跳转商品列表 | P0 | 功能测试,可自动化 |
| SWAG-LOGIN-002 | Swag Labs | 用户认证-登录 | 错误密码显示错误提示 | P1 | 异常测试,可自动化 |
| SWAG-LOGIN-003 | Swag Labs | 用户认证-登录 | 用户名为空显示必填提示 | P1 | 参数验证,可自动化 |
| SWAG-LOGIN-004 | Swag Labs | 用户认证-登录 | 密码为空显示必填提示 | P1 | 参数验证,可自动化 |
| SWAG-LOGIN-005 | Swag Labs | 用户认证-登录 | 用户名和密码均为空显示用户名必填提示 | P1 | 参数验证,可自动化 |

---

### SWAG-LOGIN-001

| 字段 | 内容 |
|-----|------|
| **前提条件** | 1. 打开 https://www.saucedemo.com/ <br> 2. 登录页正常加载，显示用户名输入框、密码输入框和 Login 按钮 |
| **输入数据或操作** | 1. 在用户名输入框输入 `standard_user` <br> 2. 在密码输入框输入 `secret_sauce` <br> 3. 点击 Login 按钮 |
| **预期结果** | 1. 页面 URL 变为 `https://www.saucedemo.com/inventory.html` <br> 2. 页面标题区域显示文字 `Products` <br> 3. 商品列表可见（至少显示1件商品） <br> 4. 不显示任何错误提示 |
| **测试结果** | ⬜ 待执行 |

---

### SWAG-LOGIN-002

| 字段 | 内容 |
|-----|------|
| **前提条件** | 1. 打开 https://www.saucedemo.com/ <br> 2. 登录页正常加载 |
| **输入数据或操作** | 1. 在用户名输入框输入 `standard_user` <br> 2. 在密码输入框输入 `wrong_password` <br> 3. 点击 Login 按钮 |
| **预期结果** | 1. 页面 URL 保持为 `https://www.saucedemo.com/`（未跳转） <br> 2. 页面显示错误提示框，内容为：`Epic sadface: Username and password do not match any user in this service` <br> 3. 用户名输入框和密码输入框显示红色边框或错误状态标识 |
| **测试结果** | ⬜ 待执行 |

---

### SWAG-LOGIN-003

| 字段 | 内容 |
|-----|------|
| **前提条件** | 1. 打开 https://www.saucedemo.com/ <br> 2. 登录页正常加载 |
| **输入数据或操作** | 1. 用户名输入框保持**空白，不输入任何内容** <br> 2. 在密码输入框输入 `secret_sauce` <br> 3. 点击 Login 按钮 |
| **预期结果** | 1. 页面 URL 保持为 `https://www.saucedemo.com/`（未跳转） <br> 2. 页面显示错误提示框，内容为：`Epic sadface: Username is required` |
| **测试结果** | ⬜ 待执行 |

---

### SWAG-LOGIN-004

| 字段 | 内容 |
|-----|------|
| **前提条件** | 1. 打开 https://www.saucedemo.com/ <br> 2. 登录页正常加载 |
| **输入数据或操作** | 1. 在用户名输入框输入 `standard_user` <br> 2. 密码输入框保持**空白，不输入任何内容** <br> 3. 点击 Login 按钮 |
| **预期结果** | 1. 页面 URL 保持为 `https://www.saucedemo.com/`（未跳转） <br> 2. 页面显示错误提示框，内容包含 `Password is required`（推断，需与开发确认） |
| **测试结果** | ⬜ 待执行 |
| **测试备注** | 提示文案为推断，实际文案需在 Phase 2 MCP 探索阶段验证 |

---

### SWAG-LOGIN-005

| 字段 | 内容 |
|-----|------|
| **前提条件** | 1. 打开 https://www.saucedemo.com/ <br> 2. 登录页正常加载 |
| **输入数据或操作** | 1. 用户名输入框保持**空白** <br> 2. 密码输入框保持**空白** <br> 3. 点击 Login 按钮 |
| **预期结果** | 1. 页面 URL 保持为 `https://www.saucedemo.com/`（未跳转） <br> 2. 页面显示错误提示框，内容为：`Epic sadface: Username is required`（用户名优先校验） |
| **测试结果** | ⬜ 待执行 |
| **测试备注** | 双空字段时的校验顺序为推断（假设前端按字段顺序校验），Phase 2 MCP 探索阶段验证实际行为 |
