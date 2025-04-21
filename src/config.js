//imported svg images

import {ReactComponent as HardhatLogo} from "./images/hardhat.svg"
import {ReactComponent as SepoliaLogo} from "./images/ethereum.svg"
import {ReactComponent as MetamaskLogo} from "./images/metamask.svg"
import {ReactComponent as BraveLogo} from "./images/brave.svg"
import {ReactComponent as USDCLogo} from "./images/usdc.svg"
import {ReactComponent as CBWLogo} from "./images/cbw.svg"
import {ReactComponent as WCLogo} from "./images/walletconnect.svg"

/*
import HardhatLogo from "./images/hardhat.svg"
import SepoliaLogo from "./images/ethereum.svg"
import MetamaskLogo from "./images/metamask.svg"
import BraveLogo from "./images/brave.svg"
import USDCLogo from "./images/usdc.svg"
import CBWLogo from "./images/cbw.svg"
//import { getAddress } from 'viem';
*/

/* global BigInt */

//USE ONLY  CHECKSUMMED ADDRESSES BELOW
//export const CLOCKTOWERSUB_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
//export const CLOCKTOWERSUB_ADDRESS = "0xc2f5Ae3Fc61d41cd8c5e4Afb929D99Ba46d6320F";
//export const CLOCKTOWERSUB_ADDRESS = "0xc3d67Fc82F856D36BE91A664Df529cf709f0AE7e";
//export const CLOCKTOWERSUB_ADDRESS = "0x5F67A60C2B74D66C3d126EB515fCA9A38cD37B87";
//export const CLOCKTOWERSUB_ADDRESS = "0x4873d87Ad98edd3E82ED904964e937D696721Cb4";

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export const INFINITE_APPROVAL = BigInt(Math.pow(2,255))
export const ADMIN_ACCOUNT = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
//export const EVENT_START_BLOCK = 0n
//export const EVENT_START_BLOCK = 22967543n

//**************************************************************************** 

export const DOMAIN = "https://app.clocktowerdev.com"

export const JWT_SERVER = "https://clocktowerdev.com/api/requesttoken"

export const TOKEN_LOOKUP = [
  /*
  {
    address: getAddress("0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0"),
    ticker: "CLOCK",
    decimals: 18,
    icon: SepoliaLogo
  }, 
  */
  {
    //address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    ticker: "USDC",
    decimals: 6,
    icon: USDCLogo
  }
]

//supported chains (this needs to match the wagmiconfig)
export const CHAIN_LOOKUP = [
  {
    name: "baseSepolia",
    id: 84532, 
    icon: SepoliaLogo,
    displayName: "Base Sepolia",
    explorerUrl: "https://sepolia.basescan.org/",
    contractAddress: "0x4873d87Ad98edd3E82ED904964e937D696721Cb4",
    start_block: 22967543n
  },
  
  {
    name: "hardhat",
    id: 31337,
    icon: HardhatLogo,
    displayName: "Hardhat",
    explorerUrl: "",
    contractAddress: "",
    start_block: 0n
  }, 
  /*
  {
    name: "sepolia",
    id: 11155111, 
    icon: SepoliaLogo,
    displayName: "Sepolia Network"
  }
  */
]

