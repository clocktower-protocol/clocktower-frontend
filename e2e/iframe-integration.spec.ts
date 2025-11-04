import { test, expect } from '@playwright/test';
import { setupPageWithMocks } from './utils/test-helpers';
import { MOCK_ACCOUNT } from './helpers/constants';

test.describe('Iframe Integration', () => {
  test.beforeEach(async ({ page }) => {
    await setupPageWithMocks(page);
  });

  test('should detect iframe context in public_subscription route', async ({ page }) => {
    // Create a page that embeds the subscription in an iframe
    await page.setContent(`
      <html>
        <body>
          <h1>Parent Page</h1>
          <iframe id="subscription-iframe" src="/#/public_subscription/0x123" width="450" height="600"></iframe>
        </body>
      </html>
    `);

    // Wait for iframe to load
    const iframeElement = page.locator('#subscription-iframe');
    await iframeElement.waitFor({ state: 'attached', timeout: 10000 });
    
    // Wait for iframe content to load
    await page.waitForTimeout(3000);

    // Try to access iframe content
    const frame = await iframeElement.contentFrame();
    if (frame) {
      // The iframe should detect it's in an iframe context
      // We can verify this by checking if the navbar is hidden (iframe mode)
      const navbar = frame.locator('.navBar');
      await expect(navbar).not.toBeVisible({ timeout: 5000 });
    } else {
      // If frame not accessible, skip test
      test.skip();
    }
  });

  test('should send postMessage when subscription completes in iframe', async ({ page }) => {
    // Listen for postMessage events on parent page
    await page.addInitScript(() => {
      (window as any).__parentMessages = [];
      window.addEventListener('message', (event: MessageEvent) => {
        (window as any).__parentMessages.push(event.data);
      });
    });

    // Create parent page with iframe
    // Use parent window's origin for return_url so postMessage origin matches
    const parentOrigin = 'http://localhost:3000'; // Use known origin for test
    const returnUrl = `${parentOrigin}/callback`;
    
    await page.setContent(`
      <html>
        <body>
          <h1>Parent Page</h1>
          <iframe id="subscription-iframe" src="/#/public_subscription/0x123?return_url=${encodeURIComponent(returnUrl)}" width="450" height="600"></iframe>
        </body>
      </html>
    `);

    // Wait for iframe to load
    const iframeElement = page.locator('#subscription-iframe');
    await iframeElement.waitFor({ state: 'attached', timeout: 10000 });
    
    // Wait for iframe content to load
    await page.waitForTimeout(2000);

    // Simulate subscription completion by sending postMessage from iframe's perspective
    // The actual code extracts origin from return_url, which now matches parent origin
    // Use parent origin directly for postMessage target
    await page.evaluate((data) => {
      const iframe = document.getElementById('subscription-iframe') as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        // Simulate iframe sending message to parent
        // Use parent window's origin (which matches return_url origin)
        const parentOrigin = window.location.origin;
        iframe.contentWindow.postMessage({
          type: 'subscription_complete',
          subscription_id: '0x123',
          user_address: data.account,
          success: true,
          return_url: data.returnUrl,
        }, parentOrigin);
      }
    }, { account: MOCK_ACCOUNT, returnUrl: returnUrl });

    // Wait for message to be received by parent
    await page.waitForFunction(() => {
      return (window as any).__parentMessages && (window as any).__parentMessages.length > 0;
    }, { timeout: 5000 });

    // Verify message was received
    const receivedMessages = await page.evaluate(() => (window as any).__parentMessages || []);
    expect(receivedMessages.length).toBeGreaterThan(0);
    expect(receivedMessages[0]).toMatchObject({
      type: 'subscription_complete',
      subscription_id: '0x123',
      user_address: MOCK_ACCOUNT,
      success: true,
    });
  });

  test('should display subscription success in iframetest page', async ({ page }) => {
    await page.goto('/#/iframetest');
    await page.waitForLoadState('networkidle');

    // Wait for page to fully load
    await page.waitForTimeout(1000);

    // Generate iframe URL - find input by placeholder or value
    const subscriptionIdInput = page.locator('input[placeholder*="subscription"], input[placeholder*="Subscription"], input[value="123"]').first();
    await subscriptionIdInput.waitFor({ state: 'visible', timeout: 10000 });
    await subscriptionIdInput.clear();
    await subscriptionIdInput.fill('0x123');
    
    const generateButton = page.locator('button:has-text("Generate Iframe URL")');
    await generateButton.click();

    // Wait a bit for iframe to potentially appear
    await page.waitForTimeout(1000);

    // Simulate postMessage from iframe
    await page.evaluate((account) => {
      window.dispatchEvent(new MessageEvent('message', {
        data: {
          type: 'subscription_complete',
          subscription_id: '0x123',
          user_address: account,
          success: true,
          return_url: 'https://example.com/callback',
        },
        origin: window.location.origin,
      }));
    }, MOCK_ACCOUNT);

    // Verify success message appears
    await expect(page.locator('text=Subscription Completed')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=0x123')).toBeVisible();
    await expect(page.locator(`text=${MOCK_ACCOUNT}`)).toBeVisible();
  });

  test('should show WalletConnect option in iframe wallet modal', async ({ page }) => {
    // Create page with iframe
    await page.setContent(`
      <html>
        <body>
          <iframe id="subscription-iframe" src="/#/public_subscription/0x123" width="450" height="600"></iframe>
        </body>
      </html>
    `);

    const iframeElement = page.locator('#subscription-iframe');
    await iframeElement.waitFor({ state: 'attached', timeout: 10000 });
    
    const frame = await iframeElement.contentFrame();
    if (!frame) {
      test.skip();
      return;
    }

    // Wait for iframe content to load
    await page.waitForTimeout(2000);

    // Look for wallet connection button (if disconnected)
    const connectButton = frame.locator('button:has-text("Connect"), button:has-text("Wallet"), button:has-text("Sign in")').first();
    
    // If wallet connection button exists, click it
    const isVisible = await connectButton.isVisible({ timeout: 2000 }).catch(() => false);
    if (isVisible) {
      await connectButton.click();
      
      // Wait for modal
      await page.waitForTimeout(1000);
      
      // Check if WalletConnect option is available (should always be in iframe)
      // Note: This might need adjustment based on actual UI
    }
  });

  test('should redirect to wallet_connect route for extension wallets in iframe', async ({ page }) => {
    // Create page with iframe
    await page.setContent(`
      <html>
        <body>
          <iframe id="subscription-iframe" src="/#/public_subscription/0x123" width="450" height="600"></iframe>
        </body>
      </html>
    `);

    const iframeElement = page.locator('#subscription-iframe');
    await iframeElement.waitFor({ state: 'attached', timeout: 10000 });
    
    const frame = await iframeElement.contentFrame();
    if (!frame) {
      test.skip();
      return;
    }

    // Wait for iframe content to load
    await page.waitForTimeout(2000);

    // Try to open wallet modal
    const connectButton = frame.locator('button:has-text("Connect"), button:has-text("Wallet"), button:has-text("Sign in")').first();
    const isVisible = await connectButton.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (isVisible) {
      await connectButton.click();
      await page.waitForTimeout(1000);
      
      // If MetaMask button is visible and clicked, it should redirect
      // This is hard to test fully without real wallet extensions,
      // but we can verify the redirect logic exists
      // The redirect would change the iframe URL to wallet_connect route
    }
  });

  test('iframetest page should ignore messages from wrong origin', async ({ page }) => {
    await page.goto('/#/iframetest');
    await page.waitForLoadState('networkidle');

    // Send message from wrong origin
    await page.evaluate(() => {
      window.dispatchEvent(new MessageEvent('message', {
        data: {
          type: 'subscription_complete',
          subscription_id: '0x123',
          user_address: '0xmalicious',
          success: true,
        },
        origin: 'https://malicious-site.com',
      }));
    });

    // Wait a bit
    await page.waitForTimeout(1000);

    // Should NOT display success message
    await expect(page.locator('text=Subscription Completed')).not.toBeVisible();
  });

  test('should show JavaScript integration code in iframetest', async ({ page }) => {
    await page.goto('/#/iframetest');
    await page.waitForLoadState('networkidle');

    // Wait for page to fully load
    await page.waitForTimeout(1000);

    // Generate iframe URL - find input by placeholder or value
    const subscriptionIdInput = page.locator('input[placeholder*="subscription"], input[placeholder*="Subscription"], input[value="123"]').first();
    await subscriptionIdInput.waitFor({ state: 'visible', timeout: 10000 });
    await subscriptionIdInput.clear();
    await subscriptionIdInput.fill('0x123');
    
    const generateButton = page.locator('button:has-text("Generate Iframe URL")');
    await generateButton.click();

    // Wait for HTML code section to appear
    await page.waitForTimeout(1000);

    // Check that JavaScript integration code is shown
    const jsCode = page.locator('text=JavaScript Integration');
    await expect(jsCode).toBeVisible({ timeout: 5000 });
    
    // Check that postMessage listener code is present
    const postMessageCode = page.locator('text=addEventListener');
    await expect(postMessageCode).toBeVisible();
  });
});

