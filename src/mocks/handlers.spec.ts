import { getResponse } from 'msw';
import { environment } from '../environments/environment';
import { handlers } from './handlers';

const login = (body: object) =>
  getResponse(
    handlers,
    new Request(`${location.origin}${environment.apiEndpoints.auth.login}`, { method: 'POST', body: JSON.stringify(body) })
  );

const products = (token?: string) =>
  getResponse(
    handlers,
    new Request(`${location.origin}${environment.apiEndpoints.product.products}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
  );

const TOKEN = 'mock-token-standard_user';

const cartRequest = (path: string, init: RequestInit = {}, token: string | undefined = TOKEN) =>
  getResponse(
    handlers,
    new Request(`${location.origin}${path}`, {
      ...init,
      headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : {}
    })
  );

const { cart: CART, items: ITEMS } = environment.apiEndpoints.cart;
const addItem = (productId: number, token?: string) =>
  cartRequest(ITEMS, { method: 'POST', body: JSON.stringify({ productId }) }, token);
const setQuantity = (productId: number, quantity: number) =>
  cartRequest(`${ITEMS}/${productId}`, { method: 'PUT', body: JSON.stringify({ quantity }) });
const quantities = async (res: Response | undefined) =>
  ((await res?.json()) as { items: { product: { id: number }; quantity: number }[] }).items.map((item) => [
    item.product.id,
    item.quantity
  ]);

describe('MSW handlers', () => {
  it('requires a username', async () => {
    const res = await login({ username: '', password: 'secret_sauce' });
    expect(res?.status).toBe(400);
  });

  it('requires a password', async () => {
    const res = await login({ username: 'standard_user', password: '' });
    expect(res?.status).toBe(400);
  });

  it('rejects wrong credentials', async () => {
    const res = await login({ username: 'standard_user', password: 'wrong' });
    expect(res?.status).toBe(401);
  });

  it('rejects the locked out user', async () => {
    const res = await login({ username: 'locked_out_user', password: 'secret_sauce' });
    expect(res?.status).toBe(403);
  });

  it('logs in a valid user and returns a token', async () => {
    const res = await login({ username: 'standard_user', password: 'secret_sauce' });
    expect(res?.status).toBe(200);
    expect(await res?.json()).toEqual({
      token: 'mock-token-standard_user',
      username: 'standard_user'
    });
  });

  it('denies products without a token', async () => {
    expect((await products())?.status).toBe(401);
  });

  it('lists 9 products with a valid token', async () => {
    const res = await products('mock-token-standard_user');
    expect(res?.status).toBe(200);
    expect(await res?.json()).toHaveLength(9);
  });

  it('lists 3 products in each category', async () => {
    const list: { category: string }[] = await (await products('mock-token-standard_user'))!.json();
    for (const category of ['celulares', 'notebooks', 'tablets']) {
      expect(list.filter((product) => product.category === category)).toHaveLength(3);
    }
  });

  describe('cart', () => {
    beforeEach(() => localStorage.clear());

    it('denies the cart without a token', async () => {
      expect((await cartRequest(CART, {}, ''))?.status).toBe(401);
    });

    it('starts with an empty cart', async () => {
      expect(await quantities(await cartRequest(CART))).toEqual([]);
    });

    it('adds products from different categories and sums repeated ones', async () => {
      await addItem(1);
      await addItem(4);
      const res = await addItem(1);

      expect(res?.status).toBe(200);
      expect(await quantities(res)).toEqual([
        [1, 2],
        [4, 1]
      ]);
    });

    it('rejects an unknown product', async () => {
      expect((await addItem(999))?.status).toBe(404);
    });

    it('does not go past 10 units of a product', async () => {
      await setQuantityAfterAdding(1, 10);

      const res = await addItem(1);
      expect(res?.status).toBe(400);
      expect(await res?.json()).toEqual({ message: 'Limite de 10 unidades por produto' });
      expect((await setQuantity(1, 11))?.status).toBe(400);
    });

    it('rejects a quantity below one', async () => {
      await addItem(1);
      expect((await setQuantity(1, 0))?.status).toBe(400);
    });

    it('removes a product', async () => {
      await addItem(1);
      await addItem(4);

      const res = await cartRequest(`${ITEMS}/1`, { method: 'DELETE' });
      expect(await quantities(res)).toEqual([[4, 1]]);
    });

    it('saves the cart under the user, so it survives reloads and logout', async () => {
      localStorage.setItem('guarana-mock-carts', JSON.stringify({ someone_else: [{ productId: 7, quantity: 3 }] }));

      await addItem(1);

      expect(JSON.parse(localStorage.getItem('guarana-mock-carts')!)).toEqual({
        someone_else: [{ productId: 7, quantity: 3 }],
        standard_user: [{ productId: 1, quantity: 1 }]
      });
      expect(await quantities(await cartRequest(CART))).toEqual([[1, 1]]);
    });
  });
});

async function setQuantityAfterAdding(productId: number, quantity: number): Promise<void> {
  await addItem(productId);
  await setQuantity(productId, quantity);
}
