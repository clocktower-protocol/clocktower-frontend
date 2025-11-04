import { Page } from '@playwright/test';
import { parseRpcRequest, handleRpcMethod, createRpcResponse } from './rpc-mocks';
import { parseGraphQLRequest, handleGraphQLRequest } from './graphql-mocks';
import { MOCK_ACCOUNT, CHAIN_ID_BASE } from '../helpers/constants';

/**
 * Set up all route interceptors for RPC and GraphQL
 */
export async function setupMockRoutes(page: Page) {
  // Intercept RPC calls (JSON-RPC requests)
  await page.route('**', async (route) => {
    const request = route.request();
    const url = request.url();
    const method = request.method();

    // Only intercept POST requests (RPC and GraphQL are POST)
    if (method !== 'POST') {
      await route.continue();
      return;
    }

    try {
      const postData = request.postData();
      
      // Check if it's a JSON-RPC request
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

      // Check if it's a GraphQL request
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
      // If parsing fails, continue with the request
      console.error('Error parsing request:', error);
    }

    // Continue with original request if not matched
    await route.continue();
  });
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
 * Set up a page with all mocks enabled
 */
export async function setupPageWithMocks(page: Page) {
  await setupMockRoutes(page);
  await mockWalletConnection(page);
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

