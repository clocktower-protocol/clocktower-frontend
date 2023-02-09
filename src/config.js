/* global BigInt */
//export const CLOCKTOWER_ADDRESS = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
export const CLOCKTOWERPAY_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
export const CLOCKTOWERSUB_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const CLOCKTOKEN_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export const INFINITE_APPROVAL = BigInt(Math.pow(2,255))

/*
export const EMPTY_PERMIT = {
  owner: "0x0000000000000000000000000000000000000000",
  spender: "0x0000000000000000000000000000000000000000",
  value: "20000000000000000000000000000000000000",
  deadline: 1766556423,
  v: 0,
  r: (1).toString(16),
  s: (1).toString(16)
}
*/

export const TOKEN_LOOKUP = [
  {
    address: "0x0000000000000000000000000000000000000000",
    ticker: "ETH",
    ABI: ""
  },
  {
    address: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
    ticker: "CLOCK",
    ABI: [
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "initialSupply",
            "type": "uint256"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "Approval",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "Transfer",
        "type": "event"
      },
      {
        "inputs": [],
        "name": "DOMAIN_SEPARATOR",
        "outputs": [
          {
            "internalType": "bytes32",
            "name": "",
            "type": "bytes32"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          }
        ],
        "name": "allowance",
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
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "approve",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "balanceOf",
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
        "inputs": [],
        "name": "decimals",
        "outputs": [
          {
            "internalType": "uint8",
            "name": "",
            "type": "uint8"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "subtractedValue",
            "type": "uint256"
          }
        ],
        "name": "decreaseAllowance",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "addedValue",
            "type": "uint256"
          }
        ],
        "name": "increaseAllowance",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "name",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          }
        ],
        "name": "nonces",
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
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "deadline",
            "type": "uint256"
          },
          {
            "internalType": "uint8",
            "name": "v",
            "type": "uint8"
          },
          {
            "internalType": "bytes32",
            "name": "r",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "s",
            "type": "bytes32"
          }
        ],
        "name": "permit",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "symbol",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "totalSupply",
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
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "transfer",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "transferFrom",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ] 
  }

];

//lookup table for frequency
export const FREQUENCY_LOOKUP = [
  {
    index: 0,
    name: "Weekly"
  },
  {
    index: 1,
    name: "Monthly"
  },
  {
    index: 2,
    name: "Quarterly"
  },
  {
    index: 3,
    name: "Yearly"
  }
]

//lookup table for dueDay
export const DUEDAY_RANGE = [
  {
    frequency: 0,
    start: 1,
    stop: 7
  }, 
  {
    frequency: 1,
    start: 1,
    stop: 28
  },
  {
    frequency: 2,
    start: 1,
    stop: 90
  },
  {
    frequency: 3,
    start: 1,
    stop: 365
  }
]

//lookup for SubEvent
export const SUBEVENT_LOOKUP = [
 "Paid", "Failed", "Subscribed", "Unsubscribed", "FeeFill"
]

//lookup for ProvEvent
export const PROVEVENT_LOOKUP = [
  "Create", "Cancel", "Paid", "Fail"
]

export const CLOCKTOKEN_ABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "initialSupply",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "DOMAIN_SEPARATOR",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      }
    ],
    "name": "allowance",
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
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "balanceOf",
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
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "subtractedValue",
        "type": "uint256"
      }
    ],
    "name": "decreaseAllowance",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "addedValue",
        "type": "uint256"
      }
    ],
    "name": "increaseAllowance",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "nonces",
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
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "deadline",
        "type": "uint256"
      },
      {
        "internalType": "uint8",
        "name": "v",
        "type": "uint8"
      },
      {
        "internalType": "bytes32",
        "name": "r",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "s",
        "type": "bytes32"
      }
    ],
    "name": "permit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
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
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]


