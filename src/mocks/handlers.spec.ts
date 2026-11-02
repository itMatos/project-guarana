import { getResponse } from 'msw';
import { environment } from '../environments/environment';
import { handlers } from './handlers';

const login = (body: object) =>
  getResponse(
    handlers,
    new Request(`${location.origin}${environment.apiEndpoints.auth.login}`, { method: 'POST', body: JSON.stringify(body) }),
  );

const products = (token?: string) =>
  getResponse(
    handlers,
    new Request(`${location.origin}${environment.apiEndpoints.product.products}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),
  );

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
      username: 'standard_user',
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
});
