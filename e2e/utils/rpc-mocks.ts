import {
  MOCK_ACCOUNT,
  MOCK_TX_HASH,
  MOCK_BLOCK_NUMBER,
  CHAIN_ID_BASE,
  MOCK_BALANCE_ETH,
  MOCK_SIGNATURE,
  RPC_METHODS,
} from '../helpers/constants';

/**
 * Generate a mock transaction hash
 */
export function mockTransactionHash(): string {
  return MOCK_TX_HASH;
}

/**
 * Generate a mock transaction receipt
 */
export function mockTransactionReceipt(
  hash: string = MOCK_TX_HASH,
  status: 'success' | 'failure' = 'success',
  blockNumber: bigint = MOCK_BLOCK_NUMBER,
  confirmations: number = 2
) {
  return {
    transactionHash: hash,
    status,
    blockNumber: `0x${blockNumber.toString(16)}`,
    blockHash: `0x${blockNumber.toString(16).padStart(64, '0')}`,
    transactionIndex: '0x0',
    from: MOCK_ACCOUNT,
    to: '0x0000000000000000000000000000000000000000',
    gasUsed: '0x5208',
    effectiveGasPrice: '0x3b9aca00',
    cumulativeGasUsed: '0x5208',
    logs: [],
    logsBloom: '0x' + '0'.repeat(512),
    confirmations,
  };
}

/**
 * Generate a mock account address
 */
export function mockAccount(): string {
  return MOCK_ACCOUNT;
}

/**
 * Generate a mock chain ID
 */
export function mockChainId(chainId: number = CHAIN_ID_BASE): string {
  return `0x${chainId.toString(16)}`;
}

/**
 * Generate a mock balance
 */
export function mockBalance(balance: string = MOCK_BALANCE_ETH): string {
  // Convert decimal to hex
  return `0x${BigInt(balance).toString(16)}`;
}

/**
 * Generate a mock signature
 */
export function mockSignMessage(): string {
  return MOCK_SIGNATURE;
}

/**
 * Create a JSON-RPC response
 */
export function createRpcResponse(
  id: number | string,
  result: any,
  error?: { code: number; message: string }
) {
  if (error) {
    return {
      jsonrpc: '2.0',
      error,
      id,
    };
  }
  return {
    jsonrpc: '2.0',
    result,
    id,
  };
}

/**
 * Parse RPC request from route
 */
export function parseRpcRequest(postData: string | null): {
  method: string;
  params: any[];
  id: number;
} | null {
  if (!postData) return null;
  try {
    const parsed = JSON.parse(postData);
    return {
      method: parsed.method,
      params: parsed.params || [],
      id: parsed.id,
    };
  } catch {
    return null;
  }
}

/**
 * Handle common RPC methods
 */
export function handleRpcMethod(
  method: string,
  params: any[],
  requestId: number
): any {
  switch (method) {
    case RPC_METHODS.SEND_TRANSACTION:
      return createRpcResponse(requestId, mockTransactionHash());

    case RPC_METHODS.GET_TRANSACTION_RECEIPT:
      return createRpcResponse(requestId, mockTransactionReceipt());

    case RPC_METHODS.ACCOUNTS:
      return createRpcResponse(requestId, [MOCK_ACCOUNT]);

    case RPC_METHODS.REQUEST_ACCOUNTS:
      return createRpcResponse(requestId, [MOCK_ACCOUNT]);

    case RPC_METHODS.CHAIN_ID:
      return createRpcResponse(requestId, mockChainId());

    case RPC_METHODS.GET_BALANCE:
      return createRpcResponse(requestId, mockBalance());

    case RPC_METHODS.SIGN:
      return createRpcResponse(requestId, mockSignMessage());

    case RPC_METHODS.SWITCH_CHAIN:
      return createRpcResponse(requestId, null);

    case RPC_METHODS.CALL:
      // For contract calls, return a default zero value
      return createRpcResponse(requestId, '0x0000000000000000000000000000000000000000000000000000000000000000');

    default:
      return createRpcResponse(
        requestId,
        null,
        { code: -32601, message: `Method not found: ${method}` }
      );
  }
}

