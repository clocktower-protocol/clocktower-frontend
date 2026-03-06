import { Page } from '@playwright/test';
import { parseRpcRequest, handleRpcMethod, createRpcResponse } from './rpc-mocks';
import { parseGraphQLRequest, handleGraphQLRequest } from './graphql-mocks';
import { MOCK_ACCOUNT, CHAIN_ID_BASE } from '../helpers/constants';

/** Path the injected mock wallet uses for RPC; route handler fulfills these. */
const E2E_WALLET_RPC_PATH = '/__e2e-wallet-rpc__';

/**
 * Set up all route interceptors for RPC and GraphQL.
 * Wallet RPC from the injected mock (POST to E2E_WALLET_RPC_PATH) is fulfilled here.
 */
export async function setupMockRoutes(page: Page) {
  await page.route('**', async (route) => {
    const request = route.request();
    const method = request.method();

    if (method !== 'POST') {
      await route.continue();
      return;
    }

    try {
      const postData = request.postData();

      const rpcRequest = parseRpcRequest(postData);
      if (rpcRequest) {
        const response = handleRpcMethod(rpcRequest.method, rpcRequest.params, rpcRequest.id);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(response),
        });
        return;
      }

      const graphqlRequest = parseGraphQLRequest(postData);
      if (graphqlRequest && graphqlRequest.query) {
        const response = handleGraphQLRequest(graphqlRequest.query, graphqlRequest.variables);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(response),
        });
        return;
      }
    } catch (error) {
      console.error('Error parsing request:', error);
    }

    await route.continue();
  });
}

/**
 * Injects a mock window.ethereum so the app can connect and send wallet RPC to our route.
 * Call before first navigation. After connect in the UI, wallet RPC goes to E2E_WALLET_RPC_PATH.
 */
export async function injectMockWalletProvider(page: Page) {
  await page.addInitScript((rpcPath: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const rpcUrl = origin + rpcPath;
    const request = async (args: { method: string; params?: unknown[] }) => {
      const id = Math.floor(Math.random() * 1e9);
      const res = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id,
          method: args.method,
          params: args.params ?? [],
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message || 'RPC error');
      return data.result;
    };
    (window as unknown as { ethereum?: { request: typeof request } }).ethereum = { request };
  }, E2E_WALLET_RPC_PATH);
}

/**
 * Mock wallet connection - simulates a connected wallet
 * This is done by mocking the RPC responses for account requests
 */
export async function mockWalletConnection(page: Page, account: string = MOCK_ACCOUNT) {
  // The wallet connection is already mocked via setupMockRoutes
  // This function can be extended to set up specific wallet states
}

/**
 * Mock contract write operation
 * This intercepts the eth_sendTransaction call and returns a mock hash
 */
export async function mockContractWrite(page: Page) {
  // Already handled by setupMockRoutes via eth_sendTransaction
  // This function can be extended for specific write operations
}

/**
 * Wait for transaction confirmation by mocking the receipt
 */
export async function waitForTransactionConfirmation(
  page: Page,
  txHash: string,
  timeout: number = 5000
) {
  // Wait a bit to simulate transaction processing
  await page.waitForTimeout(1000);
  
  // The receipt is already mocked via setupMockRoutes
  // This function can be extended to add delay or verify UI updates
}

/**
 * Set up a page with all mocks enabled.
 * Optionally inject a mock wallet so connectWalletInE2e can simulate connection.
 */
export async function setupPageWithMocks(page: Page, options?: { injectWallet?: boolean }) {
  await setupMockRoutes(page);
  await mockWalletConnection(page);
  if (options?.injectWallet) {
    await injectMockWalletProvider(page);
  }
}

/**
 * Connect the mock wallet in the UI: open wallet modal and click the first connector.
 * Requires injectMockWalletProvider to have been called before the first goto.
 */
export async function connectWalletInE2e(page: Page): Promise<boolean> {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const signInBtn = page.getByRole('button', { name: /sign in/i }).first();
  if (!(await signInBtn.isVisible().catch(() => false))) return false;
  await signInBtn.click();
  await page.waitForTimeout(500);
  const connectorBtn = page.getByRole('button', { name: /metamask|injected|browser/i }).first();
  if (!(await connectorBtn.isVisible().catch(() => false))) return false;
  await connectorBtn.click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  return true;
}

/**
 * Navigate to a route and wait for it to load
 */
export async function navigateToRoute(page: Page, route: string) {
  await page.goto(`/#${route}`);
  await page.waitForLoadState('networkidle');
}

/**
 * Wait for wallet modal to appear
 */
export async function waitForWalletModal(page: Page) {
  // Wait for wallet connection modal to appear
  // This is app-specific - adjust selector based on your UI
  await page.waitForSelector('text=Connect Wallet', { timeout: 5000 }).catch(() => {
    // Modal might have different text, continue anyway
  });
}

/**
 * Mock a successful transaction flow
 */
export async function mockSuccessfulTransaction(page: Page) {
  // This is already handled by setupMockRoutes
  // Transaction hash is returned immediately, receipt is available on next call
}

/**
 * Mock chain switching
 */
export async function mockChainSwitch(page: Page, chainId: number = CHAIN_ID_BASE) {
  // Chain switching is mocked via wallet_switchEthereumChain RPC call
  // This function can be extended to verify UI updates
}

/**
 * Get mock account address
 */
export function getMockAccount(): string {
  return MOCK_ACCOUNT;
}

