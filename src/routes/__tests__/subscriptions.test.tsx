import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '../../test-utils';
import userEvent from '@testing-library/user-event';
import { act } from '@testing-library/react';
import { createMemoryRouter, RouterProvider, Outlet } from 'react-router';
import Subscriptions from '../subscriptions';
import type { SubView, DetailsLog, SubscriptionResult } from '../../types/subscription';

const MOCK_ACCOUNT = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' as `0x${string}`;
const MOCK_CHAIN_ID = 84532;
const MOCK_CONTRACT = '0x6A0791Cd884f2199dC8F372f6715f675D2950922' as `0x${string}`;
const MOCK_SUB_ID = '0x1234567890123456789012345678901234567890123456789012345678901234' as `0x${string}`;
const MOCK_TOKEN = '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as `0x${string}`;
const MOCK_PROVIDER = '0xprovider0000000000000000000000000000000001' as `0x${string}`;

const mockMutate = vi.fn();

const oneSubView: SubView = {
    subscription: {
        id: MOCK_SUB_ID,
        amount: BigInt('1000000000000000000'),
        provider: MOCK_PROVIDER,
        token: MOCK_TOKEN,
        cancelled: false,
        frequency: 1,
        dueDay: 15,
    },
    status: 0,
    totalSubscribers: 0,
};

const oneDetailsLog: DetailsLog = {
    internal_id: MOCK_SUB_ID.toLowerCase(),
    provider: MOCK_PROVIDER,
    timestamp: '1234567890',
    url: 'https://example.com',
    description: 'Test subscription',
    blockNumber: '100',
    blockTimestamp: '1234567890',
    transactionHash: '0xabc',
};

vi.mock('wagmi', async (importOriginal) => {
    const actual = await importOriginal<typeof import('wagmi')>();
    return {
        ...actual,
        useConnection: vi.fn(() => ({
            address: MOCK_ACCOUNT,
            chainId: MOCK_CHAIN_ID,
        })),
        useWriteContract: vi.fn(() => ({
            mutate: mockMutate,
            data: undefined,
        })),
        useWaitForTransactionReceipt: vi.fn(() => ({
            isLoading: false,
            isSuccess: false,
        })),
    };
});

vi.mock('wagmi/actions', () => ({
    readContract: vi.fn(),
}));

vi.mock('../../wagmiconfig', () => ({
    config: {},
}));

vi.mock('../../config', () => ({
    CLOCKTOWERSUB_ABI: [],
    CHAIN_LOOKUP: [
        { id: 84532, contractAddress: '0x6A0791Cd884f2199dC8F372f6715f675D2950922' },
    ],
    TOKEN_LOOKUP: [
        { address: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', ticker: 'USDC', decimals: 6, icon: () => null, chain: 84532 },
    ],
    FREQUENCY_LOOKUP: [
        { index: 0, name: 'Weekly', name2: 'Week' },
        { index: 1, name: 'Monthly', name2: 'Month' },
        { index: 2, name: 'Quarterly', name2: 'Quarter' },
    ],
    DAY_OF_WEEK_LOOKUP: [
        { index: 0, name: 'sunday' },
        { index: 1, name: 'monday' },
        { index: 2, name: 'tuesday' },
        { index: 3, name: 'wednesday' },
        { index: 4, name: 'thursday' },
        { index: 5, name: 'friday' },
        { index: 6, name: 'saturday' },
    ],
    DUEDAY_RANGE: [
        { frequency: 0, start: 1, stop: 7 },
        { frequency: 1, start: 1, stop: 28 },
        { frequency: 2, start: 1, stop: 90 },
        { frequency: 3, start: 1, stop: 365 },
    ],
    DOMAIN: 'https://test.example.com',
}));

vi.mock('@apollo/client/react', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@apollo/client/react')>();
    const mockDetailsLog = {
        internal_id: '0x1234567890123456789012345678901234567890123456789012345678901234',
        provider: '0xprovider0000000000000000000000000000000001',
        timestamp: '1234567890',
        url: 'https://example.com',
        description: 'Test subscription',
        blockNumber: '100',
        blockTimestamp: '1234567890',
        transactionHash: '0xabc',
    };
    const stableQuery = vi.fn().mockResolvedValue({
        data: { detailsLogs: [mockDetailsLog] },
    });
    const stableClient = { query: stableQuery };
    return {
        ...actual,
        useApolloClient: vi.fn(() => stableClient),
    };
});

