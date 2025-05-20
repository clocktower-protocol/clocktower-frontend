import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const SUBGRAPH_URL = import.meta.env.VITE_SUBGRAPH_URL
//const API_KEY = import.meta.env.VITE_SUBGRAPH_API_KEY

export const apolloClient = new ApolloClient({
    link: new HttpLink({ 
        uri: SUBGRAPH_URL,
        /*
        headers: {
            'Authorization': `Bearer ${API_KEY}`
        }
        */
    }),
    cache: new InMemoryCache(),
});