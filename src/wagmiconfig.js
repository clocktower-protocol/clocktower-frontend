import { createConfig, http } from 'wagmi'
import { hardhat } from 'wagmi/chains'
//import { sepolia } from 'wagmi/chains'
import { baseSepolia } from 'wagmi/chains'
import { coinbaseWallet, safe} from 'wagmi/connectors'
import {fetchToken} from './clockfunctions'

//let token = localStorage.getItem('clockAccess')

//console.log(token)

// Function to get token dynamically
const getToken = () => {
  // Check if in browser environment
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('clockAccess');
    console.log('Retrieved Token:', token); // Debug
    return token || ''; // Fallback to empty string if null
  } else {
    fetchToken()
  }
  return ''; // Fallback for non-browser (e.g., SSR)
};

export const config = createConfig(
    {
    chains: [hardhat, baseSepolia],   
    connectors: [
      coinbaseWallet(),
      safe()
    ],
    transports: { 
      [hardhat.id]: http('http://localhost:8545'),
      
      [baseSepolia.id]: http('https://base-sepolia.g.alchemy.com/v2', {
        fetchOptions: { 
          headers: {
            'Authorization': `Bearer ${getToken()}`
            //'Authorization': `Bearer ${token2}`
          }
        }
      })
    }, 
})