import { test as baseTest } from '@playwright/test';
import { CartPage } from '../pages/cart.page';
import { ProductListPage } from '../pages/product-list.page';
import { LoginPage } from '../pages/login.page';

interface PagesFixtures {
  loginPage: LoginPage;
  productListPage: ProductListPage;
  cartPage: CartPage;
}

export const pagesTest = baseTest.extend<PagesFixtures>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  productListPage: async ({ page }, use) => use(new ProductListPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page))
});
