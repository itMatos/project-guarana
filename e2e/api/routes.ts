import type { Page, Route } from '@playwright/test';
import type { LoginRequest } from '../../src/app/shared/models/auth.model';
import { API } from './endpoints';
import type { ApiState } from './api-state';

const json = (route: Route, status: number, body: unknown) =>
  route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

/**
 * Registra os mocks de rede da página. O Playwright dá prioridade à rota registrada por último,
 * então o catch-all vem primeiro e só responde o que nenhum handler específico atendeu.
 */
export async function registerApiRoutes(page: Page, state: ApiState): Promise<void> {
  await page.route(API.any, (route) => {
    const request = route.request();
    return json(route, 501, { message: `Sem mock para ${request.method()} ${request.url()}` });
  });

  await page.route(API.login, (route) => {
    if (route.request().method() !== 'POST') {
      return route.fallback();
    }
    const { status, body } = state.login(route.request().postDataJSON() as LoginRequest);
    return json(route, status, body);
  });

  await page.route(API.products, (route) => {
    if (route.request().method() !== 'GET') {
      return route.fallback();
    }
    const { status, body } = state.listProducts(route.request().headers()['authorization']);
    return json(route, status, body);
  });
}
