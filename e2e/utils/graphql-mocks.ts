import {
  MOCK_ACCOUNT,
  MOCK_PROVIDER,
  MOCK_SUBSCRIBER,
  MOCK_SUBSCRIPTION_ID,
  MOCK_TIMESTAMP,
  MOCK_BLOCK_TIMESTAMP,
  MOCK_BLOCK_NUMBER,
  MOCK_TX_HASH,
} from '../helpers/constants';

/**
 * Mock GraphQL response for DetailsLog queries
 */
export function mockDetailsLogResponse(count: number = 1) {
  return {
    data: {
      detailsLogs: Array.from({ length: count }, (_, i) => ({
        internal_id: MOCK_SUBSCRIPTION_ID,
        provider: MOCK_PROVIDER,
        timestamp: (MOCK_TIMESTAMP + i).toString(),
        url: `https://example.com/subscription-${i}`,
        description: `Mock subscription description ${i}`,
        blockNumber: MOCK_BLOCK_NUMBER.toString(),
        blockTimestamp: (MOCK_TIMESTAMP + i).toString(),
        transactionHash: MOCK_TX_HASH,
      })),
    },
  };
}

/**
 * Mock GraphQL response for SubLog queries
 */
export function mockSubLogResponse(count: number = 1) {
  return {
    data: {
      subLogs: Array.from({ length: count }, (_, i) => ({
        id: MOCK_SUBSCRIPTION_ID,
        internal_id: MOCK_SUBSCRIPTION_ID,
        provider: MOCK_PROVIDER,
        subscriber: MOCK_SUBSCRIBER,
        timestamp: (MOCK_TIMESTAMP + i).toString(),
        amount: '1000000000000000000', // 1 token (18 decimals)
        token: '0x1111111111111111111111111111111111111111',
        subScriptEvent: i % 2 === 0 ? '0' : '6', // 0 = provider, 6 = subscriber
        blockNumber: (Number(MOCK_BLOCK_NUMBER) + i).toString(),
        blockTimestamp: (MOCK_TIMESTAMP + i).toString(),
        transactionHash: MOCK_TX_HASH,
      })),
    },
  };
}

/**
 * Mock GraphQL response for CallerLog queries
 */
export function mockCallerLogResponse(count: number = 1) {
  return {
    data: {
      callerLogs: Array.from({ length: count }, (_, i) => ({
        timestamp: (MOCK_TIMESTAMP + i).toString(),
        checkedDay: (i + 1).toString(),
        caller: MOCK_ACCOUNT,
        isFinished: i % 2 === 0,
        blockNumber: (Number(MOCK_BLOCK_NUMBER) + i).toString(),
        blockTimestamp: (MOCK_TIMESTAMP + i).toString(),
        transactionHash: MOCK_TX_HASH,
      })),
    },
  };
}

/**
 * Parse GraphQL request from route
 */
export function parseGraphQLRequest(postData: string | null): {
  query: string;
  variables?: Record<string, any>;
  operationName?: string;
} | null {
  if (!postData) return null;
  try {
    const parsed = JSON.parse(postData);
    return {
      query: parsed.query || '',
      variables: parsed.variables || {},
      operationName: parsed.operationName,
    };
  } catch {
    return null;
  }
}

/**
 * Extract operation name from GraphQL query
 */
export function extractOperationName(query: string): string | null {
  // Try to extract operation name from query
  const operationMatch = query.match(/query\s+(\w+)/);
  if (operationMatch) {
    return operationMatch[1];
  }
  return null;
}

/**
 * Determine GraphQL response based on query content
 */
export function getGraphQLResponse(query: string, variables?: Record<string, any>): any {
  const queryLower = query.toLowerCase();

  // DetailsLog queries
  if (queryLower.includes('detailslogs') || queryLower.includes('detailslog')) {
    const first = variables?.first || 1;
    return mockDetailsLogResponse(first);
  }

  // SubLog queries
  if (queryLower.includes('sublogs') || queryLower.includes('sublog')) {
    // Count based on query structure - if it's a list query, return multiple
    const count = queryLower.includes('where') ? 1 : 10;
    return mockSubLogResponse(count);
  }

  // CallerLog queries
  if (queryLower.includes('callerlogs') || queryLower.includes('callerlog')) {
    return mockCallerLogResponse(10);
  }

  // Default empty response
  return {
    data: {},
  };
}

/**
 * Handle GraphQL request and return appropriate mock response
 */
export function handleGraphQLRequest(
  query: string,
  variables?: Record<string, any>
): any {
  return getGraphQLResponse(query, variables);
}

