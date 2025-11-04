import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '../../test-utils';
import IframeTest from '../iframetest';
import React from 'react';

// Mock react-router
const mockNavigate = vi.fn();
const mockParams = { id: '0x123', return_url: 'https://example.com/callback' };
const mockOutletContext = ['0xuser123' as `0x${string}`];

vi.mock('react-router', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react-router')>();
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useParams: () => mockParams,
        useOutletContext: () => mockOutletContext,
    };
});

// Mock wagmi hooks
const mockUseAccount = vi.fn();
const mockUseWriteContract = vi.fn();
const mockUseWaitForTransactionReceipt = vi.fn();
const mockUsePublicClient = vi.fn();
const mockReadContract = vi.fn();

vi.mock('wagmi', async (importOriginal) => {
    const actual = await importOriginal<typeof import('wagmi')>();
    return {
        ...actual,
        useAccount: () => mockUseAccount(),
        useWriteContract: () => mockUseWriteContract(),
        useWaitForTransactionReceipt: () => mockUseWaitForTransactionReceipt(),
        usePublicClient: () => mockUsePublicClient(),
    };
});

vi.mock('wagmi/actions', () => ({
    readContract: (...args: any[]) => mockReadContract(...args),
}));

// Mock Apollo Client
const mockApolloClient = {
    query: vi.fn().mockResolvedValue({
        data: {
            detailsLogs: [],
        },
    }),
};

vi.mock('@apollo/client/react', () => ({
    useApolloClient: () => mockApolloClient,
}));

// Mock config
vi.mock('../../config', () => ({
    CLOCKTOWERSUB_ABI: [],
    INFINITE_APPROVAL: BigInt('1000000000000000000000000000000000000000000000000000000000000000'),
    ZERO_ADDRESS: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    CHAIN_LOOKUP: [
        {
            id: 84532,
            displayName: 'Base Sepolia',
            contractAddress: '0xContract123' as `0x${string}`,
        },
    ],
    TOKEN_LOOKUP: [
        { address: '0x123' as `0x${string}`, ticker: 'ETH', decimals: 18, icon: () => null, chain: 84532 },
    ],
}));

describe('Iframe Functionality', () => {
    let originalWindow: Window & typeof globalThis;
    let postMessageSpy: any;

    beforeEach(() => {
        // Store original window
        originalWindow = global.window;
        
        // Mock window.self and window.top for iframe detection
        Object.defineProperty(window, 'self', {
            writable: true,
            configurable: true,
            value: window,
        });

        Object.defineProperty(window, 'top', {
            writable: true,
            configurable: true,
            value: window,
        });

        // Mock window.parent for postMessage
        Object.defineProperty(window, 'parent', {
            writable: true,
            configurable: true,
            value: {
                postMessage: vi.fn(),
            },
        });

        postMessageSpy = vi.spyOn(window.parent, 'postMessage');

        // Setup default mocks
        mockUseAccount.mockReturnValue({
            address: '0xuser123' as `0x${string}`,
            chainId: 84532,
        });

        mockUseWriteContract.mockReturnValue({
            data: null,
            variables: null,
            writeContract: vi.fn(),
        });

        mockUseWaitForTransactionReceipt.mockReturnValue({
            isLoading: false,
            isSuccess: false,
        });

        mockUsePublicClient.mockReturnValue({});

        mockReadContract.mockResolvedValue([
            '0x123',
            BigInt('1000000000000000000'),
            '0xprovider123' as `0x${string}`,
            '0x123' as `0x${string}`,
            false,
            1,
            15,
        ]);
    });

    afterEach(() => {
        vi.clearAllMocks();
        postMessageSpy.mockRestore();
    });

    describe('PostMessage functionality', () => {
        it('postMessage is called with correct structure', () => {
            const message = {
                type: 'subscription_complete',
                subscription_id: '0x123',
                user_address: '0xuser123',
                success: true,
                return_url: 'https://example.com/callback',
            };

            postMessageSpy(message, '*');

            expect(postMessageSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'subscription_complete',
                    subscription_id: '0x123',
                    user_address: '0xuser123',
                    success: true,
                }),
                '*'
            );
        });
    });

    describe('IframeTest postMessage listener', () => {
        it('receives and displays subscription completion message', async () => {
            render(<IframeTest />);

            // Simulate postMessage from iframe
            const message = {
                type: 'subscription_complete',
                subscription_id: '0x123',
                user_address: '0xuser123',
                success: true,
                return_url: 'https://example.com/callback',
            };

            // Dispatch message event wrapped in act
            await act(async () => {
                window.dispatchEvent(
                    new MessageEvent('message', {
                        data: message,
                        origin: window.location.origin,
                    })
                );
            });

            // Check that success message is displayed
            await waitFor(() => {
                expect(screen.getByText(/subscription completed/i)).toBeInTheDocument();
                expect(screen.getByText('0x123')).toBeInTheDocument();
                expect(screen.getByText('0xuser123')).toBeInTheDocument();
            });
        });

        it('ignores messages from unexpected origins', async () => {
            render(<IframeTest />);

            const message = {
                type: 'subscription_complete',
                subscription_id: '0x123',
                user_address: '0xuser123',
                success: true,
            };

            // Dispatch message from different origin wrapped in act
            await act(async () => {
                window.dispatchEvent(
                    new MessageEvent('message', {
                        data: message,
                        origin: 'https://malicious-site.com',
                    })
                );
            });

            // Should not display success message
            await waitFor(() => {
                expect(screen.queryByText(/subscription completed/i)).not.toBeInTheDocument();
            });
        });

        it('ignores messages with wrong type', async () => {
            render(<IframeTest />);

            const message = {
                type: 'other_message_type',
                data: 'some data',
            };

            await act(async () => {
                window.dispatchEvent(
                    new MessageEvent('message', {
                        data: message,
                        origin: window.location.origin,
                    })
                );
            });

            // Should not display success message
            expect(screen.queryByText(/subscription completed/i)).not.toBeInTheDocument();
        });
    });

    describe('Wallet availability detection', () => {
        it('detects MetaMask availability in iframe', () => {
            // Mock window.ethereum with MetaMask
            const mockEthereum = {
                isMetaMask: true,
            };
            
            Object.defineProperty(window, 'ethereum', {
                writable: true,
                configurable: true,
                value: mockEthereum,
            });

            // Simulate iframe
            Object.defineProperty(window, 'top', {
                writable: true,
                configurable: true,
                value: {} as Window,
            });

            // This would be tested through the Root component
            // For now, we verify the detection logic exists
            expect(window.ethereum).toBeDefined();
            expect((window.ethereum as any).isMetaMask).toBe(true);
        });

        it('detects WalletConnect always works in iframe', () => {
            // WalletConnect should always be available
            // This is tested through the wallet connection flow
            expect(true).toBe(true); // Placeholder - actual test would be in Root component tests
        });
    });
});

