import { readFileSync } from 'node:fs';
import { test as baseTest } from '@playwright/test';
import { SESSION_STORAGE } from '../setup/auth-files';

interface SessionFixtures {
  session: void;
}

interface SessionOptions {
  /** `false` para testes que partem deslogados (use com `test.use`). */
  authenticated: boolean;
}

export const sessionTest = baseTest.extend<SessionFixtures & SessionOptions>({
  authenticated: [true, { option: true }],

  session: [
    async ({ context, authenticated }, use) => {
      if (authenticated) {
        const entries = JSON.parse(readFileSync(SESSION_STORAGE, 'utf8')) as Record<string, string>;
        // O script roda a cada carregamento de página. A marca impede que ele recrie a sessão
        // depois que o app a apaga (logout) e o teste recarrega ou navega de novo.
        await context.addInitScript((seed) => {
          if (sessionStorage.getItem('__e2e_seeded')) {
            return;
          }
          sessionStorage.setItem('__e2e_seeded', '1');
          for (const [key, value] of Object.entries(seed)) {
            sessionStorage.setItem(key, value);
          }
        }, entries);
      }
      await use();
    },
    { auto: true },
  ],
});
