/**
 * Test constants for E2E tests
 * Mock addresses, chain IDs, transaction hashes, etc.
 */

// Mock wallet addresses
export const MOCK_ACCOUNT = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
export const MOCK_PROVIDER = '0x1234567890123456789012345678901234567890';
export const MOCK_SUBSCRIBER = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';

// Chain IDs (Base and Base Sepolia)
export const CHAIN_ID_BASE = 8453;
export const CHAIN_ID_BASE_SEPOLIA = 84532;

// Mock transaction hashes
export const MOCK_TX_HASH = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
export const MOCK_TX_HASH_2 = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';

// Mock block numbers
export const MOCK_BLOCK_NUMBER = BigInt(12345);
export const MOCK_BLOCK_NUMBER_2 = BigInt(12346);

// Mock balances (in wei)
export const MOCK_BALANCE_ETH = '1000000000000000000'; // 1 ETH
export const MOCK_BALANCE_TOKEN = '1000000000000000000000'; // 1000 tokens (assuming 18 decimals)

// Mock signatures
export const MOCK_SIGNATURE = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1b';

// Mock subscription IDs
export const MOCK_SUBSCRIPTION_ID = '0x0000000000000000000000000000000000000000000000000000000000000001';
export const MOCK_SUBSCRIPTION_ID_2 = '0x0000000000000000000000000000000000000000000000000000000000000002';

// Mock token addresses
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
export const MOCK_TOKEN_ADDRESS = '0x1111111111111111111111111111111111111111';

// Mock timestamps
export const MOCK_TIMESTAMP = 1704067200; // 2024-01-01 00:00:00 UTC
export const MOCK_BLOCK_TIMESTAMP = '1704067200';

// RPC method names
export const RPC_METHODS = {
  SEND_TRANSACTION: 'eth_sendTransaction',
  GET_TRANSACTION_RECEIPT: 'eth_getTransactionReceipt',
  CALL: 'eth_call',
  ACCOUNTS: 'eth_accounts',
  REQUEST_ACCOUNTS: 'eth_requestAccounts',
  CHAIN_ID: 'eth_chainId',
  SIGN: 'personal_sign',
  SWITCH_CHAIN: 'wallet_switchEthereumChain',
  GET_BALANCE: 'eth_getBalance',
} as const;

