//imported svg images
import {ReactComponent as HardhatLogo} from "./images/hardhat.svg"
import {ReactComponent as SepoliaLogo} from "./images/ethereum.svg"
import {ReactComponent as MetamaskLogo} from "./images/metamask.svg"
import {ReactComponent as BraveLogo} from "./images/brave.svg"

/* global BigInt */
export const CLOCKTOWERSUB_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

//export const CLOCKTOKEN_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export const INFINITE_APPROVAL = BigInt(Math.pow(2,255))
export const ADMIN_ACCOUNT = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"

/*This variable determines how public your frontend is. Currently there are four options

LOCAL = You MUST provide your own node whose address must be provided
below in LOCAL_NODE. 

USER_INFURA = User provided Infura account url

USER_ALCHEMY = User provided Alchmey account url

BACKEND = User fully connects to our backend including databases. (Default)

*/

export const USER_LOCALITY = "LOCAL"

export const LOCAL_NODE = ""

export const USER_INFURA_PROVIDER = ""

export const USER_ALCHEMY_PROVIDER = ""


//**************************************************************************** 

export const DOMAIN = "localhost:3000"

export const JWT_SERVER = "https://clocktowerdev.com/api/requesttoken"

export const TOKEN_LOOKUP = [
  {
    address: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    ticker: "CLOCK",
    icon: SepoliaLogo
  }
]

//supported chains (this needs to match the wagmiconfig)
export const CHAIN_LOOKUP = [
  {
    name: "hardhat",
    id: 31337,
    icon: HardhatLogo,
    displayName: "Hardhat Network"
  }, 
  {
    name: "sepolia",
    id: 11155111, 
    icon: SepoliaLogo,
    displayName: "Sepolia Network"
  }
]

//supported Wallets
export const WALLET_LOOKUP = [
  {
    name: "metamask",
    id: "io.metamask",
    icon: MetamaskLogo
  },
  {
    name: "brave wallet",
    id: "com.brave.wallet",
    icon: BraveLogo
  }
]

//lookup table for frequency
export const FREQUENCY_LOOKUP = [
  {
    index: 0,
    name: "Weekly",
    name2: "Week"
  },
  {
    index: 1,
    name: "Monthly",
    name2:"Month"
  },
  {
    index: 2,
    name: "Quarterly",
    name2: "Quarter"
  },
  {
    index: 3,
    name: "Yearly",
    name2: "Year"
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

//lookup for day of week
export const DAY_OF_WEEK_LOOKUP = [
  {
    index: 7,
    name: "Sunday"
  },
  {
    index: 1,
    name: "Monday"
  },
  {
    index: 2,
    name: "Tuesday"
  },
  {
    index: 3,
    name: "Wednesday"
  },
  {
    index: 4,
    name: "Thursday"
  },
  {
    index: 5,
    name: "Friday"
  },
  {
    index: 6,
    name: "Saturday"
  },
]

//lookup for SubEvent
export const SUBEVENT_LOOKUP = [
 "Paid", "Failed", "Subscribed", "Unsubscribed", "FeeFill"
]

//lookup for ProvEvent
export const PROVEVENT_LOOKUP = [
  "Create", "Cancel", "Paid", "Fail"
]

export const SUBSCRIPTEVENT_LOOKUP = [
  "Create", "Cancel", "ProvPaid", "Fail", "ProvRefund", "SubPaid", "Subscribed", "Unsubscribed", "Feefill", "SubRefund"
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
        "indexed": true,
        "internalType": "uint40",
        "name": "timestamp",
        "type": "uint40"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "url",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "description",
        "type": "string"
      }
    ],
    "name": "DetailsLog",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "provider",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint40",
        "name": "timestamp",
        "type": "uint40"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "company",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "url",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "domain",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "email",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "misc",
        "type": "string"
      }
    ],
    "name": "ProvDetailsLog",
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
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "enum ClockTowerSubscribe.SubscriptEvent",
        "name": "subScriptEvent",
        "type": "uint8"
      }
    ],
    "name": "SubLog",
    "type": "event"
  },
  {
    "stateMutability": "payable",
    "type": "fallback"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "accountLookup",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
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
      },
      {
        "internalType": "uint256",
        "name": "minimum",
        "type": "uint256"
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
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "approvedERC20",
    "outputs": [
      {
        "internalType": "address",
        "name": "tokenAddress",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "minimum",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "exists",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "callerFee",
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
        "internalType": "address payable",
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
    "name": "changeCallerFee",
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
        "name": "_fixed_fee",
        "type": "uint256"
      }
    ],
    "name": "changeSystemFee",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "collectFees",
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
        "components": [
          {
            "internalType": "string",
            "name": "url",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "description",
            "type": "string"
          }
        ],
        "internalType": "struct ClockTowerSubscribe.Details",
        "name": "details",
        "type": "tuple"
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
    "inputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "url",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "description",
            "type": "string"
          }
        ],
        "internalType": "struct ClockTowerSubscribe.Details",
        "name": "details",
        "type": "tuple"
      },
      {
        "internalType": "bytes32",
        "name": "id",
        "type": "bytes32"
      }
    ],
    "name": "editDetails",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "description",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "company",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "url",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "domain",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "email",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "misc",
            "type": "string"
          }
        ],
        "internalType": "struct ClockTowerSubscribe.ProviderDetails",
        "name": "details",
        "type": "tuple"
      }
    ],
    "name": "editProvDetails",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "feeBalance",
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
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "getAccount",
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
        "internalType": "struct ClockTowerSubscribe.Account",
        "name": "",
        "type": "tuple"
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
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
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
    "name": "getSubscribersById",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "subscriber",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "feeBalance",
            "type": "uint256"
          }
        ],
        "internalType": "struct ClockTowerSubscribe.SubscriberView[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalSubscribers",
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
    "name": "maxRemits",
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
    "name": "nextUncheckedDay",
    "outputs": [
      {
        "internalType": "uint40",
        "name": "",
        "type": "uint40"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "remit",
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
    "name": "removeERC20Contract",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bool",
        "name": "status",
        "type": "bool"
      }
    ],
    "name": "setExternalCallers",
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
    "name": "systemFee",
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
        "internalType": "bool",
        "name": "status",
        "type": "bool"
      }
    ],
    "name": "systemFeeActivate",
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
