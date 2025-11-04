import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';
import { createConfig, http } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';

// Create a test Wagmi config with a simple HTTP transport
const testWagmiConfig = createConfig({
    chains: [baseSepolia],
    connectors: [],
    transports: {
        [baseSepolia.id]: http(),
    },
});

// Create a test Apollo client
const testApolloClient = new ApolloClient({
    link: new HttpLink({
        uri: 'https://test-subgraph.example.com',
    }),
    cache: new InMemoryCache(),
});

// Create a test QueryClient
const createTestQueryClient = () => {
    return new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                gcTime: 0,
            },
        },
    });
};

interface AllTheProvidersProps {
    children: React.ReactNode;
    initialEntries?: string[];
    includeRouter?: boolean;
    includeWagmi?: boolean;
    includeApollo?: boolean;
}

const AllTheProviders: React.FC<AllTheProvidersProps> = ({ 
    children, 
    initialEntries = ['/'],
    includeRouter = false,
    includeWagmi = false,
    includeApollo = false,
}) => {
    const queryClient = React.useMemo(() => createTestQueryClient(), []);
    
    let wrappedChildren = children;
    
    // Wrap with router if needed
    if (includeRouter) {
        const router = React.useMemo(() => createMemoryRouter(
            [
                {
                    path: '/',
                    element: children as React.ReactElement,
                },
            ],
            {
                initialEntries,
            }
        ), [children, initialEntries]);
        wrappedChildren = <RouterProvider router={router} />;
    }
    
    // Wrap with Apollo if needed
    if (includeApollo) {
        wrappedChildren = (
            <ApolloProvider client={testApolloClient}>
                {wrappedChildren}
            </ApolloProvider>
        );
    }
    
    // Wrap with QueryClient if needed
    if (includeWagmi || includeApollo) {
        wrappedChildren = (
            <QueryClientProvider client={queryClient}>
                {wrappedChildren}
            </QueryClientProvider>
        );
    }
    
    // Wrap with Wagmi if needed
    if (includeWagmi) {
        wrappedChildren = (
            <WagmiProvider config={testWagmiConfig}>
                {wrappedChildren}
            </WagmiProvider>
        );
    }
    
    // Always include ThemeProvider
    return (
        <ThemeProvider>
            {wrappedChildren}
        </ThemeProvider>
    );
};

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
    initialEntries?: string[];
    includeRouter?: boolean;
    includeWagmi?: boolean;
    includeApollo?: boolean;
}

const customRender = (
    ui: ReactElement,
    options?: CustomRenderOptions
) => {
    const { initialEntries, includeRouter, includeWagmi, includeApollo, ...renderOptions } = options || {};
    
    return render(ui, {
        wrapper: (props) => (
            <AllTheProviders 
                {...props} 
                initialEntries={initialEntries}
                includeRouter={includeRouter}
                includeWagmi={includeWagmi}
                includeApollo={includeApollo}
            />
        ),
        ...renderOptions,
    });
};

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { customRender as render };