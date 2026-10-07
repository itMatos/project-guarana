import { test as baseTest } from '@playwright/test';
import { ApiState } from '../api/api-state';
import { registerApiRoutes } from '../api/routes';

interface ApiFixtures {
  api: ApiState;
}

export const apiTest = baseTest.extend<ApiFixtures>({
  // `auto`: todo teste roda com a rede mockada; sem isso, /api cairia no fallback de SPA do dev server.
  api: [
    async ({ page }, use) => {
      const api = new ApiState({
        username: process.env['E2E_USER'] ?? '',
        password: process.env['E2E_PASS'] ?? '',
      });
      await registerApiRoutes(page, api);
      await use(api);
    },
    { auto: true },
  ],
});
