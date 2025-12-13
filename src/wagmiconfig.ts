import { createConfig, http, fallback, Config } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { base } from 'wagmi/chains'
import { coinbaseWallet, metaMask, baseAccount, gemini } from 'wagmi/connectors'
import { walletConnect } from 'wagmi/connectors'

const transport1: string = import.meta.env.VITE_TRANSPORT1
const transport2: string = import.meta.env.VITE_TRANSPORT2

// Debug logging for environment variables
console.log('🔧 Wagmi Config Environment Variables:');
console.log('  VITE_TRANSPORT1:', import.meta.env.VITE_TRANSPORT1);
console.log('  VITE_TRANSPORT2:', import.meta.env.VITE_TRANSPORT2);
console.log('  transport1 (processed):', transport1);
console.log('  transport2 (processed):', transport2);
console.log('  Environment check - TRANSPORT1 exists:', !!import.meta.env.VITE_TRANSPORT1);
console.log('  Environment check - TRANSPORT2 exists:', !!import.meta.env.VITE_TRANSPORT2);
console.log('  Environment check - TRANSPORT1 length:', import.meta.env.VITE_TRANSPORT1?.length || 0);
console.log('  Environment check - TRANSPORT2 length:', import.meta.env.VITE_TRANSPORT2?.length || 0);

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
          icons: [window.location.origin + '/clocktower-icon.svg']
        }
      }),
      baseAccount({
        appName: 'Clocktower',
        appLogoUrl: window.location.origin + '/logo.svg',
      }),
      gemini({
        appMetadata: { 
          name: 'Clocktower', 
          url: 'https://app.clocktower.finance', 
          icon: window.location.origin + '/logo.svg', 
        }, 
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