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

  test('separa os produtos nas abas de categoria', async ({ api, productListPage }) => {
    api.setProducts([
      aProduct().withId(1).withName('Celular de Teste').withCategory('celulares').build(),
      aProduct().withId(2).withName('Notebook de Teste').withCategory('notebooks').build(),
      aProduct().withId(3).withName('Outro Notebook de Teste').withCategory('notebooks').build(),
      aProduct().withId(4).withName('Tablet de Teste').withCategory('tablets').build()
    ]);

    await productListPage.goto();

    await expect(productListPage.categoryTab('Celulares')).toHaveAttribute('aria-selected', 'true');
    await expect(productListPage.addToCartButtons).toHaveCount(1);
    await expect(productListPage.product('Celular de Teste')).toBeVisible();

    await productListPage.selectCategory('Notebooks');
    await expect(productListPage.addToCartButtons).toHaveCount(2);
    await expect(productListPage.product('Notebook de Teste')).toBeVisible();
    await expect(productListPage.product('Outro Notebook de Teste')).toBeVisible();
    await expect(productListPage.product('Celular de Teste')).toHaveCount(0);

    await productListPage.selectCategory('Tablets');
    await expect(productListPage.addToCartButtons).toHaveCount(1);
    await expect(productListPage.product('Tablet de Teste')).toBeVisible();
  });

  test('exibe mensagem quando a categoria não tem produtos', async ({ api, productListPage }) => {
    api.setProducts([aProduct().withId(1).withName('Celular de Teste').withCategory('celulares').build()]);

    await productListPage.goto();
    await expect(productListPage.product('Celular de Teste')).toBeVisible();

    await productListPage.selectCategory('Tablets');
    await expect(productListPage.addToCartButtons).toHaveCount(0);
    await expect(productListPage.emptyCategoryMessage).toBeVisible();
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
