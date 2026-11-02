import { aProduct } from '../../../src/testing/builders/product.builder';
import { test, expect } from '../../fixtures';

const GALAXY = aProduct().withId(1).withName('Galaxy S25').withPrice(4999).withCategory('celulares').build();
const MACBOOK = aProduct().withId(4).withName('MacBook Air M4').withPrice(10499).withCategory('notebooks').build();
const IPAD = aProduct().withId(7).withName('iPad 11"').withPrice(4299).withCategory('tablets').build();

test.describe('carrinho', () => {
  test.beforeEach(({ api }) => {
    api.setProducts([GALAXY, MACBOOK, IPAD]);
  });

  test('junta produtos de categorias diferentes e soma o total', async ({ page, productListPage, cartPage }) => {
    await productListPage.goto();

    await productListPage.addToCart('Galaxy S25');
    await expect(page.getByText('Galaxy S25 adicionado ao carrinho')).toBeVisible();
    await expect(productListPage.cartBadge).toHaveText('1');
    await productListPage.addToCart('Galaxy S25');
    await expect(productListPage.cartBadge).toHaveText('2');

    await productListPage.selectCategory('Notebooks');
    await productListPage.addToCart('MacBook Air M4');
    await expect(page.getByText('MacBook Air M4 adicionado ao carrinho')).toBeVisible();
    await expect(productListPage.cartBadge).toHaveText('3');

    await productListPage.cartLink.click();
    await expect(page).toHaveURL(/\/store\/cart$/);

    await expect(cartPage.items).toHaveCount(2);
    await expect(cartPage.item('Galaxy S25')).toContainText('Celulares');
    await expect(cartPage.quantity('Galaxy S25')).toHaveText('2');
    await expect(cartPage.item('Galaxy S25')).toContainText('R$9,998.00');
    await expect(cartPage.item('MacBook Air M4')).toContainText('Notebooks');
    await expect(cartPage.quantity('MacBook Air M4')).toHaveText('1');
    await expect(cartPage.total).toContainText('R$20,497.00');
  });

  test('altera a quantidade e remove produtos', async ({ api, cartPage }) => {
    api.setCart([
      { productId: GALAXY.id, quantity: 2 },
      { productId: MACBOOK.id, quantity: 1 }
    ]);
    await cartPage.goto();
    await expect(cartPage.quantity('Galaxy S25')).toHaveText('2');

    await cartPage.decrease('Galaxy S25');
    await expect(cartPage.quantity('Galaxy S25')).toHaveText('1');

    await cartPage.remove('MacBook Air M4');
    await expect(cartPage.items).toHaveCount(1);
    await expect(cartPage.item('Galaxy S25')).toBeVisible();
    await expect(cartPage.total).toContainText('R$4,999.00');
    await expect(cartPage.cartBadge).toHaveText('1');
  });

  test('não passa de 10 unidades por produto', async ({ page, api, productListPage, cartPage }) => {
    api.setCart([{ productId: GALAXY.id, quantity: 10 }]);
    const limitMessage = page.getByText('Limite de 10 unidades por produto');

    await productListPage.goto();
    await expect(productListPage.cartBadge).toHaveText('10');
    await productListPage.addToCart('Galaxy S25');
    await expect(limitMessage).toBeVisible();
    await expect(productListPage.cartBadge).toHaveText('10');

    await cartPage.goto();
    await cartPage.increase('Galaxy S25');
    await expect(limitMessage).toBeVisible();
    await expect(cartPage.quantity('Galaxy S25')).toHaveText('10');
  });

  test('mantém o carrinho ao recarregar a página', async ({ page, api, cartPage }) => {
    api.setCart([{ productId: IPAD.id, quantity: 2 }]);
    await cartPage.goto();
    await expect(cartPage.quantity('iPad 11"')).toHaveText('2');

    await page.reload();

    await expect(cartPage.quantity('iPad 11"')).toHaveText('2');
    await expect(cartPage.cartBadge).toHaveText('2');
  });

  test('avisa e mantém o carrinho quando a API falha', async ({ page, api, cartPage }) => {
    api.setCart([{ productId: GALAXY.id, quantity: 1 }]).failCartUpdatesWith(500);
    await cartPage.goto();
    await expect(cartPage.quantity('Galaxy S25')).toHaveText('1');

    await cartPage.increase('Galaxy S25');

    await expect(page.getByText('Não foi possível atualizar o carrinho. Tente novamente.')).toBeVisible();
    await expect(cartPage.quantity('Galaxy S25')).toHaveText('1');
    await expect(cartPage.total).toContainText('R$4,999.00');
  });

  test('mostra o carrinho vazio com um caminho de volta aos produtos', async ({ page, cartPage }) => {
    await cartPage.goto();

    await expect(cartPage.emptyMessage).toBeVisible();
    await expect(cartPage.cartBadge).toBeHidden();

    await cartPage.backToProductsLink.click();
    await expect(page).toHaveURL(/\/store\/products$/);
  });
});
