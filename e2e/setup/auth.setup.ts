import { expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { test } from '../fixtures';
import { SESSION_STORAGE, STORAGE_STATE } from './auth-files';

test.use({ authenticated: false });

test('faz login e salva a sessão', async ({ page, loginPage }) => {
  await loginPage.goto();
  await loginPage.login(process.env['E2E_USER']!, process.env['E2E_PASS']!);
  await expect(page).toHaveURL(/\/store\/products$/);

  mkdirSync(dirname(STORAGE_STATE), { recursive: true });
  await page.context().storageState({ path: STORAGE_STATE });
  const sessionStorage = await page.evaluate(() => JSON.stringify(window.sessionStorage));
  writeFileSync(SESSION_STORAGE, sessionStorage);
});
