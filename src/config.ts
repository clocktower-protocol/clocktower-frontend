import { ReactComponent as HardhatLogo } from "./images/hardhat.svg";
import { ReactComponent as SepoliaLogo } from "./images/base_sepolia.svg";
import { ReactComponent as MetamaskLogo } from "./images/metamask.svg";
import { ReactComponent as BraveLogo } from "./images/brave.svg";
import { ReactComponent as USDCLogo } from "./images/usdc.svg";
import { ReactComponent as CBWLogo } from "./images/cbw.svg";
import { ReactComponent as WCLogo } from "./images/walletconnect.svg";

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export const INFINITE_APPROVAL = BigInt(Math.pow(2, 255));
export const ADMIN_ACCOUNT = "0xeaB2c4C12eac9EC14EA615E721c9d0D9027Fa85a";

export const DOMAIN = "https://app.clocktower.finance";
export const JWT_SERVER = "https://clocktowerdev.com/api/requesttoken";

interface Token {
    address: `0x${string}`;
    ticker: string;
    decimals: number;
    icon: React.ComponentType;
}

interface Chain {
    name: string;
    id: number;
    icon: React.ComponentType;
    displayName: string;
    explorerUrl: string;
    contractAddress: `0x${string}`;
    start_block: bigint;
}

interface Wallet {
    name: string;
    id: string;
    icon: React.ComponentType;
}

interface Frequency {
    index: number;
    name: string;
    name2: string;
}

interface DueDayRange {
    frequency: number;
    start: number;
    stop: number;
}

interface DayOfWeek {
    index: number;
    name: string;
}

export const TOKEN_LOOKUP: Token[] = [
    {
        address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
        ticker: "USDC",
        decimals: 6,
        icon: USDCLogo
    }
];

export const CHAIN_LOOKUP: Chain[] = [
    {
        name: "baseSepolia",
        id: 84532,
        icon: SepoliaLogo,
        displayName: "Base Sepolia",
        explorerUrl: "https://sepolia.basescan.org/",
        contractAddress: "0x6A0791Cd884f2199dC8F372f6715f675D2950922",
        start_block: 26042632n
    },
    {
        name: "hardhat",
        id: 31337,
        icon: HardhatLogo,
        displayName: "Hardhat",
        explorerUrl: "",
        contractAddress: "0x0000000000000000000000000000000000000000",
        start_block: 0n
    }
];

export const WALLET_LOOKUP: Wallet[] = [
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
];

export const FREQUENCY_LOOKUP: Frequency[] = [
    {
        index: 0,
        name: "Weekly",
        name2: "Week"
    },
    {
        index: 1,
        name: "Monthly",
        name2: "Month"
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
];

export const DUEDAY_RANGE: DueDayRange[] = [
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
];

export const DAY_OF_WEEK_LOOKUP: DayOfWeek[] = [
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
    }
];

export const SUBEVENT_LOOKUP: string[] = [
    "Paid", "Failed", "Subscribed", "Unsubscribed", "FeeFill"
];

export const PROVEVENT_LOOKUP: string[] = [
    "Create", "Cancel", "Paid", "Fail"
];

export const SUBSCRIPTEVENT_LOOKUP: string[] = [
    "Create", "Cancel", "ProvPaid", "Fail", "ProvRefund", "SubPaid", "Subscribed", "Unsubscribed", "Feefill", "SubRefund"
];

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
    }
    // ... rest of the ABI
]; 