import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const SUBGRAPH_URL = import.meta.env.VITE_SUBGRAPH_URL

export const apolloClient = new ApolloClient({
    link: new HttpLink({ uri: SUBGRAPH_URL }),
    cache: new InMemoryCache(),
});