import { mergeTests } from '@playwright/test';
import { apiTest } from './api.fixture';
import { pagesTest } from './pages.fixture';
import { sessionTest } from './session.fixture';

export const test = mergeTests(apiTest, sessionTest, pagesTest);

export { expect } from '@playwright/test';
