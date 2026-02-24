# Swag Labs E2E 测试用例文档

> **项目**: Swag Labs 电商演示站自动化测试  
> **目标URL**: https://www.saucedemo.com/  
> **生成方式**: MCP 探索 + AI 分析  
> **生成日期**: 2026-02-06  
> **测试框架**: Playwright + TypeScript + POM 模式

---

## 📋 测试范围

### 页面清单（MCP 探索确认）

| 页面 | URL | 状态 |
|------|-----|:----:|
| 登录页 | `/` | ✅ 已探索 |
| 商品列表页 | `/inventory.html` | ✅ 已探索 |
| 购物车页 | `/cart.html` | ⏳ 待探索 |
| 结账-填写信息 | `/checkout-step-one.html` | ⏳ 待探索 |
| 结账-订单确认 | `/checkout-step-two.html` | ⏳ 待探索 |
| 结账-完成 | `/checkout-complete.html` | ⏳ 待探索 |

### 测试账号

| 用户名 | 密码 | 用途 |
|--------|------|------|
| `standard_user` | `secret_sauce` | 标准正常流程 |
| `locked_out_user` | `secret_sauce` | 锁定用户，验证拒绝登录 |
| `problem_user` | `secret_sauce` | 异常用户，部分功能故障 |
| `performance_glitch_user` | `secret_sauce` | 性能缓慢用户 |
| `error_user` | `secret_sauce` | 触发错误的用户 |
| `visual_user` | `secret_sauce` | UI 视觉差异用户 |

### 关键元素选择器（MCP 提取）

#### 登录页

| 元素 | 选择器 |
|------|--------|
| 用户名输入框 | `[data-test="username"]` |
| 密码输入框 | `[data-test="password"]` |
| 登录按钮 | `[data-test="login-button"]` |
| 错误提示 | `[data-test="error"]` |

#### 商品列表页

| 元素 | 选择器 |
|------|--------|
| 页面标题 | `.title` |
| 排序下拉框 | `[data-test="product-sort-container"]` |
| 商品卡片 | `.inventory_item` |
| 商品名称 | `.inventory_item_name` |
| 商品价格 | `.inventory_item_price` |
| 商品描述 | `.inventory_item_desc` |
| 添加购物车按钮 | `[data-test="add-to-cart-{item-id}"]` |
| 移除按钮 | `[data-test="remove-{item-id}"]` |
| 购物车链接 | `.shopping_cart_link` |
| 购物车徽标（数量） | `.shopping_cart_badge` |
| 汉堡菜单按钮 | `#react-burger-menu-btn` |

#### 购物车页

| 元素 | 选择器 |
|------|--------|
| 购物车商品 | `.cart_item` |
| 结账按钮 | `[data-test="checkout"]` |
| 继续购物按钮 | `[data-test="continue-shopping"]` |
| 移除按钮 | `[data-test="remove-{item-id}"]` |

#### 结账页

| 元素 | 选择器 |
|------|--------|
| 名字输入框 | `[data-test="firstName"]` |
| 姓氏输入框 | `[data-test="lastName"]` |
| 邮编输入框 | `[data-test="postalCode"]` |
| 继续按钮 | `[data-test="continue"]` |
| 取消按钮 | `[data-test="cancel"]` |
| 完成按钮 | `[data-test="finish"]` |
| 完成标题 | `.complete-header` |
| 错误提示 | `[data-test="error"]` |

---

## 🧪 测试用例

### TC-01: 用户登录

#### TC-01-01: 标准用户正常登录

| 项目 | 内容 |
|------|------|
| **用例ID** | TC-01-01 |
| **优先级** | P0（核心） |
| **前置条件** | 浏览器已打开登录页 |
| **测试数据** | username: `standard_user`, password: `secret_sauce` |

**测试步骤**:

| 步骤 | 操作 | 预期结果 |
|:----:|------|----------|
| 1 | 打开 `https://www.saucedemo.com/` | 显示登录页面，包含用户名、密码输入框和登录按钮 |
| 2 | 在用户名输入框填写 `standard_user` | 输入框显示 `standard_user` |
| 3 | 在密码输入框填写 `secret_sauce` | 输入框显示密码掩码 |
| 4 | 点击 Login 按钮 | 页面跳转至 `/inventory.html`，标题显示 "Products" |

#### TC-01-02: 锁定用户登录被拒绝

