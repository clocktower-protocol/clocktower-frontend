export const CLOCKTOWER_ADDRESS = '0x5fbdb2315678afecb367f032d93f642f64180aa3';

export const CLOCKTOWER_ABI = [
  {
    "inputs": [],
    "stateMutability": "payable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "output4",
        "type": "string"
      }
    ],
    "name": "AccountCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "output2",
        "type": "string"
      }
    ],
    "name": "CheckStatus",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "bool",
        "name": "houseSent",
        "type": "bool"
      }
    ],
    "name": "HoursCalc",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "ReceiveETH",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "output",
        "type": "string"
      }
    ],
    "name": "Status",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint40",
        "name": "timeTrigger",
        "type": "uint40"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "payload",
        "type": "uint256"
      }
    ],
    "name": "TransactionAdd",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "bool",
        "name": "sent",
        "type": "bool"
      }
    ],
    "name": "TransactionSent",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "output3",
        "type": "string"
      }
    ],
    "name": "UnknownFunction",
    "type": "event"
  },
  {
    "stateMutability": "payable",
    "type": "fallback"
  },
  {
    "inputs": [
      {
        "internalType": "address payable",
        "name": "receiver",
        "type": "address"
      },
      {
        "internalType": "uint40",
        "name": "unixTime",
        "type": "uint40"
      },
      {
        "internalType": "uint256",
        "name": "payload",
        "type": "uint256"
      }
    ],
    "name": "addTransaction",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "address payable",
            "name": "receiver",
            "type": "address"
          },
          {
            "internalType": "uint40",
            "name": "unixTime",
            "type": "uint40"
          },
          {
            "internalType": "uint256",
            "name": "payload",
            "type": "uint256"
          }
        ],
        "internalType": "struct Clocktower.Batch[]",
        "name": "batch",
        "type": "tuple[]"
      }
    ],
    "name": "batchAddTransactions",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "id",
        "type": "bytes32"
      },
      {
        "internalType": "uint40",
        "name": "timeTrigger",
        "type": "uint40"
      }
    ],
    "name": "cancelTransaction",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "checkTime",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAccountTransactions",
    "outputs": [
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "id",
            "type": "bytes32"
          },
          {
            "internalType": "address",
            "name": "sender",
            "type": "address"
          },
          {
            "internalType": "address payable",
            "name": "receiver",
            "type": "address"
          },
          {
            "internalType": "uint40",
            "name": "timeTrigger",
            "type": "uint40"
          },
          {
            "internalType": "bool",
            "name": "sent",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "cancelled",
            "type": "bool"
          },
          {
            "internalType": "uint256",
            "name": "payload",
            "type": "uint256"
          }
        ],
        "internalType": "struct Clocktower.Transaction[]",
        "name": "transactions",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTime",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint40",
        "name": "unixTime",
        "type": "uint40"
      }
    ],
    "name": "hoursSinceMerge",
    "outputs": [
      {
        "internalType": "uint40",
        "name": "hourCount",
        "type": "uint40"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
]

  
export const FEE = 1.1;