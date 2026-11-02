import { delay, http, HttpResponse } from 'msw';
import { environment } from '../../environments/environment';
import { AddCartItemRequest, MAX_QUANTITY_PER_PRODUCT, UpdateCartItemRequest } from '../../app/shared/models/cart.model';
import {
  getMockCart,
  isValidQuantity,
  mockCartQuantity,
  mockProductExists,
  removeMockCartItem,
  setMockCartQuantity
} from '../data/carts';
import { usernameFromToken } from '../utils/auth-token';

const { cart, items } = environment.apiEndpoints.cart;

const unauthorized = () => HttpResponse.json({ message: 'Não autorizado' }, { status: 401 });
const limitReached = () =>
  HttpResponse.json({ message: `Limite de ${MAX_QUANTITY_PER_PRODUCT} unidades por produto` }, { status: 400 });

export const cartHandlers = [
  http.get(cart, async ({ request }) => {
    await delay(300);
    const username = usernameFromToken(request.headers.get('Authorization'));
    if (!username) {
      return unauthorized();
    }
    return HttpResponse.json(getMockCart(username));
  }),

  http.post(items, async ({ request }) => {
    await delay(300);
    const username = usernameFromToken(request.headers.get('Authorization'));
    if (!username) {
      return unauthorized();
    }
    const { productId } = (await request.json()) as AddCartItemRequest;
    if (!mockProductExists(productId)) {
      return HttpResponse.json({ message: 'Produto não encontrado' }, { status: 404 });
    }
    const quantity = mockCartQuantity(username, productId) + 1;
    if (quantity > MAX_QUANTITY_PER_PRODUCT) {
      return limitReached();
    }
    setMockCartQuantity(username, productId, quantity);
    return HttpResponse.json(getMockCart(username));
  }),

  http.put(`${items}/:productId`, async ({ request, params }) => {
    await delay(300);
    const username = usernameFromToken(request.headers.get('Authorization'));
    if (!username) {
      return unauthorized();
    }
    const productId = Number(params['productId']);
    if (!mockCartQuantity(username, productId)) {
      return HttpResponse.json({ message: 'Produto não está no carrinho' }, { status: 404 });
    }
    const { quantity } = (await request.json()) as UpdateCartItemRequest;
    if (!isValidQuantity(quantity)) {
      return quantity > MAX_QUANTITY_PER_PRODUCT
        ? limitReached()
        : HttpResponse.json({ message: 'Quantidade inválida' }, { status: 400 });
    }
    setMockCartQuantity(username, productId, quantity);
    return HttpResponse.json(getMockCart(username));
  }),

  http.delete(`${items}/:productId`, async ({ request, params }) => {
    await delay(300);
    const username = usernameFromToken(request.headers.get('Authorization'));
    if (!username) {
      return unauthorized();
    }
    removeMockCartItem(username, Number(params['productId']));
    return HttpResponse.json(getMockCart(username));
  })
];
