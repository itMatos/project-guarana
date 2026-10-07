import { test, expect } from '../../fixtures';

test.describe('logout', () => {
  test.beforeEach(async ({ productListPage }) => {
    await productListPage.goto();
  });

  test('volta para o login', async ({ page, productListPage }) => {
    await productListPage.logout();

    await expect(page).toHaveURL(/\/login$/);
  });

  test('bloqueia o acesso à lista de produtos depois de sair', async ({ page, productListPage, loginPage }) => {
    await productListPage.logout();
    await expect(page).toHaveURL(/\/login$/);

    await productListPage.goto();

    await expect(page).toHaveURL(/\/login\?error=auth-required/);
    await expect(loginPage.message("Você só pode acessar '/store/products' quando estiver logado.")).toBeVisible();
  });
});
