# E2E Testing with Playwright

This directory contains end-to-end tests for the Clocktower Frontend application using Playwright with network interception to mock blockchain transactions and GraphQL queries.

## Setup

1. Install Playwright browsers (run once):
   ```bash
   npx playwright install --with-deps
   ```

2. Ensure the dev server is running (or let Playwright start it automatically):
   ```bash
   npm run start
   ```

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI mode (interactive)
npm run test:e2e:ui

# Run tests in debug mode
npm run test:e2e:debug

# Run tests in headed mode (see browser)
npm run test:e2e:headed
```

## Test Structure

- `e2e/utils/` - Utility functions for mocking RPC and GraphQL
- `e2e/fixtures/` - Playwright fixtures for authenticated sessions
- `e2e/helpers/` - Test constants and shared data
- `e2e/*.spec.ts` - Test files

## How Mocking Works

### RPC Mocking
All Ethereum RPC calls are intercepted and mocked:
- `eth_sendTransaction` → Returns mock transaction hash immediately
- `eth_getTransactionReceipt` → Returns mock successful receipt
- `eth_accounts` / `eth_requestAccounts` → Returns mock account
- `eth_chainId` → Returns mock chain ID
- `wallet_switchEthereumChain` → Returns success
- `personal_sign` → Returns mock signature
- `eth_getBalance` → Returns mock balance
- `eth_call` → Returns mock contract call result

### GraphQL Mocking
All GraphQL queries to the subgraph are intercepted:
- `detailsLogs` queries → Returns mock DetailsLog data
- `subLogs` queries → Returns mock SubLog data
- `callerLogs` queries → Returns mock CallerLog data

### Benefits
- ✅ No real blockchain transactions
- ✅ No gas fees
- ✅ Fast test execution (no waiting for confirmations)
- ✅ Deterministic test results
- ✅ Can test error scenarios easily
- ✅ Works offline

## Writing New Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { setupPageWithMocks } from './utils/test-helpers';

test.describe('My Feature', () => {
  test.beforeEach(async ({ page }) => {
    await setupPageWithMocks(page);
  });

  test('should do something', async ({ page }) => {
    await page.goto('/');
    // Your test code here
    expect(page.url()).toContain('/');
  });
});
```

### Using Fixtures

```typescript
import { test, expect } from './fixtures/authenticated';

test('authenticated test', async ({ authenticatedPage, mockAccount }) => {
  // Page already has mocks set up and wallet connected
  await authenticatedPage.goto('/account/' + mockAccount);
  // Test code here
});
```

## Mock Constants

Mock data is defined in `e2e/helpers/constants.ts`:
- `MOCK_ACCOUNT` - Default test wallet address
- `MOCK_TX_HASH` - Default transaction hash
- `CHAIN_ID_BASE` / `CHAIN_ID_BASE_SEPOLIA` - Chain IDs
- And more...

## Troubleshooting

### Tests fail to start
- Ensure dev server is running on port 3000
- Check that Playwright browsers are installed

### Mocking not working
- Verify route interception is set up in `setupMockRoutes`
- Check browser console for network errors
- Ensure test is using `setupPageWithMocks` in `beforeEach`

### UI selectors not found
- Use Playwright's codegen to find selectors: `npx playwright codegen`
- Adjust selectors in test files based on actual UI structure

