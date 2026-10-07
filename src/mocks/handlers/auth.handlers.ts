import { delay, http, HttpResponse } from 'msw';
import { environment } from '../../environments/environment';
import { LoginRequest } from '../../app/shared/models/auth.model';
import { MOCK_PASSWORD, MOCK_USERNAMES, MOCK_USERS } from '../data/users';
import { createToken } from '../utils/auth-token';

export const authHandlers = [
  http.post(environment.apiEndpoints.auth.login, async ({ request }) => {
    const { username, password } = (await request.json()) as LoginRequest;
    await delay(300);

    if (!username) {
      return HttpResponse.json({ message: 'Usuário é obrigatório' }, { status: 400 });
    }
    if (!password) {
      return HttpResponse.json({ message: 'Senha é obrigatória' }, { status: 400 });
    }
    if (!MOCK_USERNAMES.includes(username) || password !== MOCK_PASSWORD) {
      return HttpResponse.json({ message: 'Usuário e senha não correspondem a nenhum usuário' }, { status: 401 });
    }
    if (username === MOCK_USERS.LOCKED_OUT) {
      return HttpResponse.json({ message: 'O acesso deste usuário foi bloqueado' }, { status: 403 });
    }

    return HttpResponse.json({ token: createToken(username), username });
  })
];
