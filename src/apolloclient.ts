import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const SUBGRAPH_URL: string = import.meta.env.VITE_SUBGRAPH_URL
//const API_KEY = import.meta.env.VITE_SUBGRAPH_API_KEY

// Debug logging for environment variables
console.log('🔧 Apollo Client Environment Variables:');
console.log('  VITE_SUBGRAPH_URL:', import.meta.env.VITE_SUBGRAPH_URL);
console.log('  SUBGRAPH_URL (processed):', SUBGRAPH_URL);
console.log('  Environment check - URL exists:', !!import.meta.env.VITE_SUBGRAPH_URL);
console.log('  Environment check - URL length:', import.meta.env.VITE_SUBGRAPH_URL?.length || 0);

// Function to create a new client with chain ID
export const createApolloClient = (chainId: number | undefined): ApolloClient<any> => {
    return new ApolloClient({
        link: new HttpLink({ 
            uri: SUBGRAPH_URL,
            headers: {
                'chain-id': chainId?.toString() || ''
            }
        }),
        cache: new InMemoryCache(),
    });
};