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
});