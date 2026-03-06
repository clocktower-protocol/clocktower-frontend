import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../test-utils';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider, Outlet } from 'react-router';
import PublicSubscription from '../publicsubscription';
import type { SubscriptionResult } from '../../types/subscription';

const MOCK_ACCOUNT = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' as `0x${string}`;
const MOCK_CHAIN_ID = 84532;
const MOCK_TOKEN = '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as `0x${string}`;
const MOCK_CONTRACT = '0x6A0791Cd884f2199dC8F372f6715f675D2950922' as `0x${string}`;
const MOCK_SUB_ID = '0x1234567890123456789012345678901234567890123456789012345678901234' as `0x${string}`;
const ALLOWANCE_THRESHOLD = 100000000000000000000000n;

const mockSubscriptionResult: SubscriptionResult = [
    MOCK_SUB_ID,
    BigInt('1000000000000000000'),
    '0xprovider0000000000000000000000000000000001' as `0x${string}`,
    MOCK_TOKEN,
    false,
    1,
    15,
];

let mockAllowance = 0n;
const mockMutate = vi.fn();
let mockVariables: { functionName?: string } | undefined = undefined;
const mockSendCallsMutateAsync = vi.fn().mockResolvedValue({ id: 'batch-1' });

const writeContractStable = {
    mutate: (opts: { functionName?: string }) => {
        mockMutate(opts);
        mockVariables = opts;
    },
    data: undefined as undefined,
    get variables() {
        return mockVariables;
    },
};

vi.mock('wagmi', async (importOriginal) => {
    const actual = await importOriginal<typeof import('wagmi')>();
    return {
        ...actual,
        useConnection: vi.fn(() => ({
            address: MOCK_ACCOUNT,
            chainId: MOCK_CHAIN_ID,
        })),
        usePublicClient: vi.fn(() => null),
        useCapabilities: vi.fn(() => ({ data: undefined as Record<number, unknown> | undefined })),
        useSendCalls: vi.fn(() => ({
            mutateAsync: mockSendCallsMutateAsync,
        })),
        useWaitForCallsStatus: vi.fn(() => ({
            isSuccess: false,
            isFetching: false,
            data: undefined,
        })),
        useWriteContract: vi.fn(() => writeContractStable),
        useWaitForTransactionReceipt: vi.fn(() => ({
            isLoading: false,
            isSuccess: false,
        })),
    };
});

vi.mock('wagmi/actions', () => ({
    readContract: vi.fn(),
}));

vi.mock('../wagmiconfig', () => ({
    config: {},
}));

vi.mock('../config', () => ({
    CLOCKTOWERSUB_ABI: [],
    INFINITE_APPROVAL: BigInt(2 ** 255),
    ZERO_ADDRESS: '0x0000000000000000000000000000000000000000',
    CHAIN_LOOKUP: [
        { id: MOCK_CHAIN_ID, contractAddress: MOCK_CONTRACT },
    ],
    TOKEN_LOOKUP: [
        { address: MOCK_TOKEN, ticker: 'USDC', decimals: 6, icon: () => null, chain: MOCK_CHAIN_ID },
    ],
}));

vi.mock('@apollo/client/react', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@apollo/client/react')>();
    return {
        ...actual,
        useApolloClient: vi.fn(() => ({
            query: vi.fn().mockResolvedValue({
                data: { detailsLogs: [] },
            }),
        })),
    };
});

import { readContract } from 'wagmi/actions';
import { useCapabilities, useWaitForCallsStatus, useWaitForTransactionReceipt } from 'wagmi';

