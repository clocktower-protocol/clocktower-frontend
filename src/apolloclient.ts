import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const SUBGRAPH_URL: string = import.meta.env.VITE_SUBGRAPH_URL
//const API_KEY = import.meta.env.VITE_SUBGRAPH_API_KEY

// Create a default client for initial render
export const apolloClient = new ApolloClient({
    link: new HttpLink({ 
        uri: SUBGRAPH_URL,
        headers: {
            'chain-id': '84532'
        }
    }),
    cache: new InMemoryCache(),
});

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