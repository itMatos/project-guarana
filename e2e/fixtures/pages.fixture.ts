import { test as baseTest } from '@playwright/test';
import { ProductListPage } from '../pages/product-list.page';
import { LoginPage } from '../pages/login.page';

interface PagesFixtures {
  loginPage: LoginPage;
  productListPage: ProductListPage;
}

export const pagesTest = baseTest.extend<PagesFixtures>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  productListPage: async ({ page }, use) => use(new ProductListPage(page)),
});
