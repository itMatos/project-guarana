import { test as base } from '@playwright/test';
import { ApiState, registerApiRoutes } from '../api';

interface Fixtures {
  api: ApiState;
}

export const test = base.extend<Fixtures>({
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

export { expect } from '@playwright/test';
