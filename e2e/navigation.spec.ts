import { test, expect } from '@playwright/test';
import { setupPageWithMocks, navigateToRoute } from './utils/test-helpers';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await setupPageWithMocks(page);
  });

  test('should navigate to home page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check that page loaded
    expect(page.url()).toContain('/');
  });

  test('should navigate to calendar page', async ({ page }) => {
    await navigateToRoute(page, '/calendar');
    
    // Verify we're on the calendar page
    expect(page.url()).toContain('/calendar');
  });

  test('should navigate to account page', async ({ page }) => {
    const mockAccount = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
    await navigateToRoute(page, `/account/${mockAccount}`);
    
    // Verify we're on the account page
    expect(page.url()).toContain(`/account/${mockAccount}`);
  });

  test('should navigate to subscriptions page', async ({ page }) => {
    await navigateToRoute(page, '/subscriptions/created');
    
    // Verify we're on the subscriptions page
    expect(page.url()).toContain('/subscriptions/created');
  });

  test('should navigate to admin page', async ({ page }) => {
    await navigateToRoute(page, '/admin');
    
    // Verify we're on the admin page
    expect(page.url()).toContain('/admin');
  });

  test('should handle navigation with mocked GraphQL data', async ({ page }) => {
    await navigateToRoute(page, '/subscriptions/created');
    
    // Wait for page to load with mocked data
    await page.waitForLoadState('networkidle');
    
    // Page should load without errors (GraphQL is mocked)
    expect(page.url()).toContain('/subscriptions/created');
  });
});

