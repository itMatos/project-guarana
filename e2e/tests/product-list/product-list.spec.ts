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

test.describe('abas de categoria', () => {
  test.beforeEach(({ api }) => {
    api.setProducts([
      aProduct().withId(1).withName('Celular A').withCategory('celulares').build(),
      aProduct().withId(2).withName('Celular B').withCategory('celulares').build(),
      aProduct().withId(3).withName('Notebook A').withCategory('notebooks').build(),
      aProduct().withId(4).withName('Tablet A').withCategory('tablets').build()
    ]);
  });

  test('abre em Celulares e mostra só os celulares', async ({ productListPage }) => {
    await productListPage.goto();

    await expect(productListPage.categoryTab('Celulares')).toHaveAttribute('aria-selected', 'true');
    await expect(productListPage.categoryTab('Celulares')).toContainText('(2)');
    await expect(productListPage.categoryTab('Notebooks')).toContainText('(1)');
    await expect(productListPage.categoryTab('Tablets')).toContainText('(1)');

    await expect(productListPage.addToCartButtons).toHaveCount(2);
    await expect(productListPage.product('Celular A')).toBeVisible();
    await expect(productListPage.product('Notebook A')).toBeHidden();
  });

  test('troca de aba filtra os produtos e atualiza a URL', async ({ page, productListPage }) => {
    await productListPage.goto();
    await expect(productListPage.addToCartButtons).toHaveCount(2);

    await productListPage.selectCategory('Notebooks');

    await expect(page).toHaveURL(/categoria=notebooks/);
    await expect(productListPage.addToCartButtons).toHaveCount(1);
    await expect(productListPage.product('Notebook A')).toBeVisible();
    await expect(productListPage.product('Celular A')).toBeHidden();

    await productListPage.selectCategory('Tablets');

    await expect(page).toHaveURL(/categoria=tablets/);
    await expect(productListPage.product('Tablet A')).toBeVisible();
  });

  test('abre direto na categoria indicada pela URL', async ({ productListPage }) => {
    await productListPage.goto('tablets');

    await expect(productListPage.categoryTab('Tablets')).toHaveAttribute('aria-selected', 'true');
    await expect(productListPage.addToCartButtons).toHaveCount(1);
    await expect(productListPage.product('Tablet A')).toBeVisible();
  });

  test('mostra aviso quando a categoria não tem produtos', async ({ api, productListPage }) => {
    api.setProducts([aProduct().withId(1).withName('Celular A').withCategory('celulares').build()]);

    await productListPage.goto();
    await expect(productListPage.addToCartButtons).toHaveCount(1);

    await productListPage.selectCategory('Notebooks');

    await expect(productListPage.addToCartButtons).toHaveCount(0);
    await expect(productListPage.emptyCategoryMessage('Notebooks')).toBeVisible();
  });
});