/*
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
    "name": "StatusEmit",
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
          },
          {
            "internalType": "address",
            "name": "token",
            "type": "address"
          }
        ],
        "internalType": "struct Clocktower.Batch[]",
        "name": "batch",
        "type": "tuple[]"
      }
    ],
    "name": "addBatchTransactions",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "erc20Contract",
        "type": "address"
      }
    ],
    "name": "addERC20Contract",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
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
      },
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "components": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "deadline",
            "type": "uint256"
          },
          {
            "internalType": "uint8",
            "name": "v",
            "type": "uint8"
          },
          {
            "internalType": "bytes32",
            "name": "r",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "s",
            "type": "bytes32"
          }
        ],
        "internalType": "struct Clocktower.Permit",
        "name": "permit",
        "type": "tuple"
      }
    ],
    "name": "addPermitTransaction",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
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
      },
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      }
    ],
    "name": "addTransaction",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "allAccounts",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "accountAddress",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "exists",
            "type": "bool"
          },
          {
            "internalType": "uint40[]",
            "name": "timeTriggers",
            "type": "uint40[]"
          }
        ],
        "internalType": "struct Clocktower.Account[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "allTransactions",
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
            "internalType": "address",
            "name": "token",
            "type": "address"
          },
          {
            "internalType": "uint40",
            "name": "timeTrigger",
            "type": "uint40"
          },
          {
            "internalType": "enum Clocktower.Status",
            "name": "status",
            "type": "uint8"
          },
          {
            "internalType": "uint256",
            "name": "payload",
            "type": "uint256"
          }
        ],
        "internalType": "struct Clocktower.Transaction[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
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
        "name": "unixTrigger",
        "type": "uint40"
      },
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      }
    ],
    "name": "cancelTransaction",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newAddress",
        "type": "address"
      }
    ],
    "name": "changeAdmin",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_fee",
        "type": "uint256"
      }
    ],
    "name": "changeFee",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_fixed_fee",
        "type": "uint256"
      }
    ],
    "name": "changeFixedFee",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "checkTime",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
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
            "internalType": "address",
            "name": "token",
            "type": "address"
          },
          {
            "internalType": "uint40",
            "name": "timeTrigger",
            "type": "uint40"
          },
          {
            "internalType": "enum Clocktower.Status",
            "name": "status",
            "type": "uint8"
          },
          {
            "internalType": "uint256",
            "name": "payload",
            "type": "uint256"
          }
        ],
        "internalType": "struct Clocktower.Transaction[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getFee",
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
        "internalType": "address",
        "name": "token",
        "type": "address"
      }
    ],
    "name": "getTotalClaims",
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
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "getTransactionsByAccount",
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
            "internalType": "address",
            "name": "token",
            "type": "address"
          },
          {
            "internalType": "uint40",
            "name": "timeTrigger",
            "type": "uint40"
          },
          {
            "internalType": "enum Clocktower.Status",
            "name": "status",
            "type": "uint8"
          },
          {
            "internalType": "uint256",
            "name": "payload",
            "type": "uint256"
          }
        ],
        "internalType": "struct Clocktower.Transaction[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "erc20Contract",
        "type": "address"
      }
    ],
    "name": "removeERC20Contract",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "sendTime",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "toggleContractActive",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
]
*/

