import { test, expect } from '../../fixtures';

test.use({ authenticated: false });

test.describe('login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('com credenciais válidas abre a lista de produtos', async ({ page, loginPage, productListPage }) => {
    await loginPage.login(process.env['E2E_USER']!, process.env['E2E_PASS']!);

    await expect(page).toHaveURL(/\/store\/products$/);
    await expect(productListPage.logoutButton).toBeVisible();
  });

  test('com credenciais inválidas mostra o erro e permanece no login', async ({ page, loginPage }) => {
    await loginPage.login(process.env['E2E_USER']!, 'senha-incorreta');

    await expect(loginPage.message('Usuário e senha não correspondem a nenhum usuário')).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });
});
