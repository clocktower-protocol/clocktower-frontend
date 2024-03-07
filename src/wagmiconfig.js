import { createConfig, http } from 'wagmi'
import { hardhat, sepolia } from 'wagmi/chains'
import { injected, coinbaseWallet} from 'wagmi/connectors'

let token = localStorage.getItem('clockAccess')

export const config = createConfig(
    {
    chains: [hardhat],
    connectors: [injected({ target: 'metaMask' })],
    transports: { 
      [hardhat.id]: http('http://localhost:8545'),
      /*
      [sepolia.id]: http('https://eth-sepolia.g.alchemy.com/v2', {
        fetchOptions: { 
          headers: {
            'Authorization': 'Bearer ' + token
          }
        }
      })
      */
    }, 
})