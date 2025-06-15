import { createConfig, http, fallback, Config } from 'wagmi'
import { hardhat } from 'wagmi/chains'
import { baseSepolia } from 'wagmi/chains'
import { coinbaseWallet, metaMask } from 'wagmi/connectors'

const transport1: string = import.meta.env.VITE_TRANSPORT1
const transport2: string = import.meta.env.VITE_TRANSPORT2

export const config: Config = createConfig({
    chains: [hardhat, baseSepolia],   
    connectors: [
      metaMask(),
      coinbaseWallet(),
    ],
    transports: { 
      [hardhat.id]: http('http://localhost:8545'),
      [baseSepolia.id]: fallback([
        http(transport1, {
          fetchOptions: { 
            headers: {
              'Content-Type': 'application/json'
            }
          }
        }),
        http(transport2, {
          fetchOptions: { 
            headers: {
              'Content-Type': 'application/json'
            }
          }
        }),
      ]),
    } 
}) 