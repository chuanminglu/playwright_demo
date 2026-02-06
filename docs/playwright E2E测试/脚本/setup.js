
const fs = require('fs');
const path = require('path');

// 1. 定义项目结构和文件内容
const files = {
  'package.json': JSON.stringify({
    "name": "playwright-e2e-demo",
    "version": "1.0.0",
    "scripts": {
      "test": "playwright test",
      "test:headed": "playwright test --headed",
      "test:ui": "playwright test --ui"
    },
    "devDependencies": {
      "@playwright/test": "^1.40.0",
      "@types/node": "^20.0.0",
      "typescript": "^5.0.0"
    }
  }, null, 2),

  'playwright.config.ts': `
import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});`,

  'pages/LoginPage.ts': `
import { type Locator, type Page } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
  }

  async goto() {
    await this.page.goto('https://www.saucedemo.com/');
  }

  async login(username: string, pass: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(pass);
    await this.loginButton.click();
  }
}`,

  'pages/InventoryPage.ts': `
import { type Locator, type Page } from '@playwright/test';

export class InventoryPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly shoppingCartBadge: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('.title');
    this.shoppingCartBadge = page.locator('.shopping_cart_badge');
  }

  async addItemToCart(itemName: string) {
    const itemId = itemName.toLowerCase().replace(/ /g, '-');
    await this.page.locator(\`[data-test="add-to-cart-\${itemId}"]\`).click();
  }

  async gotoCart() {
    await this.page.locator('.shopping_cart_link').click();
  }
}`,

  'pages/CartPage.ts': `
import { type Locator, type Page } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly checkoutButton: Locator;
  readonly cartItems: Locator;

  constructor(page: Page) {
    this.page = page;
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.cartItems = page.locator('.cart_item');
  }

  async checkout() {
    await this.checkoutButton.click();
  }
}`,

  'pages/CheckoutPage.ts': `
import { type Locator, type Page } from '@playwright/test';

export class CheckoutPage {
  readonly page: Page;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly finishButton: Locator;
  readonly completeHeader: Locator;

  constructor(page: Page) {
    this.page = page;
    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.finishButton = page.locator('[data-test="finish"]');
    this.completeHeader = page.locator('.complete-header');
  }

  async fillDetails(first: string, last: string, zip: string) {
    await this.firstNameInput.fill(first);
    await this.lastNameInput.fill(last);
    await this.postalCodeInput.fill(zip);
    await this.continueButton.click();
  }

  async finishCheckout() {
    await this.finishButton.click();
  }
}`,

  'tests/e2e.spec.ts': `
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';

test.describe('E2E Shopping Flow', () => {
  test('User should be able to purchase an item completely', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    console.log('Step 1: Logging in...');
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');
    await expect(inventoryPage.pageTitle).toHaveText('Products');

    console.log('Step 2: Adding item to cart...');
    await inventoryPage.addItemToCart('Sauce Labs Backpack');
    await expect(inventoryPage.shoppingCartBadge).toHaveText('1');

    console.log('Step 3: Checking cart...');
    await inventoryPage.gotoCart();
    await expect(cartPage.cartItems).toHaveCount(1);

    console.log('Step 4: Checking out...');
    await cartPage.checkout();
    await checkoutPage.fillDetails('John', 'Doe', '12345');
    
    console.log('Step 5: Finishing order...');
    await checkoutPage.finishCheckout();
    await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
    console.log('Test Passed: Order completed successfully!');
  });
});`
};

// 2. 执行文件生成
console.log('🚀 开始生成 Playwright E2E 演示项目...');

Object.entries(files).forEach(([filePath, content]) => {
  const fullPath = path.join(__dirname, filePath);
  const dirName = path.dirname(fullPath);

  // 确保目录存在
  if (!fs.existsSync(dirName)) {
    fs.mkdirSync(dirName, { recursive: true });
  }

  // 写入文件
  fs.writeFileSync(fullPath, content.trim());
  console.log(`✅ 已创建: ${filePath}`);
});

console.log('\n🎉 项目生成成功！请按以下步骤运行：');
console.log('1. npm install');
console.log('2. npx playwright install');
console.log('3. npm run test:headed');
