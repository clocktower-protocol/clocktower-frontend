import { createConfig, http, fallback, Config } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { base } from 'wagmi/chains'
import { coinbaseWallet, metaMask, walletConnect } from 'wagmi/connectors'

const transport1: string = import.meta.env.VITE_TRANSPORT1
const transport2: string = import.meta.env.VITE_TRANSPORT2

export const config: Config = createConfig({
    chains: [base, baseSepolia],   
    connectors: [
      metaMask(),
      coinbaseWallet(),
      walletConnect({
        projectId: '0168b93563a3f610bb1c0ff1f29444bb',
        metadata: {
          name: 'Clocktower',
          description: 'Clocktower Protocol',
          url: 'https://app.clocktower.finance',
          icons: ['https://app.clocktower.finance/clocktower-icon.svg']
        }
      }),
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