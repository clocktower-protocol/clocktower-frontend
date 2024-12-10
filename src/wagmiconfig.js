import { createConfig, http } from 'wagmi'
import { hardhat } from 'wagmi/chains'
//import { sepolia } from 'wagmi/chains'
//import { baseSepolia } from 'wagmi/chains'
import { coinbaseWallet, safe} from 'wagmi/connectors'

//let token = localStorage.getItem('clockAccess')

export const config = createConfig(
    {
    chains: [hardhat],
    connectors: [
      coinbaseWallet(),
      safe()
    ],
    transports: { 
      [hardhat.id]: http('http://localhost:8545'),
      /*
      [baseSepolia.id]: http('https://base-sepolia.g.alchemy.com/v2', {
        fetchOptions: { 
          headers: {
            'Authorization': 'Bearer ' + token
          }
        }
      })
      */
    }, 
})