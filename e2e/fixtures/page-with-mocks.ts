import { test as base } from '@playwright/test';
import { Page } from '@playwright/test';
import { setupPageWithMocks } from '../utils/test-helpers';

type PageWithMocks = Page;

type CustomFixtures = {
  pageWithMocks: PageWithMocks;
};

export const test = base.extend<CustomFixtures>({
  pageWithMocks: async ({ page }, use) => {
    await setupPageWithMocks(page);
    await use(page);
  },
});

export { expect } from '@playwright/test';

