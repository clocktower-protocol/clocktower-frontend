import { createConfig, http, fallback, Config } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { base } from 'wagmi/chains'
import { coinbaseWallet, metaMask } from 'wagmi/connectors'

const transport1: string = import.meta.env.VITE_TRANSPORT1
const transport2: string = import.meta.env.VITE_TRANSPORT2

export const config: Config = createConfig({
    chains: [base, baseSepolia],   
    connectors: [
      metaMask(),
      coinbaseWallet(),
    ],
    transports: { 
      [baseSepolia.id]: fallback([
        http(transport1, {
          fetchOptions: { 
            headers: {
              'Content-Type': 'application/json',
              'chain-id': baseSepolia.id.toString()
            }
          }
        }),
        http(transport2, {
          fetchOptions: { 
            headers: {
              'Content-Type': 'application/json',
              'chain-id': baseSepolia.id.toString()
            }
          }
        }),
      ]),
      [base.id]: fallback([
        http(transport1, {
          fetchOptions: { 
            headers: {
              'Content-Type': 'application/json',
              'chain-id': base.id.toString()
            }
          }
        }),
        http(transport2, {
          fetchOptions: { 
            headers: {
              'Content-Type': 'application/json',
              'chain-id': base.id.toString()
            }
          }
        }),
      ]),
    } 
}) 