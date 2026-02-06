# Page Object Model Template

## Structure

```typescript
// tests/pages/{PageName}Page.ts
import { type Locator, type Page, expect } from '@playwright/test';

export class {PageName}Page {
  readonly page: Page;

  // ========== Locators ==========
  readonly primaryAction: Locator;
  readonly errorMessage: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    // Prefer data-testid > role > text > class
    this.primaryAction = page.locator('[data-testid="primary-action"]');
    this.errorMessage = page.locator('[role="alert"]');
    this.successMessage = page.locator('.success-message');
  }

  // ========== Navigation ==========
  async goto() {
    await this.page.goto('/{path}');
  }

  // ========== Actions ==========
  async submit() {
    await this.primaryAction.click();
  }

  // ========== Getters ==========
  async getErrorText(): Promise<string | null> {
    return await this.errorMessage.textContent();
  }

  // ========== Assertions ==========
  async expectError(message: string) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(message);
  }

  async expectSuccess() {
    await expect(this.successMessage).toBeVisible();
  }
}
```

## Complete Example: LoginPage

```typescript
// tests/pages/LoginPage.ts
import { type Locator, type Page, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;

  // Locators
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly rememberMe: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByLabel('Username');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: 'Sign in' });
    this.errorMessage = page.locator('[role="alert"]');
    this.rememberMe = page.getByLabel('Remember me');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectError(message: string) {
    await expect(this.errorMessage).toContainText(message);
  }

  async expectLoggedIn() {
    await expect(this.page).toHaveURL(/dashboard|home/);
  }
}
```

## Test Using POM

```typescript
// tests/login.spec.ts
import { test } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

test.describe('Login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('successful login', async () => {
    await loginPage.login('user@example.com', 'password123');
    await loginPage.expectLoggedIn();
  });

  test('invalid credentials', async () => {
    await loginPage.login('user@example.com', 'wrong');
    await loginPage.expectError('Invalid credentials');
  });
});
```

## Locator Strategy (Priority Order)

| Priority | Method | Example | Stability |
|----------|--------|---------|-----------|
| 1 | data-testid | `[data-testid="submit"]` | ⭐⭐⭐ |
| 2 | Role + Name | `getByRole('button', { name: 'Submit' })` | ⭐⭐⭐ |
| 3 | Label | `getByLabel('Email')` | ⭐⭐ |
| 4 | Placeholder | `getByPlaceholder('Enter email')` | ⭐⭐ |
| 5 | Text | `getByText('Sign in')` | ⭐ |
| 6 | CSS class | `.submit-button` | ⚠️ Avoid |

## Method Naming Convention

```typescript
// Actions: verb + noun
login(user, pass)
submitForm()
selectOption(value)
toggleCheckbox()

// Getters: get + noun
getErrorText(): Promise<string>
getSelectedValue(): Promise<string>
getItemCount(): Promise<number>

// Assertions: expect + condition
expectError(message)
expectSuccess()
expectDisabled()
expectVisible()
```