| 项目 | 内容 |
|------|------|
| **用例ID** | TC-01-02 |
| **优先级** | P0（核心） |
| **前置条件** | 浏览器已打开登录页 |
| **测试数据** | username: `locked_out_user`, password: `secret_sauce` |

**测试步骤**:

| 步骤 | 操作 | 预期结果 |
|:----:|------|----------|
| 1 | 打开 `https://www.saucedemo.com/` | 显示登录页面 |
| 2 | 填写用户名 `locked_out_user` 和密码 `secret_sauce` | 输入框正确填充 |
| 3 | 点击 Login 按钮 | 页面**不跳转**，显示错误信息 |
| 4 | 检查错误提示 `[data-test="error"]` | 包含文本 "locked out" |

#### TC-01-03: 空用户名登录

| 项目 | 内容 |
|------|------|
| **用例ID** | TC-01-03 |
| **优先级** | P1（重要） |
| **前置条件** | 浏览器已打开登录页 |
| **测试数据** | username: 空, password: `secret_sauce` |

**测试步骤**:

| 步骤 | 操作 | 预期结果 |
|:----:|------|----------|
| 1 | 打开登录页 | 显示登录页面 |
| 2 | 密码输入框填写 `secret_sauce`，用户名留空 | 密码已填写 |
| 3 | 点击 Login 按钮 | 显示错误提示 "Username is required" |

#### TC-01-04: 空密码登录

| 项目 | 内容 |
|------|------|
| **用例ID** | TC-01-04 |
| **优先级** | P1（重要） |
| **前置条件** | 浏览器已打开登录页 |
| **测试数据** | username: `standard_user`, password: 空 |

**测试步骤**:

| 步骤 | 操作 | 预期结果 |
|:----:|------|----------|
| 1 | 打开登录页 | 显示登录页面 |
| 2 | 用户名填写 `standard_user`，密码留空 | 用户名已填写 |
| 3 | 点击 Login 按钮 | 显示错误提示 "Password is required" |

#### TC-01-05: 错误密码登录

| 项目 | 内容 |
|------|------|
| **用例ID** | TC-01-05 |
| **优先级** | P1（重要） |
| **前置条件** | 浏览器已打开登录页 |
| **测试数据** | username: `standard_user`, password: `wrong_password` |

**测试步骤**:

| 步骤 | 操作 | 预期结果 |
|:----:|------|----------|
| 1 | 打开登录页 | 显示登录页面 |
| 2 | 填写用户名 `standard_user`，密码 `wrong_password` | 表单已填充 |
| 3 | 点击 Login 按钮 | 显示错误提示，包含 "do not match" |

---

### TC-02: 商品浏览与排序

#### TC-02-01: 商品列表正确显示

| 项目 | 内容 |
|------|------|
| **用例ID** | TC-02-01 |
| **优先级** | P0（核心） |
| **前置条件** | 已使用 `standard_user` 登录成功 |

**测试步骤**:

| 步骤 | 操作 | 预期结果 |
|:----:|------|----------|
| 1 | 登录后进入商品列表页 | 页面标题为 "Products" |
| 2 | 检查商品卡片数量 | 共显示 6 件商品 |
| 3 | 检查每件商品包含的信息 | 每件商品显示：图片、名称、描述、价格、"Add to cart" 按钮 |

**验证数据**（来自 MCP 探索）:

| 商品名称 | 价格 |
|----------|------|
| Sauce Labs Backpack | $29.99 |
| Sauce Labs Bike Light | $9.99 |
| Sauce Labs Bolt T-Shirt | $15.99 |
| Sauce Labs Fleece Jacket | $49.99 |
| Sauce Labs Onesie | $7.99 |
| Test.allTheThings() T-Shirt (Red) | $15.99 |

#### TC-02-02: 商品按名称排序（A-Z / Z-A）

| 项目 | 内容 |
|------|------|
| **用例ID** | TC-02-02 |
| **优先级** | P1（重要） |
| **前置条件** | 已登录，在商品列表页 |

**测试步骤**:

| 步骤 | 操作 | 预期结果 |
|:----:|------|----------|
| 1 | 检查默认排序 | 下拉框为 "Name (A to Z)"，第一个商品为 "Sauce Labs Backpack" |
| 2 | 选择 "Name (Z to A)" | 商品列表重新排序，第一个商品为 "Test.allTheThings() T-Shirt (Red)" |

