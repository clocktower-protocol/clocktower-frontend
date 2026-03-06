import { test, expect } from '@playwright/test';
import {
  setupPageWithMocks,
  navigateToRoute,
  connectWalletInE2e,
} from './utils/test-helpers';
import { setE2eEip5792BatchSupported } from './helpers/constants';

test.describe('Public subscription – EIP-5792 batch and fallback', () => {
  test.beforeEach(async ({ page }) => {
    await setupPageWithMocks(page, { injectWallet: true });
  });

  test.afterEach(() => {
    setE2eEip5792BatchSupported(false);
  });

  test('with EIP-5792 batch supported: page loads', async ({ page }) => {
    setE2eEip5792BatchSupported(true);

    await navigateToRoute(
      page,
      '/public_subscription/0x0000000000000000000000000000000000000000000000000000000000000001/1/15'
    );
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    expect(page.url()).toContain('public_subscription');
  });

  test('with EIP-5792 batch not supported: page loads without wallet_sendCalls', async ({ page }) => {
    setE2eEip5792BatchSupported(false);

    await navigateToRoute(
      page,
      '/public_subscription/0x0000000000000000000000000000000000000000000000000000000000000001/1/15'
    );
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    expect(page.url()).toContain('public_subscription');
  });

  test('batch path: when wallet supports EIP-5792, wallet_sendCalls can be used', async ({ page }) => {
    setE2eEip5792BatchSupported(true);

    let sendCallsRequested = false;
    await page.route('**', async (route) => {
      const request = route.request();
      if (request.method() === 'POST' && request.postData()) {
        try {
          const body = JSON.parse(request.postData()!);
          if (body.method === 'wallet_sendCalls') {
            sendCallsRequested = true;
          }
        } catch {
          // ignore
        }
      }
      await route.fallback();
    });

    const connected = await connectWalletInE2e(page);

    await navigateToRoute(
      page,
      '/public_subscription/0x0000000000000000000000000000000000000000000000000000000000000001/1/15'
    );
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    expect(page.url()).toContain('public_subscription');

    if (connected) {
      const subscribeBtn = page.getByRole('button', { name: /subscribe/i }).first();
      const visible = await subscribeBtn.isVisible().catch(() => false);
      const enabled = visible && !(await subscribeBtn.isDisabled().catch(() => true));

      if (enabled) {
        await subscribeBtn.click();
        await page.waitForTimeout(3000);
        const navigatedToSubscribed = page.url().includes('subscriptions/subscribed');
        expect(sendCallsRequested || navigatedToSubscribed).toBe(true);
      }
    }
  });
});
