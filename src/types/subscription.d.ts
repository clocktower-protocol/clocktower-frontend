export interface SubLog {
    internal_id: string;      // Bytes
    provider: string;         // Bytes (address)
    subscriber: string;       // Bytes (address)
    timestamp: string;        // BigInt
    amount: string;          // BigInt
    token: string;           // Bytes (address)
    subScriptEvent: string;  // String
    blockNumber: string;     // BigInt
    blockTimestamp: string;  // BigInt
    transactionHash: string; // Bytes
}

export interface Subscriber {
    subscriber: `0x${string}`;
    feeBalance: bigint;
}

export interface Subscription {
    id: `0x${string}`;  // bytes32 in Solidity
    amount: bigint;     // uint256 in Solidity
    provider: `0x${string}`;  // address in Solidity
    token: `0x${string}`;     // address in Solidity
    cancelled: boolean;       // bool in Solidity
    frequency: number;        // Frequency enum in Solidity
    dueDay: number;          // uint16 in Solidity
    subscriber?: `0x${string}`; // address (optional)
}

export type SubscriptionResult = [
    `0x${string}`, // id (bytes32)
    bigint,        // amount (uint256)
    `0x${string}`, // provider (address)
    `0x${string}`, // token (address)
    boolean,       // cancelled (bool)
    number,        // frequency (Frequency enum)
    number         // dueDay (uint16)
];

export interface SubscriptionEditParams {
    id: `0x${string}`;  // bytes32 in Solidity
    f: number;          // Frequency enum in Solidity
    d: number;          // uint16 in Solidity
}

export interface SubscriptionEditResult {
    details: Details;    // Changed from string to Details
    id: `0x${string}`;  // bytes32 in Solidity
}

export interface Details {
    url: string;        // string in Solidity
    description: string; // string in Solidity
}

export interface CreateSubscriptionParams {
    amount: bigint;     // uint256 in Solidity
    token: `0x${string}`;     // address in Solidity
    details: Details;   // Details struct in Solidity
    frequency: number;  // Frequency enum in Solidity
    dueDay: number;    // uint16 in Solidity
}

export interface DetailsLog {
    internal_id: string;    // bytes32 in Solidity
    provider: string;       // address in Solidity
    timestamp: string;      // uint256 in Solidity
    url: string;           // string in Solidity
    description: string;    // string in Solidity
    blockNumber: string;    // uint256 in Solidity
    blockTimestamp: string; // uint256 in Solidity
    transactionHash: string; // bytes32 in Solidity
}

export interface FormattedSubscription {
    subscription: Subscription;
    status: number;         // Status enum in Solidity
    totalSubscribers: number; // uint256 in Solidity
}

export interface SubView {
    subscription: Subscription;
    status: number;
    totalSubscribers?: number;
}

export interface DetailsLogsQueryResult {
    detailsLogs: DetailsLog[];
}