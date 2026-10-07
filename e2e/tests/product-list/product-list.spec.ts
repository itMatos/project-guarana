import { aProduct } from '../../../src/testing/builders/product.builder';
import { test, expect } from '../../fixtures';

test.describe('lista de produtos', () => {
  test('exibe os produtos retornados pela API', async ({ api, productListPage }) => {
    api.setProducts([
      aProduct().withId(1).withName('Mochila de Teste').build(),
      aProduct().withId(2).withName('Lanterna de Teste').build(),
      aProduct().withId(3).withName('Camiseta de Teste').build()
    ]);

    await productListPage.goto();

    await expect(productListPage.addToCartButtons).toHaveCount(3);
    await expect(productListPage.product('Mochila de Teste')).toBeVisible();
    await expect(productListPage.product('Lanterna de Teste')).toBeVisible();
    await expect(productListPage.product('Camiseta de Teste')).toBeVisible();
  });

  test('não exibe itens quando a API retorna lista vazia', async ({ page, api, productListPage }) => {
    api.setProducts([]);

    // Espera a resposta antes de afirmar a ausência; senão a asserção passaria antes da requisição.
    const response = page.waitForResponse('**/api/products');
    await productListPage.goto();
    expect((await response).status()).toBe(200);

    await expect(productListPage.addToCartButtons).toHaveCount(0);
    await expect(productListPage.logoutButton).toBeVisible();
    await expect(page).toHaveURL(/\/store\/products$/);
  });

  test('não exibe itens nem desloga quando a API responde 500', async ({ page, api, productListPage }) => {
    api.failProductsWith(500);

    const response = page.waitForResponse('**/api/products');
    await productListPage.goto();
    expect((await response).status()).toBe(500);

    await expect(productListPage.addToCartButtons).toHaveCount(0);
    await expect(productListPage.logoutButton).toBeVisible();
    await expect(page).toHaveURL(/\/store\/products$/);
  });
});
