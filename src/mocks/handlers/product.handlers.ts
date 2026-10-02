import { delay, http, HttpResponse } from 'msw';
import { environment } from '../../environments/environment';
import { MOCK_PRODUCTS } from '../data/products';
import { isValidToken } from '../utils/auth-token';

export const productHandlers = [
  http.get(environment.apiEndpoints.product.products, async ({ request }) => {
    await delay(300);

    if (!isValidToken(request.headers.get('Authorization'))) {
      return HttpResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    return HttpResponse.json(MOCK_PRODUCTS);
  }),
];