const mockNavigate = vi.fn();
vi.mock('react-router', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react-router')>();
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

vi.mock('../../components/SubscriptionCards', () => {
    const React = require('react');
    return {
        default: (props: {
            subscriptionArray: unknown[];
            detailsArray: unknown[];
            subscribe?: () => void | Promise<void>;
            hasEnoughBalance?: boolean;
            isSubscribed?: boolean;
            isProvider?: boolean;
            [key: string]: unknown;
        }) => {
            if (!props.subscriptionArray?.length) return null;
            const hasEnough = props.hasEnoughBalance !== false;
            return React.createElement(
                'div',
                { className: 'subscription-cards-mock' },
                React.createElement(
                    'button',
                    {
                        type: 'button',
                        onClick: () => props.subscribe?.(),
                        disabled: !hasEnough,
                        'aria-label': 'Subscribe',
                    },
                    hasEnough ? 'Subscribe' : 'Insufficient Balance'
                )
            );
        },
    };
});

function setupReadContract() {
    vi.mocked(readContract).mockImplementation((( _config: unknown, opts: unknown) => {
        const o = opts as { functionName?: string };
        if (o.functionName === 'idSubMap') return Promise.resolve(mockSubscriptionResult) as ReturnType<typeof readContract>;
        if (o.functionName === 'getSubscribersById') return Promise.resolve([]) as ReturnType<typeof readContract>;
        if (o.functionName === 'balanceOf') return Promise.resolve(1000000000000000000000000n) as ReturnType<typeof readContract>;
        if (o.functionName === 'allowance') return Promise.resolve(mockAllowance) as ReturnType<typeof readContract>;
        return Promise.resolve(null) as ReturnType<typeof readContract>;
    }) as typeof readContract);
}

/** Use in tests that need first allowance read low, subsequent high (e.g. fallback two-step). */
function setupReadContractAllowanceFirstLowThenHigh() {
    let allowanceReadCount = 0;
    vi.mocked(readContract).mockImplementation(((_config: unknown, opts: unknown) => {
        const o = opts as { functionName?: string };
        if (o.functionName === 'idSubMap') return Promise.resolve(mockSubscriptionResult) as ReturnType<typeof readContract>;
        if (o.functionName === 'getSubscribersById') return Promise.resolve([]) as ReturnType<typeof readContract>;
        if (o.functionName === 'balanceOf') return Promise.resolve(1000000000000000000000000n) as ReturnType<typeof readContract>;
        if (o.functionName === 'allowance') {
            const value = allowanceReadCount++ === 0 ? 0n : ALLOWANCE_THRESHOLD + 1n;
            return Promise.resolve(value) as ReturnType<typeof readContract>;
        }
        return Promise.resolve(null) as ReturnType<typeof readContract>;
    }) as typeof readContract);
}

function renderPublicSubscription() {
    const router = createMemoryRouter(
        [
            {
                path: '/',
                element: <Outlet context={[MOCK_ACCOUNT]} />,
                children: [
                    {
                        path: 'public_subscription/:id/:f/:d',
                        element: <PublicSubscription />,
                    },
                ],
            },
        ],
        { initialEntries: ['/public_subscription/subid/1/15'], initialIndex: 0 }
    );
    return render(<RouterProvider router={router} />, {
        includeWagmi: false,
        includeApollo: true,
    });
}

/**
 * Unit tests for EIP-5792 batch (approve + subscribe) and fallback in PublicSubscription.
 * The "loads subscription" test verifies the page loads and Subscribe button appears.
 * Skipped tests document the intended batch/fallback/single-call behavior; full flow is
 * covered by E2E tests (e2e/public-subscription-subscribe.spec.ts) with RPC mocks.
 */
describe('PublicSubscription EIP-5792 batch and fallback', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockVariables = undefined;
        mockAllowance = 0n;
        mockSendCallsMutateAsync.mockResolvedValue({ id: 'batch-1' });
        setupReadContract();
    });

    it('loads subscription data and shows Subscribe button when balance is sufficient', async () => {
        vi.mocked(useCapabilities).mockReturnValue({ data: {} } as ReturnType<typeof useCapabilities>);

        renderPublicSubscription();

        await waitFor(
            () => {
                const calls = vi.mocked(readContract).mock.calls;
                expect(calls.some(([, opts]) => (opts as { functionName?: string }).functionName === 'balanceOf')).toBe(true);
            },
            { timeout: 5000 }
        );

        const subscribeBtn = screen.getByRole('button', { name: /subscribe/i });
        expect(subscribeBtn).toBeInTheDocument();
        expect(subscribeBtn).not.toBeDisabled();
    });

    it('batch path: when capabilities present and low allowance, calls sendCalls with approve + subscribe', async () => {
        vi.mocked(useCapabilities).mockReturnValue({
            data: { [MOCK_CHAIN_ID]: { atomic: 'supported' } } as Record<number, unknown>,
        } as ReturnType<typeof useCapabilities>);

        renderPublicSubscription();

        await waitFor(
            () => {
                const calls = vi.mocked(readContract).mock.calls;
                expect(calls.some(([, opts]) => (opts as { functionName?: string }).functionName === 'balanceOf')).toBe(true);
            },
            { timeout: 5000 }
        );

        const subscribeBtn = screen.getByRole('button', { name: /subscribe/i });
        expect(subscribeBtn).not.toBeDisabled();

        const user = userEvent.setup();
        await user.click(subscribeBtn);

        await waitFor(
            () => {
                const allowanceCalls = vi.mocked(readContract).mock.calls.filter(([, opts]) => (opts as { functionName?: string }).functionName === 'allowance');
                expect(allowanceCalls.length).toBeGreaterThan(0);
            },
            { timeout: 2000 }
        );

        expect(mockSendCallsMutateAsync).toHaveBeenCalledTimes(1);
        const call = mockSendCallsMutateAsync.mock.calls[0][0];
        expect(call.calls).toHaveLength(2);
        expect(call.chainId).toBe(MOCK_CHAIN_ID);
        expect(call.account).toBe(MOCK_ACCOUNT);
        expect(call.calls[0].functionName).toBe('approve');
        expect(call.calls[1].functionName).toBe('subscribe');
        expect(mockMutate).not.toHaveBeenCalled();
    });

    it('fallback path: when no capabilities and low allowance, calls writeContract with approve', async () => {
        vi.mocked(useCapabilities).mockReturnValue({ data: {} } as ReturnType<typeof useCapabilities>);

        renderPublicSubscription();

        await waitFor(
            () => {
                const calls = vi.mocked(readContract).mock.calls;
                expect(calls.some(([, opts]) => (opts as { functionName?: string }).functionName === 'balanceOf')).toBe(true);
            },
            { timeout: 5000 }
        );

        const subscribeBtn = screen.getByRole('button', { name: /subscribe/i });
        const user = userEvent.setup();
        await user.click(subscribeBtn);

        await waitFor(
            () => {
                expect(mockMutate).toHaveBeenCalledWith(
                    expect.objectContaining({
                        functionName: 'approve',
                        address: MOCK_TOKEN,
                        args: [MOCK_CONTRACT, expect.any(BigInt)],
                    })
                );
            },
            { timeout: 3000 }
        );
    });

    it('fallback path: full two-step flow — approve then subscribe after receipt', async () => {
        vi.mocked(useCapabilities).mockReturnValue({ data: {} } as ReturnType<typeof useCapabilities>);
        setupReadContractAllowanceFirstLowThenHigh();

        let waitReceiptCallCount = 0;
        vi.mocked(useWaitForTransactionReceipt).mockImplementation(() => {
            waitReceiptCallCount++;
            return {
                isLoading: false,
                isSuccess: waitReceiptCallCount > 1,
                data: undefined,
            } as ReturnType<typeof useWaitForTransactionReceipt>;
        });

        renderPublicSubscription();

        await waitFor(
            () => {
                const calls = vi.mocked(readContract).mock.calls;
                expect(calls.some(([, opts]) => (opts as { functionName?: string }).functionName === 'balanceOf')).toBe(true);
            },
            { timeout: 5000 }
        );

        const subscribeBtn = screen.getByRole('button', { name: /subscribe/i });
        const user = userEvent.setup();
        await user.click(subscribeBtn);

        await waitFor(
            () => {
                expect(mockMutate).toHaveBeenCalledWith(
                    expect.objectContaining({
                        functionName: 'approve',
                        address: MOCK_TOKEN,
                    })
                );
            },
            { timeout: 3000 }
        );

        await waitFor(
            () => {
                expect(mockMutate).toHaveBeenCalledWith(
                    expect.objectContaining({
                        functionName: 'subscribe',
                        address: MOCK_CONTRACT,
                    })
                );
            },
            { timeout: 3000 }
        );
        expect(mockMutate).toHaveBeenCalledTimes(2);
    });

    it('fallback path: when sendCalls fails, calls writeContract with approve', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        vi.mocked(useCapabilities).mockReturnValue({
            data: { [MOCK_CHAIN_ID]: { atomic: 'supported' } } as Record<number, unknown>,
        } as ReturnType<typeof useCapabilities>);
        mockSendCallsMutateAsync.mockRejectedValueOnce(new Error('Method not supported'));

        renderPublicSubscription();

        await waitFor(
            () => {
                const calls = vi.mocked(readContract).mock.calls;
                expect(calls.some(([, opts]) => (opts as { functionName?: string }).functionName === 'balanceOf')).toBe(true);
            },
            { timeout: 5000 }
        );

        const subscribeBtn = screen.getByRole('button', { name: /subscribe/i });
        const user = userEvent.setup();
        await user.click(subscribeBtn);

        await waitFor(
            () => {
                expect(mockMutate).toHaveBeenCalledWith(
                    expect.objectContaining({
                        functionName: 'approve',
                    })
                );
            },
            { timeout: 3000 }
        );
        warnSpy.mockRestore();
    });

    it('insufficient balance: does not call sendCalls or writeContract when balance re-check fails', async () => {
        vi.mocked(useCapabilities).mockReturnValue({ data: {} } as ReturnType<typeof useCapabilities>);
        setupReadContract();

        renderPublicSubscription();

        await waitFor(
            () => {
                const calls = vi.mocked(readContract).mock.calls;
                expect(calls.some(([, opts]) => (opts as { functionName?: string }).functionName === 'balanceOf')).toBe(true);
            },
            { timeout: 5000 }
        );

        const subscribeBtn = screen.getByRole('button', { name: /subscribe/i });
        await waitFor(() => expect(subscribeBtn).not.toBeDisabled(), { timeout: 3000 });

        vi.mocked(readContract).mockImplementation(((_config: unknown, opts: unknown) => {
            const o = opts as { functionName?: string };
            if (o.functionName === 'idSubMap') return Promise.resolve(mockSubscriptionResult) as ReturnType<typeof readContract>;
            if (o.functionName === 'getSubscribersById') return Promise.resolve([]) as ReturnType<typeof readContract>;
            if (o.functionName === 'balanceOf') return Promise.resolve(0n) as ReturnType<typeof readContract>;
            if (o.functionName === 'allowance') return Promise.resolve(mockAllowance) as ReturnType<typeof readContract>;
            return Promise.resolve(null) as ReturnType<typeof readContract>;
        }) as typeof readContract);

        const user = userEvent.setup();
        await user.click(subscribeBtn);

        await waitFor(() => {
            expect(mockMutate).not.toHaveBeenCalled();
            expect(mockSendCallsMutateAsync).not.toHaveBeenCalled();
        }, { timeout: 2000 });

        const allowanceCalls = vi.mocked(readContract).mock.calls.filter(
            ([, opts]) => (opts as { functionName?: string }).functionName === 'allowance'
        );
        expect(allowanceCalls.length).toBe(0);
    });

    it('single-call path: when allowance sufficient, calls writeContract with subscribe only', async () => {
        mockAllowance = ALLOWANCE_THRESHOLD + 1n;
        vi.mocked(useCapabilities).mockReturnValue({ data: {} } as ReturnType<typeof useCapabilities>);

        renderPublicSubscription();

        await waitFor(
            () => {
                const calls = vi.mocked(readContract).mock.calls;
                expect(calls.some(([, opts]) => (opts as { functionName?: string }).functionName === 'balanceOf')).toBe(true);
            },
            { timeout: 5000 }
        );

        const subscribeBtn = screen.getByRole('button', { name: /subscribe/i });
        const user = userEvent.setup();
        await user.click(subscribeBtn);

        await waitFor(
            () => {
                expect(mockMutate).toHaveBeenCalledTimes(1);
                expect(mockMutate).toHaveBeenCalledWith(
                    expect.objectContaining({
                        functionName: 'subscribe',
                        address: MOCK_CONTRACT,
                    })
                );
            },
            { timeout: 3000 }
        );
    });

    it('batch path: when calls status succeeds, navigates to subscribed', async () => {
        vi.mocked(useCapabilities).mockReturnValue({
            data: { [MOCK_CHAIN_ID]: { atomic: 'supported' } } as Record<number, unknown>,
        } as ReturnType<typeof useCapabilities>);
        vi.mocked(useWaitForCallsStatus).mockReturnValue({
            isSuccess: true,
            isFetching: false,
            data: { status: 'CONFIRMED', receipts: [] },
        } as ReturnType<typeof useWaitForCallsStatus>);

        renderPublicSubscription();

        await waitFor(
            () => {
                const calls = vi.mocked(readContract).mock.calls;
                expect(calls.some(([, opts]) => (opts as { functionName?: string }).functionName === 'balanceOf')).toBe(true);
            },
            { timeout: 5000 }
        );

        const subscribeBtn = screen.getByRole('button', { name: /subscribe/i });
        const user = userEvent.setup();
        await user.click(subscribeBtn);

        await waitFor(
            () => {
                expect(mockSendCallsMutateAsync).toHaveBeenCalledTimes(1);
                expect(mockMutate).not.toHaveBeenCalled();
                expect(mockNavigate).toHaveBeenCalledWith('/subscriptions/subscribed');
            },
            { timeout: 3000 }
        );
    });
});
