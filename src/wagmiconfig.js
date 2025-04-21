import { createConfig, http, fallback} from 'wagmi'
import { hardhat } from 'wagmi/chains'
//import { sepolia } from 'wagmi/chains'
import { baseSepolia } from 'wagmi/chains'
import { coinbaseWallet, metaMask, walletConnect} from 'wagmi/connectors'
//import {fetchToken} from './clockfunctions'
//import {jwtDecode} from 'jwt-decode'
const transport1 = import.meta.env.VITE_TRANSPORT1
const transport2 = import.meta.env.VITE_TRANSPORT2
const projectId = import.meta.env.VITE_WALLETCONNECTID

//let token = localStorage.getItem('clockAccess')

//console.log(token)

/*
// Function to get token dynamically
const getToken = async () => {
  // Check if in browser environment
  if (typeof window !== 'undefined') {
    await fetchToken()
    //let token = localStorage.getItem('clockAccess');
    let token = sessionStorage.getItem('clockAccess');
    console.log('Retrieved Token:', token); // Debug
    return token || ''; // Fallback to empty string if null
  } else {
    await fetchToken()
  }
  return ''; // Fallback for non-browser (e.g., SSR)
};
*/

export const config = createConfig(
    {
    chains: [hardhat, baseSepolia],   
    connectors: [
      metaMask(),
      coinbaseWallet(),
      walletConnect({ projectId }),
    ],
    transports: { 
      [hardhat.id]: http('http://localhost:8545'),
      
      [baseSepolia.id]: 
      
      fallback([
      /*
        http('https://base-sepolia.g.alchemy.com/v2', {
          fetchOptions: { 
            headers: {
              'Authorization': `Bearer ${await getToken()}`
              //'Authorization': `Bearer ${token2}`
            }
          }
        }),
        http("https://sepolia.base.org") // Public RPC as a last resort
      ]),
      */
      http(transport1, {
    // http("https://clocktowerdev.com/alchemy", {
        fetchOptions: { 
          headers: {
            'Content-Type' : 'application/json'
            //'Authorization': `Bearer ${token2}`
          }
        }
      }),
      http(transport2, {
      //  http("https://clocktowerdev.com/infura", {
        fetchOptions: { 
          headers: {
            'Content-Type' : 'application/json'
            //'Authorization': `Bearer ${token2}`
          }
        }
      }),
    ]),
    } 
    
})