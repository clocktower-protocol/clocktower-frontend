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