import { readContract } from 'wagmi/actions';

function setupReadContract(opts?: { subscribedList?: SubView[] }) {
    const subscribedList = opts?.subscribedList ?? [];
    const idSubMapResult: SubscriptionResult = [
        oneSubView.subscription.id,
        oneSubView.subscription.amount,
        oneSubView.subscription.provider,
        oneSubView.subscription.token,
        oneSubView.subscription.cancelled,
        oneSubView.subscription.frequency,
        oneSubView.subscription.dueDay,
    ];
    vi.mocked(readContract).mockImplementation(((_config: unknown, o: unknown) => {
        const opt = o as { functionName?: string; args?: unknown[] };
        if (opt.functionName === 'getAccountSubscriptions' && opt.args?.[0] === false) {
            return Promise.resolve([oneSubView]) as ReturnType<typeof readContract>;
        }
        if (opt.functionName === 'getAccountSubscriptions' && opt.args?.[0] === true) {
            return Promise.resolve(subscribedList) as ReturnType<typeof readContract>;
        }
        if (opt.functionName === 'idSubMap') {
            return Promise.resolve(idSubMapResult) as ReturnType<typeof readContract>;
        }
        // CreateSubForm: approvedERC20(tokenAddress) -> [address, decimals, approved, minimum]
        if (opt.functionName === 'approvedERC20') {
            return Promise.resolve([MOCK_TOKEN, 6, true, BigInt(0)]) as ReturnType<typeof readContract>;
        }
        return Promise.resolve(null) as ReturnType<typeof readContract>;
    }) as typeof readContract);
}

function renderSubscriptions(initialEntries: string[] = ['/subscriptions/created']) {
    const router = createMemoryRouter(
        [
            {
                path: '/',
                element: <Outlet context={[]} />,
                children: [
                    {
                        path: 'subscriptions/:t',
                        element: <Subscriptions />,
                    },
                ],
            },
        ],
        { initialEntries, initialIndex: 0 }
    );
    return render(<RouterProvider router={router} />, {
        includeWagmi: false,
        includeApollo: true,
    });
}

