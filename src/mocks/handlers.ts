import { delay, http, HttpResponse } from 'msw';
import { environment } from '../environments/environment';
import { LoginRequest } from '../app/shared/models/auth.model';
import { MOCK_PRODUCTS } from './data/products';
import { MOCK_PASSWORD, MOCK_USERNAMES, MOCK_USERS } from './data/users';

const TOKEN_PREFIX = 'mock-token-';

function isValidToken(authorization: string | null): boolean {
  const token = authorization?.replace('Bearer ', '') ?? '';
  const username = token.startsWith(TOKEN_PREFIX) ? token.slice(TOKEN_PREFIX.length) : '';
  return MOCK_USERNAMES.includes(username) && username !== MOCK_USERS.LOCKED_OUT;
}

export const handlers = [
  http.post(`${environment.apiUrl}/login`, async ({ request }) => {
    const { username, password } = (await request.json()) as LoginRequest;
    await delay(300);

    if (!username) {
      return HttpResponse.json({ message: 'Usuário é obrigatório' }, { status: 400 });
    }
    if (!password) {
      return HttpResponse.json({ message: 'Senha é obrigatória' }, { status: 400 });
    }
    if (!MOCK_USERNAMES.includes(username) || password !== MOCK_PASSWORD) {
      return HttpResponse.json(
        { message: 'Usuário e senha não correspondem a nenhum usuário' },
        { status: 401 },
      );
    }
    if (username === MOCK_USERS.LOCKED_OUT) {
      return HttpResponse.json({ message: 'Este usuário foi bloqueado' }, { status: 403 });
    }

    return HttpResponse.json({ token: `${TOKEN_PREFIX}${username}`, username });
  }),

  http.get(`${environment.apiUrl}/products`, async ({ request }) => {
    await delay(300);

    if (!isValidToken(request.headers.get('Authorization'))) {
      return HttpResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    return HttpResponse.json(MOCK_PRODUCTS);
  }),
];
