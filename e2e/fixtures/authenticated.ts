import { test as base } from '@playwright/test';
import { Page } from '@playwright/test';
import { setupPageWithMocks, mockWalletConnection, getMockAccount } from '../utils/test-helpers';

type AuthenticatedPage = Page;

type CustomFixtures = {
  authenticatedPage: AuthenticatedPage;
  mockAccount: string;
};

export const test = base.extend<CustomFixtures>({
  authenticatedPage: async ({ page }, use) => {
    await setupPageWithMocks(page);
    const mockAccount = getMockAccount();
    await mockWalletConnection(page, mockAccount);
    
    // Navigate to home page first
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await use(page);
  },
  
  mockAccount: async ({ }, use) => {
    const account = getMockAccount();
    await use(account);
  },
});

export { expect } from '@playwright/test';

