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

export interface DetailsLog {
    internal_id: string;
    provider: string;
    timestamp: string;
    url: string;
    description: string;
    blockNumber: string;
    blockTimestamp: string;
    transactionHash: string;
}

export interface FormattedSubscription {
    subscription: Subscription;
    status: number;
    totalSubscribers: number;
} 