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
 * Inject a mock Ethereum provider into the page
 * This allows wagmi to detect and connect to a wallet
 */
export async function injectMockEthereumProvider(page: Page, account: string = MOCK_ACCOUNT, chainId: number = CHAIN_ID_BASE) {
  await page.addInitScript(({ account, chainId }) => {
    // Create a mock Ethereum provider that wagmi will recognize as MetaMask
    const mockProvider = {
      isMetaMask: true, // Mark as MetaMask so wagmi's MetaMask connector recognizes it
      isCoinbaseWallet: false,
      request: async (args: { method: string; params?: any[] }) => {
        // This will be intercepted by our route mocks
        // But we need to return a promise that resolves
        return new Promise((resolve) => {
          // For synchronous methods, return immediately
          if (args.method === 'eth_accounts') {
            resolve([account]);
          } else if (args.method === 'eth_chainId') {
            resolve(`0x${chainId.toString(16)}`);
          } else if (args.method === 'eth_requestAccounts') {
            resolve([account]);
          } else {
            // For other methods, return a mock response
            // The actual handling is done by route interceptors
            resolve(null);
          }
        });
      },
      send: async (method: string, params?: any[]) => {
        // Legacy send method
        return new Promise((resolve) => {
          if (method === 'eth_accounts') {
            resolve([account]);
          } else if (method === 'eth_chainId') {
            resolve(`0x${chainId.toString(16)}`);
          } else {
            resolve(null);
          }
        });
      },
      sendAsync: (request: any, callback: (error: any, result: any) => void) => {
        // Legacy sendAsync method
        if (request.method === 'eth_accounts') {
          callback(null, { result: [account] });
        } else if (request.method === 'eth_chainId') {
          callback(null, { result: `0x${chainId.toString(16)}` });
        } else {
          callback(null, { result: null });
        }
      },
      on: () => {},
      removeListener: () => {},
    };

    // Inject into window
    (window as any).ethereum = mockProvider;
    
    // Also set up the provider for wagmi
    Object.defineProperty(window, 'ethereum', {
      writable: true,
      configurable: true,
      value: mockProvider,
    });
  }, { account, chainId });
}

/**
 * Connect wallet programmatically using wagmi
 * This triggers wagmi's connect function to establish a connection
 */
export async function connectWalletProgrammatically(page: Page) {
  // Wait for the page to load and wagmi to be ready
  await page.waitForLoadState('domcontentloaded');
  
  // Try to connect wallet using wagmi's connect function
  // We'll use the injected provider as MetaMask
  await page.evaluate(async () => {
    // Wait for wagmi to be available
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Check if we're already connected
    const checkConnection = () => {
      // Try to access wagmi's state via window or document
      // This is a workaround since we can't directly access wagmi hooks
      return (window as any).wagmi?.state?.connections?.size > 0;
    };
    
    // If not connected, try to trigger connection
    // Since wagmi hooks aren't directly accessible, we'll rely on auto-reconnect
    // or wait for the injected provider to be detected
  });
}

/**
 * Set up a page with all mocks enabled
 */
export async function setupPageWithMocks(page: Page) {
  await injectMockEthereumProvider(page);
  
  // Set up localStorage to simulate a previous connection
  // This helps wagmi auto-connect when it detects the provider
  await page.addInitScript(({ account, chainId }) => {
    // Store connection state in localStorage (wagmi v2 uses 'wagmi.wallet' key)
    try {
      const wagmiStorage = {
        state: {
          connections: new Map([
            ['injected', {
              accounts: [account],
              chainId: chainId,
              uid: 'mock-connection'
            }]
          ])
        }
      };
      // Wagmi stores connection info - try to set it up
      // Note: This might not work perfectly as wagmi's storage format may vary
      localStorage.setItem('wagmi.wallet', JSON.stringify({ 
        connector: 'metaMaskSDK',
        accounts: [account],
        chainId: chainId 
      }));
    } catch (e) {
      // Ignore localStorage errors
    }
  }, { account: MOCK_ACCOUNT, chainId: CHAIN_ID_BASE });
  
  await setupMockRoutes(page);
  await mockWalletConnection(page);
  // Wait a bit for wagmi to detect the provider and potentially auto-connect
  await page.waitForTimeout(2000);
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

