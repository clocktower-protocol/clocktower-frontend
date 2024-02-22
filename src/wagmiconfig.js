import { createConfig, http } from 'wagmi'
import { hardhat } from 'wagmi/chains'
import { injected, coinbaseWallet} from 'wagmi/connectors'


export const config = createConfig(
    {
    chains: [hardhat],
    connectors: [injected({ target: 'metaMask' })],
    transports: { 
      [hardhat.id]: http('http://localhost:8545'),  
    }, 
})