#### TC-02-03: 商品按价格排序（低→高 / 高→低）

| 项目 | 内容 |
|------|------|
| **用例ID** | TC-02-03 |
| **优先级** | P1（重要） |
| **前置条件** | 已登录，在商品列表页 |

**测试步骤**:

| 步骤 | 操作 | 预期结果 |
|:----:|------|----------|
| 1 | 选择 "Price (low to high)" | 第一个商品价格为 $7.99（Onesie） |
| 2 | 选择 "Price (high to low)" | 第一个商品价格为 $49.99（Fleece Jacket） |

---

### TC-03: 购物车操作

#### TC-03-01: 添加单个商品到购物车

| 项目 | 内容 |
|------|------|
| **用例ID** | TC-03-01 |
| **优先级** | P0（核心） |
| **前置条件** | 已登录，在商品列表页 |

**测试步骤**:

| 步骤 | 操作 | 预期结果 |
|:----:|------|----------|
| 1 | 点击 "Sauce Labs Backpack" 的 "Add to cart" 按钮 | 按钮文本变为 "Remove" |
| 2 | 检查购物车徽标 | 购物车图标显示数字 "1" |

#### TC-03-02: 添加多个商品到购物车

| 项目 | 内容 |
|------|------|
| **用例ID** | TC-03-02 |
| **优先级** | P1（重要） |
| **前置条件** | 已登录，在商品列表页 |

**测试步骤**:

| 步骤 | 操作 | 预期结果 |
|:----:|------|----------|
| 1 | 点击 "Sauce Labs Backpack" 的 "Add to cart" | 购物车徽标显示 "1" |
| 2 | 点击 "Sauce Labs Bike Light" 的 "Add to cart" | 购物车徽标显示 "2" |
| 3 | 点击购物车图标进入购物车页面 | 购物车中显示 2 件商品 |

#### TC-03-03: 从商品列表页移除购物车商品

| 项目 | 内容 |
|------|------|
| **用例ID** | TC-03-03 |
| **优先级** | P1（重要） |
| **前置条件** | 已登录，购物车已有 1 件商品 |

**测试步骤**:

| 步骤 | 操作 | 预期结果 |
|:----:|------|----------|
| 1 | 商品的按钮显示 "Remove" | 确认商品已在购物车 |
| 2 | 点击 "Remove" 按钮 | 按钮恢复为 "Add to cart" |
| 3 | 检查购物车徽标 | 徽标消失（购物车为空） |

#### TC-03-04: 购物车页面验证与移除

| 项目 | 内容 |
|------|------|
| **用例ID** | TC-03-04 |
| **优先级** | P1（重要） |
| **前置条件** | 已添加商品到购物车 |

**测试步骤**:

| 步骤 | 操作 | 预期结果 |
|:----:|------|----------|
| 1 | 点击购物车图标进入购物车页 | URL 为 `/cart.html`，显示已添加的商品 |
| 2 | 检查商品信息 | 显示商品名称、描述、价格 |
| 3 | 点击某商品的 "Remove" 按钮 | 该商品从购物车消失 |
| 4 | 点击 "Continue Shopping" | 返回商品列表页 |

---

### TC-04: 结账流程

#### TC-04-01: 正常结账 - 填写完整信息

| 项目 | 内容 |
|------|------|
| **用例ID** | TC-04-01 |
| **优先级** | P0（核心） |
| **前置条件** | 购物车中有至少 1 件商品，已进入购物车页 |
| **测试数据** | firstName: `John`, lastName: `Doe`, postalCode: `12345` |

**测试步骤**:

| 步骤 | 操作 | 预期结果 |
|:----:|------|----------|
| 1 | 在购物车页点击 "Checkout" | 跳转到 `/checkout-step-one.html` |
| 2 | 填写 First Name: `John` | 输入框正确填充 |
| 3 | 填写 Last Name: `Doe` | 输入框正确填充 |
| 4 | 填写 Postal Code: `12345` | 输入框正确填充 |
| 5 | 点击 "Continue" | 跳转到 `/checkout-step-two.html`，显示订单摘要 |
| 6 | 检查订单摘要 | 显示商品列表、单价、总价（含税） |
| 7 | 点击 "Finish" | 跳转到 `/checkout-complete.html` |
| 8 | 检查完成页面 | 标题显示 "Thank you for your order!" |