export const CLOCKTOWERPAY_ABI = [
  {
    "inputs": [],
    "stateMutability": "payable",
    "type": "constructor"
  },
  {
    "stateMutability": "payable",
    "type": "fallback"
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
          },
          {
            "internalType": "address",
            "name": "token",
            "type": "address"
          }
        ],
        "internalType": "struct ClockTowerPayment.Batch[]",
        "name": "batch",
        "type": "tuple[]"
      }
    ],
    "name": "addBatchPayments",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "erc20Contract",
        "type": "address"
      }
    ],
    "name": "addERC20Contract",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
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
      },
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      }
    ],
    "name": "addPayment",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
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
      },
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "components": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "deadline",
            "type": "uint256"
          },
          {
            "internalType": "uint8",
            "name": "v",
            "type": "uint8"
          },
          {
            "internalType": "bytes32",
            "name": "r",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "s",
            "type": "bytes32"
          }
        ],
        "internalType": "struct ClockTowerPayment.Permit",
        "name": "permit",
        "type": "tuple"
      }
    ],
    "name": "addPermitPayment",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "allAccounts",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "accountAddress",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "exists",
            "type": "bool"
          },
          {
            "internalType": "uint40[]",
            "name": "timeTriggers",
            "type": "uint40[]"
          },
          {
            "components": [
              {
                "internalType": "bytes32",
                "name": "id",
                "type": "bytes32"
              },
              {
                "internalType": "uint40",
                "name": "dueDay",
                "type": "uint40"
              },
              {
                "internalType": "enum ClockTowerPayment.SubType",
                "name": "subType",
                "type": "uint8"
              }
            ],
            "internalType": "struct ClockTowerPayment.SubIndex[]",
            "name": "subscriptions",
            "type": "tuple[]"
          }
        ],
        "internalType": "struct ClockTowerPayment.Account[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "allTransactions",
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
            "internalType": "address",
            "name": "token",
            "type": "address"
          },
          {
            "internalType": "uint40",
            "name": "timeTrigger",
            "type": "uint40"
          },
          {
            "internalType": "enum ClockTowerPayment.Status",
            "name": "status",
            "type": "uint8"
          },
          {
            "internalType": "uint256",
            "name": "payload",
            "type": "uint256"
          }
        ],
        "internalType": "struct ClockTowerPayment.Transaction[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
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
        "name": "unixTrigger",
        "type": "uint40"
      },
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      }
    ],
    "name": "cancelTransaction",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newAddress",
        "type": "address"
      }
    ],
    "name": "changeAdmin",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_fee",
        "type": "uint256"
      }
    ],
    "name": "changeFee",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_fixed_fee",
        "type": "uint256"
      }
    ],
    "name": "changeFixedFee",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "checkPayments",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAccountPayments",
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
            "internalType": "address",
            "name": "token",
            "type": "address"
          },
          {
            "internalType": "uint40",
            "name": "timeTrigger",
            "type": "uint40"
          },
          {
            "internalType": "enum ClockTowerPayment.Status",
            "name": "status",
            "type": "uint8"
          },
          {
            "internalType": "uint256",
            "name": "payload",
            "type": "uint256"
          }
        ],
        "internalType": "struct ClockTowerPayment.Transaction[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getFee",
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
        "internalType": "address",
        "name": "token",
        "type": "address"
      }
    ],
    "name": "getTotalClaims",
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
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "getTransactionsByAccount",
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
            "internalType": "address",
            "name": "token",
            "type": "address"
          },
          {
            "internalType": "uint40",
            "name": "timeTrigger",
            "type": "uint40"
          },
          {
            "internalType": "enum ClockTowerPayment.Status",
            "name": "status",
            "type": "uint8"
          },
          {
            "internalType": "uint256",
            "name": "payload",
            "type": "uint256"
          }
        ],
        "internalType": "struct ClockTowerPayment.Transaction[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "erc20Contract",
        "type": "address"
      }
    ],
    "name": "removeERC20Contract",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "sendPayments",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "toggleContractActive",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
]


