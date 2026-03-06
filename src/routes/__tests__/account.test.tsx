import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../test-utils';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider, Outlet } from 'react-router';
import Account from '../account';

const MOCK_ACCOUNT = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' as `0x${string}`;
const MOCK_CHAIN_ID = 84532;
const MOCK_CONTRACT = '0x6A0791Cd884f2199dC8F372f6715f675D2950922' as `0x${string}`;

const mockMutate = vi.fn();

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
        useSignMessage: vi.fn(() => ({
            mutate: vi.fn(),
            data: undefined,
            variables: undefined,
        })),
    };
});

vi.mock('../wagmiconfig', () => ({
    config: {},
}));

vi.mock('../../config', () => ({
    CLOCKTOWERSUB_ABI: [],
    CHAIN_LOOKUP: [
        { id: 84532, contractAddress: '0x6A0791Cd884f2199dC8F372f6715f675D2950922' },
    ],
}));

vi.mock('@apollo/client/react', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@apollo/client/react')>();
    const mockProvDetails = {
        provider: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        timestamp: '1234567890',
        description: 'Test description',
        company: 'Test company',
        url: 'https://example.com',
        domain: 'example.com',
        email: 'test@example.com',
        misc: 'Test misc',
    };
    return {
        ...actual,
        useApolloClient: vi.fn(() => ({
            query: vi.fn().mockResolvedValue({
                data: { provDetailsLogs: [mockProvDetails] },
            }),
        })),
    };
});

const mockNavigate = vi.fn();
vi.mock('react-router', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react-router')>();
    return {
        ...actual,
        useOutletContext: vi.fn(() => [MOCK_ACCOUNT]),
        useNavigate: () => mockNavigate,
    };
});

function renderAccount() {
    const router = createMemoryRouter(
        [
            {
                path: '/',
                element: <Outlet context={[MOCK_ACCOUNT]} />,
                children: [
                    {
                        path: 'account/:a',
                        element: <Account />,
                    },
                ],
            },
        ],
        { initialEntries: [`/account/${MOCK_ACCOUNT}`], initialIndex: 0 }
    );
    return render(<RouterProvider router={router} />, {
        includeWagmi: false,
        includeApollo: true,
    });
}

describe('Account mutate once', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('calls writeContract.mutate exactly once when editing account details', async () => {
        renderAccount();

        await waitFor(
            () => {
                expect(screen.getByRole('button', { name: /edit details/i })).toBeInTheDocument();
            },
            { timeout: 5000 }
        );

        const user = userEvent.setup();

        await user.click(screen.getByRole('button', { name: /edit details/i }));
        await user.click(screen.getByRole('button', { name: /continue/i }));

        await waitFor(
            () => {
                expect(screen.getByRole('checkbox', { name: /i understand/i })).toBeInTheDocument();
            },
            { timeout: 2000 }
        );

        await user.click(screen.getByRole('checkbox', { name: /i understand/i }));
        await user.click(screen.getByRole('button', { name: /submit/i }));

        await waitFor(
            () => {
                expect(mockMutate).toHaveBeenCalled();
            },
            { timeout: 3000 }
        );
        expect(mockMutate).toHaveBeenCalledTimes(1);
        expect(mockMutate).toHaveBeenCalledWith(
            expect.objectContaining({
                functionName: 'editProvDetails',
                address: MOCK_CONTRACT,
            })
        );
    });
});