#### TC-04-02: 结账 - 信息为空校验

| 项目 | 内容 |
|------|------|
| **用例ID** | TC-04-02 |
| **优先级** | P1（重要） |
| **前置条件** | 购物车中有商品，已进入结账信息页 |

**测试步骤**:

| 步骤 | 操作 | 预期结果 |
|:----:|------|----------|
| 1 | 不填写任何信息，直接点击 "Continue" | 显示错误 "First Name is required" |
| 2 | 填写 First Name，其他留空，点击 "Continue" | 显示错误 "Last Name is required" |
| 3 | 填写 First Name 和 Last Name，邮编留空，点击 "Continue" | 显示错误 "Postal Code is required" |

---

### TC-05: 完整购物流程（E2E）

#### TC-05-01: 端到端购物流程

| 项目 | 内容 |
|------|------|
| **用例ID** | TC-05-01 |
| **优先级** | P0（核心，冒烟测试） |
| **前置条件** | 无 |
| **测试数据** | user: `standard_user` / `secret_sauce`, checkout: `John` / `Doe` / `12345` |

**测试步骤**:

| 步骤 | 操作 | 预期结果 |
|:----:|------|----------|
| 1 | 打开 `https://www.saucedemo.com/` | 显示登录页 |
| 2 | 使用 `standard_user` / `secret_sauce` 登录 | 跳转商品列表页，标题 "Products" |
| 3 | 点击 "Sauce Labs Backpack" 的 "Add to cart" | 购物车徽标显示 "1" |
| 4 | 点击购物车图标 | 跳转购物车页，显示 1 件商品 |
| 5 | 点击 "Checkout" | 跳转结账信息页 |
| 6 | 填写 `John` / `Doe` / `12345`，点击 "Continue" | 跳转订单确认页 |
| 7 | 点击 "Finish" | 跳转完成页 |
| 8 | 检查完成页标题 | "Thank you for your order!" |

---

### TC-06: 登出功能

#### TC-06-01: 从汉堡菜单登出

| 项目 | 内容 |
|------|------|
| **用例ID** | TC-06-01 |
| **优先级** | P1（重要） |
| **前置条件** | 已使用 `standard_user` 登录 |

**测试步骤**:

| 步骤 | 操作 | 预期结果 |
|:----:|------|----------|
| 1 | 点击汉堡菜单按钮 `#react-burger-menu-btn` | 展开侧边菜单 |
| 2 | 点击 "Logout" 链接 | 跳转回登录页 `/` |
| 3 | 检查URL | URL 为 `https://www.saucedemo.com/` |

---

## 📊 测试用例统计

| 模块 | P0 | P1 | 合计 |
|------|:--:|:--:|:----:|
| 用户登录 (TC-01) | 2 | 3 | 5 |
| 商品浏览与排序 (TC-02) | 1 | 2 | 3 |
| 购物车操作 (TC-03) | 1 | 3 | 4 |
| 结账流程 (TC-04) | 1 | 1 | 2 |
| 完整购物流程 (TC-05) | 1 | 0 | 1 |
| 登出功能 (TC-06) | 0 | 1 | 1 |
| **合计** | **6** | **10** | **16** |

---

## 🗂️ POM 类映射

| 测试模块 | 对应 Page Object | 文件 |
|----------|------------------|------|
| TC-01 登录 | `LoginPage` | `pages/LoginPage.ts` |
| TC-02 商品浏览 | `InventoryPage` | `pages/InventoryPage.ts` |
| TC-03 购物车 | `CartPage` | `pages/CartPage.ts` |
| TC-04/05 结账 | `CheckoutPage` | `pages/CheckoutPage.ts` |

---

## 🔄 自动化实现优先级

| 优先级 | 测试文件 | 包含用例 |
|:------:|----------|----------|
| 1 | `login.spec.ts` | TC-01-01 ~ TC-01-05 |
| 2 | `e2e-shopping.spec.ts` | TC-05-01 |
| 3 | `inventory.spec.ts` | TC-02-01 ~ TC-02-03 |
| 4 | `cart.spec.ts` | TC-03-01 ~ TC-03-04 |
| 5 | `checkout.spec.ts` | TC-04-01 ~ TC-04-02 |
| 6 | `logout.spec.ts` | TC-06-01 |