export const CLOCKTOWERSUB_ABI = [
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
        "internalType": "uint40",
        "name": "timestamp",
        "type": "uint40"
      },
      {
        "indexed": false,
        "internalType": "uint40",
        "name": "checkedDay",
        "type": "uint40"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "caller",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "isFinished",
        "type": "bool"
      }
    ],
    "name": "CallerLog",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "id",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "provider",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint40",
        "name": "timestamp",
        "type": "uint40"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "success",
        "type": "bool"
      },
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "errorCode",
        "type": "uint8"
      }
    ],
    "name": "ProviderLog",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "id",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "subscriber",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint40",
        "name": "timestamp",
        "type": "uint40"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "enum ClockTowerSubscribe.SubEvent",
        "name": "subEvent",
        "type": "uint8"
      }
    ],
    "name": "SubscriberLog",
    "type": "event"
  },
  {
    "stateMutability": "payable",
    "type": "fallback"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "erc20Contract",
        "type": "address"
      }
    ],
    "name": "addERC20Contract",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "id",
            "type": "bytes32"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "provider",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "token",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "exists",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "cancelled",
            "type": "bool"
          },
          {
            "internalType": "enum ClockTowerSubscribe.Frequency",
            "name": "frequency",
            "type": "uint8"
          },
          {
            "internalType": "uint16",
            "name": "dueDay",
            "type": "uint16"
          },
          {
            "internalType": "string",
            "name": "description",
            "type": "string"
          }
        ],
        "internalType": "struct ClockTowerSubscribe.Subscription",
        "name": "subscription",
        "type": "tuple"
      }
    ],
    "name": "cancelSubscription",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newAddress",
        "type": "address"
      }
    ],
    "name": "changeAdmin",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_fee",
        "type": "uint256"
      }
    ],
    "name": "changeFee",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_fixed_fee",
        "type": "uint256"
      }
    ],
    "name": "changeFixedFee",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_maxGas",
        "type": "uint256"
      }
    ],
    "name": "changeMaxGasPrice",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_maxRemits",
        "type": "uint256"
      }
    ],
    "name": "changeMaxRemits",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "enum ClockTowerSubscribe.Frequency",
        "name": "frequency",
        "type": "uint8"
      },
      {
        "internalType": "uint16",
        "name": "dueDay",
        "type": "uint16"
      }
    ],
    "name": "createSubscription",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "feeEstimate",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "fee",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "token",
            "type": "address"
          }
        ],
        "internalType": "struct ClockTowerSubscribe.FeeEstimate[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bool",
        "name": "bySubscriber",
        "type": "bool"
      }
    ],
    "name": "getAccountSubscriptions",
    "outputs": [
      {
        "components": [
          {
            "components": [
              {
                "internalType": "bytes32",
                "name": "id",
                "type": "bytes32"
              },
              {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
              },
              {
                "internalType": "address",
                "name": "provider",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "token",
                "type": "address"
              },
              {
                "internalType": "bool",
                "name": "exists",
                "type": "bool"
              },
              {
                "internalType": "bool",
                "name": "cancelled",
                "type": "bool"
              },
              {
                "internalType": "enum ClockTowerSubscribe.Frequency",
                "name": "frequency",
                "type": "uint8"
              },
              {
                "internalType": "uint16",
                "name": "dueDay",
                "type": "uint16"
              },
              {
                "internalType": "string",
                "name": "description",
                "type": "string"
              }
            ],
            "internalType": "struct ClockTowerSubscribe.Subscription",
            "name": "subscription",
            "type": "tuple"
          },
          {
            "internalType": "enum ClockTowerSubscribe.Status",
            "name": "status",
            "type": "uint8"
          },
          {
            "internalType": "uint256",
            "name": "totalSubscribers",
            "type": "uint256"
          }
        ],
        "internalType": "struct ClockTowerSubscribe.SubView[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllAccounts",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "accountAddress",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "exists",
            "type": "bool"
          },
          {
            "internalType": "uint40[]",
            "name": "timeTriggers",
            "type": "uint40[]"
          },
          {
            "components": [
              {
                "internalType": "bytes32",
                "name": "id",
                "type": "bytes32"
              },
              {
                "internalType": "uint16",
                "name": "dueDay",
                "type": "uint16"
              },
              {
                "internalType": "enum ClockTowerSubscribe.Frequency",
                "name": "frequency",
                "type": "uint8"
              },
              {
                "internalType": "enum ClockTowerSubscribe.Status",
                "name": "status",
                "type": "uint8"
              }
            ],
            "internalType": "struct ClockTowerSubscribe.SubIndex[]",
            "name": "subscriptions",
            "type": "tuple[]"
          },
          {
            "components": [
              {
                "internalType": "bytes32",
                "name": "id",
                "type": "bytes32"
              },
              {
                "internalType": "uint16",
                "name": "dueDay",
                "type": "uint16"
              },
              {
                "internalType": "enum ClockTowerSubscribe.Frequency",
                "name": "frequency",
                "type": "uint8"
              },
              {
                "internalType": "enum ClockTowerSubscribe.Status",
                "name": "status",
                "type": "uint8"
              }
            ],
            "internalType": "struct ClockTowerSubscribe.SubIndex[]",
            "name": "provSubs",
            "type": "tuple[]"
          }
        ],
        "internalType": "struct ClockTowerSubscribe.Account[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getFee",
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
        "internalType": "bytes32",
        "name": "id",
        "type": "bytes32"
      },
      {
        "internalType": "enum ClockTowerSubscribe.Frequency",
        "name": "frequency",
        "type": "uint8"
      },
      {
        "internalType": "uint16",
        "name": "dueDay",
        "type": "uint16"
      }
    ],
    "name": "getSubByIndex",
    "outputs": [
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "id",
            "type": "bytes32"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "provider",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "token",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "exists",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "cancelled",
            "type": "bool"
          },
          {
            "internalType": "enum ClockTowerSubscribe.Frequency",
            "name": "frequency",
            "type": "uint8"
          },
          {
            "internalType": "uint16",
            "name": "dueDay",
            "type": "uint16"
          },
          {
            "internalType": "string",
            "name": "description",
            "type": "string"
          }
        ],
        "internalType": "struct ClockTowerSubscribe.Subscription",
        "name": "subscription",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "id",
        "type": "bytes32"
      }
    ],
    "name": "getSubscribers",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "remit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "erc20Contract",
        "type": "address"
      }
    ],
    "name": "removeERC20Contract",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "id",
            "type": "bytes32"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "provider",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "token",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "exists",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "cancelled",
            "type": "bool"
          },
          {
            "internalType": "enum ClockTowerSubscribe.Frequency",
            "name": "frequency",
            "type": "uint8"
          },
          {
            "internalType": "uint16",
            "name": "dueDay",
            "type": "uint16"
          },
          {
            "internalType": "string",
            "name": "description",
            "type": "string"
          }
        ],
        "internalType": "struct ClockTowerSubscribe.Subscription",
        "name": "subscription",
        "type": "tuple"
      }
    ],
    "name": "subscribe",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "toggleContractActive",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "unix",
        "type": "uint256"
      }
    ],
    "name": "unixToTime",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint16",
            "name": "day",
            "type": "uint16"
          },
          {
            "internalType": "uint16",
            "name": "weekDay",
            "type": "uint16"
          },
          {
            "internalType": "uint16",
            "name": "quarterDay",
            "type": "uint16"
          },
          {
            "internalType": "uint16",
            "name": "yearDay",
            "type": "uint16"
          }
        ],
        "internalType": "struct ClockTowerSubscribe.Time",
        "name": "time",
        "type": "tuple"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "id",
            "type": "bytes32"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "provider",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "token",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "exists",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "cancelled",
            "type": "bool"
          },
          {
            "internalType": "enum ClockTowerSubscribe.Frequency",
            "name": "frequency",
            "type": "uint8"
          },
          {
            "internalType": "uint16",
            "name": "dueDay",
            "type": "uint16"
          },
          {
            "internalType": "string",
            "name": "description",
            "type": "string"
          }
        ],
        "internalType": "struct ClockTowerSubscribe.Subscription",
        "name": "subscription",
        "type": "tuple"
      }
    ],
    "name": "unsubscribe",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "id",
            "type": "bytes32"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "provider",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "token",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "exists",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "cancelled",
            "type": "bool"
          },
          {
            "internalType": "enum ClockTowerSubscribe.Frequency",
            "name": "frequency",
            "type": "uint8"
          },
          {
            "internalType": "uint16",
            "name": "dueDay",
            "type": "uint16"
          },
          {
            "internalType": "string",
            "name": "description",
            "type": "string"
          }
        ],
        "internalType": "struct ClockTowerSubscribe.Subscription",
        "name": "subscription",
        "type": "tuple"
      },
      {
        "internalType": "address",
        "name": "subscriber",
        "type": "address"
      }
    ],
    "name": "unsubscribeByProvider",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
]


export const FEE = 1.1;