describe('Subscriptions mutate once', () => {
    beforeEach(() => {
        setupReadContract();
        mockMutate.mockClear();
    });

    it('calls writeContract.mutate exactly once when Cancel is clicked', async () => {
        renderSubscriptions();

        // Wait for subscription data to load and table with Cancel to render
        await waitFor(
            () => {
                expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
            },
            { timeout: 10000 }
        );

        const table = screen.getByRole('table');
        const cancelButton = within(table).getByRole('button', { name: /cancel/i });
        const user = userEvent.setup();

        await act(async () => {
            await user.click(cancelButton);
        });

        await waitFor(
            () => {
                expect(mockMutate).toHaveBeenCalled();
            },
            { timeout: 2000 }
        );
        expect(mockMutate).toHaveBeenCalledTimes(1);
        expect(mockMutate).toHaveBeenCalledWith(
            expect.objectContaining({
                functionName: 'cancelSubscription',
                address: MOCK_CONTRACT,
            })
        );
    }, 15000);

    it('calls writeContract.mutate exactly once when Create Subscription form is submitted', async () => {
        renderSubscriptions();

        await waitFor(
            () => {
                expect(screen.getByRole('button', { name: /create subscription/i })).toBeInTheDocument();
            },
            { timeout: 10000 }
        );

        const user = userEvent.setup();
        await user.click(screen.getByRole('button', { name: /create subscription/i }));

        await waitFor(
            () => {
                expect(screen.getByRole('button', { name: /select token/i })).toBeInTheDocument();
            },
            { timeout: 3000 }
        );

        const tokenDropdown = screen.getByRole('button', { name: /select token/i });
        await user.click(tokenDropdown);
        await user.click(screen.getByText('USDC'));

        await waitFor(
            () => {
                const amountInput = screen.getByLabelText(/amount/i);
                expect(amountInput).toBeInTheDocument();
            },
            { timeout: 2000 }
        );

        const amountInput = screen.getByLabelText(/amount/i);
        await user.type(amountInput, '1');

        const frequencySelect = screen.getByLabelText(/frequency/i);
        await user.selectOptions(frequencySelect, '1');

        const dueDaySelect = screen.getByLabelText(/due day/i);
        await user.selectOptions(dueDaySelect, '15');

        await user.type(screen.getByLabelText(/description/i), 'Test description');
        await user.type(screen.getByLabelText(/url/i), 'https://example.com');

        const submitBtn = screen.getByRole('button', { name: /submit/i });
        await user.click(submitBtn);

        await waitFor(
            () => {
                expect(mockMutate).toHaveBeenCalled();
            },
            { timeout: 3000 }
        );
        expect(mockMutate).toHaveBeenCalledTimes(1);
        expect(mockMutate).toHaveBeenCalledWith(
            expect.objectContaining({
                functionName: 'createSubscription',
                address: MOCK_CONTRACT,
            })
        );
    }, 20000);

    it('calls writeContract.mutate exactly once when Unsubscribe is clicked', async () => {
        setupReadContract({ subscribedList: [oneSubView] });
        renderSubscriptions(['/subscriptions/subscribed']);

        await waitFor(
            () => {
                expect(screen.getByRole('button', { name: /unsubscribe/i })).toBeInTheDocument();
            },
            { timeout: 10000 }
        );

        const table = screen.getByRole('table');
        const unsubscribeButton = within(table).getByRole('button', { name: /unsubscribe/i });
        const user = userEvent.setup();

        await act(async () => {
            await user.click(unsubscribeButton);
        });

        await waitFor(
            () => {
                expect(mockMutate).toHaveBeenCalled();
            },
            { timeout: 2000 }
        );
        expect(mockMutate).toHaveBeenCalledTimes(1);
        expect(mockMutate).toHaveBeenCalledWith(
            expect.objectContaining({
                functionName: 'unsubscribe',
                address: MOCK_CONTRACT,
            })
        );
    }, 15000);

    it('calls writeContract.mutate exactly once when Edit Details form is submitted', async () => {
        renderSubscriptions();

        await waitFor(
            () => {
                expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
            },
            { timeout: 10000 }
        );

        const table = screen.getByRole('table');
        const editButton = within(table).getByRole('button', { name: /edit/i });
        const user = userEvent.setup();
        await user.click(editButton);

        await waitFor(
            () => {
                expect(screen.getByText(/edit subscription/i)).toBeInTheDocument();
            },
            { timeout: 5000 }
        );

        const descriptionInput = screen.getByLabelText(/description/i);
        await user.clear(descriptionInput);
        await user.type(descriptionInput, 'Updated description');

        const submitBtn = screen.getByRole('button', { name: /submit/i });
        await user.click(submitBtn);

        await waitFor(
            () => {
                expect(mockMutate).toHaveBeenCalled();
            },
            { timeout: 3000 }
        );
        expect(mockMutate).toHaveBeenCalledTimes(1);
        expect(mockMutate).toHaveBeenCalledWith(
            expect.objectContaining({
                functionName: 'editDetails',
                address: MOCK_CONTRACT,
            })
        );
    }, 20000);
});