//supported Wallets
export const WALLET_LOOKUP = [
  {
    name: "metaMask",
    id: "metaMaskSDK",
    icon: MetamaskLogo
  },
  {
    name: "brave wallet",
    id: "com.brave.wallet",
    icon: BraveLogo
  },
  {
    name: "coinbaseWallet",
    id: "coinbaseWalletSDK",
    icon: CBWLogo
  },
  {
    name: "walletConnect",
    id: "walletConnect",
    icon: WCLogo
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
    "inputs": [
      {
        "internalType": "uint256",
        "name": "callerFee_",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "systemFee_",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "maxRemits_",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "cancelLimit_",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "allowSystemFee_",
        "type": "bool"
      },
      {
        "internalType": "address",
        "name": "admin_",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "janitor_",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "AccessControlBadConfirmation",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint48",
        "name": "schedule",
        "type": "uint48"
      }
    ],
    "name": "AccessControlEnforcedDefaultAdminDelay",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "AccessControlEnforcedDefaultAdminRules",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "defaultAdmin",
        "type": "address"
      }
    ],
    "name": "AccessControlInvalidDefaultAdmin",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "neededRole",
        "type": "bytes32"
      }
    ],
    "name": "AccessControlUnauthorizedAccount",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint8",
        "name": "bits",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "SafeCastOverflowedUintDowncast",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      }
    ],
    "name": "SafeERC20FailedOperation",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint40",
        "name": "timestamp",
        "type": "uint40"
      },
      {
        "indexed": true,
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
        "indexed": false,
        "internalType": "uint256",
        "name": "subscriberIndex",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "subscriptionIndex",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "frequency",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint40",
        "name": "nextUncheckedDay",
        "type": "uint40"
      }
    ],
    "name": "Coordinates",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [],
    "name": "DefaultAdminDelayChangeCanceled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint48",
        "name": "newDelay",
        "type": "uint48"
      },
      {
        "indexed": false,
        "internalType": "uint48",
        "name": "effectSchedule",
        "type": "uint48"
      }
    ],
    "name": "DefaultAdminDelayChangeScheduled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [],
    "name": "DefaultAdminTransferCanceled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "newAdmin",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint48",
        "name": "acceptSchedule",
        "type": "uint48"
      }
    ],
    "name": "DefaultAdminTransferScheduled",
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
        "indexed": true,
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
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "previousAdminRole",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "newAdminRole",
        "type": "bytes32"
      }
    ],
    "name": "RoleAdminChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "RoleGranted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "RoleRevoked",
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
    "inputs": [],
    "name": "DEFAULT_ADMIN_ROLE",
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
    "inputs": [],
    "name": "JANITOR_ROLE",
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
    "inputs": [],
    "name": "acceptDefaultAdminTransfer",
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
      },
      {
        "internalType": "uint256",
        "name": "minimum",
        "type": "uint256"
      },
      {
        "internalType": "uint8",
        "name": "decimals",
        "type": "uint8"
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
        "internalType": "uint8",
        "name": "decimals",
        "type": "uint8"
      },
      {
        "internalType": "bool",
        "name": "paused",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "minimum",
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
        "name": "newAdmin",
        "type": "address"
      }
    ],
    "name": "beginDefaultAdminTransfer",
    "outputs": [],
    "stateMutability": "nonpayable",
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
    "inputs": [],
    "name": "cancelDefaultAdminTransfer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "cancelLimit",
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
        "name": "_subscription",
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
        "internalType": "uint48",
        "name": "newDelay",
        "type": "uint48"
      }
    ],
    "name": "changeDefaultAdminDelay",
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
        "internalType": "address",
        "name": "newSysFeeAddress",
        "type": "address"
      }
    ],
    "name": "changeSysFeeReceiver",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_sys_fee",
        "type": "uint256"
      }
    ],
    "name": "changeSystemFee",
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
    "name": "cleanupCancelledSubscribers",
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
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "defaultAdmin",
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
    "inputs": [],
    "name": "defaultAdminDelay",
    "outputs": [
      {
        "internalType": "uint48",
        "name": "",
        "type": "uint48"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "defaultAdminDelayIncreaseWait",
    "outputs": [
      {
        "internalType": "uint48",
        "name": "",
        "type": "uint48"
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
        "internalType": "uint256",
        "name": "frequency",
        "type": "uint256"
      },
      {
        "internalType": "uint16",
        "name": "dueDay",
        "type": "uint16"
      }
    ],
    "name": "getIdByTime",
    "outputs": [
      {
        "internalType": "bytes32[]",
        "name": "",
        "type": "bytes32[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      }
    ],
    "name": "getRoleAdmin",
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
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "grantRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "hasRole",
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
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "idSubMap",
    "outputs": [
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
    "name": "owner",
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
        "name": "_tokenAddress",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "pause",
        "type": "bool"
      }
    ],
    "name": "pauseToken",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pendingDefaultAdmin",
    "outputs": [
      {
        "internalType": "address",
        "name": "newAdmin",
        "type": "address"
      },
      {
        "internalType": "uint48",
        "name": "schedule",
        "type": "uint48"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pendingDefaultAdminDelay",
    "outputs": [
      {
        "internalType": "uint48",
        "name": "newDelay",
        "type": "uint48"
      },
      {
        "internalType": "uint48",
        "name": "schedule",
        "type": "uint48"
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
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "renounceRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "revokeRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "rollbackDefaultAdminDelay",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_cancelLimit",
        "type": "uint256"
      }
    ],
    "name": "setCancelLimit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint40",
        "name": "_nextUncheckedDay",
        "type": "uint40"
      }
    ],
    "name": "setNextUncheckedDay",
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
            "name": "subscriberIndex",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "subscriptionIndex",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "frequency",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "initialized",
            "type": "bool"
          }
        ],
        "internalType": "struct ClockTowerSubscribe.PageStart",
        "name": "_pageStart",
        "type": "tuple"
      }
    ],
    "name": "setPageStart",
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
        "name": "_subscription",
        "type": "tuple"
      }
    ],
    "name": "subscribe",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "interfaceId",
        "type": "bytes4"
      }
    ],
    "name": "supportsInterface",
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
        "name": "_subscription",
        "type": "tuple"
      }
    ],
    "name": "unsubscribe",
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
        "name": "_subscription",
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
  }
]




