import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../test-utils';
import userEvent from '@testing-library/user-event';
import SubscriptionCards from '../SubscriptionCards';
import { SubView, DetailsLog } from '../../types/subscription';

// Mock react-router useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react-router')>();
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Mock config
vi.mock('../../config', () => ({
    TOKEN_LOOKUP: [
        { address: '0x123' as `0x${string}`, ticker: 'ETH', decimals: 18, icon: () => null, chain: 8453 },
        { address: '0x456' as `0x${string}`, ticker: 'USDC', decimals: 6, icon: () => null, chain: 8453 },
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
    DOMAIN: 'https://test.example.com',
}));

describe('SubscriptionCards', () => {
    const mockSubscription: SubView = {
        subscription: {
            id: '0x1234567890123456789012345678901234567890123456789012345678901234' as `0x${string}`,
            amount: BigInt('1000000000000000000'), // 1 ETH
            token: '0x123' as `0x${string}`,
            frequency: 1, // Monthly
            dueDay: 15,
            provider: '0xprovider123' as `0x${string}`,
            cancelled: false,
        },
        status: 0, // Active (status < 1 means active in the component logic)
        totalSubscribers: 5,
    };

    const mockDetails: DetailsLog = {
        internal_id: '0x123',
        provider: '0xprovider123',
        timestamp: '1234567890',
        url: 'https://example.com',
        description: 'Test Subscription',
        blockNumber: '100',
        blockTimestamp: '1234567890',
        transactionHash: '0xabc',
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns null when subscription array is empty', () => {
        const { container } = render(
            <SubscriptionCards
                subscriptionArray={[]}
                detailsArray={[]}
            />
        );
        expect(container.firstChild).toBeNull();
    });

    it('returns null when subscription array is not an array', () => {
        const { container } = render(
            <SubscriptionCards
                subscriptionArray={null as any}
                detailsArray={[]}
            />
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders subscription card in carousel mode', () => {
        render(
            <SubscriptionCards
                subscriptionArray={[mockSubscription]}
                detailsArray={[mockDetails]}
            />,
            { includeRouter: true }
        );

        expect(screen.getByText('Test Subscription')).toBeInTheDocument();
        expect(screen.getByText(/1 ETH/i)).toBeInTheDocument();
        expect(screen.getByText(/15th Day of the Month/i)).toBeInTheDocument();
    });

    it('renders subscription card in link mode', () => {
        const { container } = render(
            <SubscriptionCards
                subscriptionArray={[mockSubscription]}
                detailsArray={[mockDetails]}
                isLink={true}
            />,
            { includeRouter: true }
        );

        expect(screen.getByText('Test Subscription')).toBeInTheDocument();
        // In link mode, should show URL and Provider
        const urlElements = screen.getAllByText(/url/i);
        expect(urlElements.length).toBeGreaterThan(0);
        // Should not have carousel in link mode
        expect(container.querySelector('.carousel')).not.toBeInTheDocument();
    });

    it('renders carousel when not in link mode', () => {
        const { container } = render(
            <SubscriptionCards
                subscriptionArray={[mockSubscription]}
                detailsArray={[mockDetails]}
                isLink={false}
            />,
            { includeRouter: true }
        );

        // Carousel should be rendered
        const carousel = container.querySelector('.carousel');
        expect(carousel).toBeInTheDocument();
    });

    it('renders provider buttons when isProvider is true', async () => {
        const mockSetCancelledSub = vi.fn();
        const mockSetEditSubParams = vi.fn();
        const mockSetLinkDisplayed = vi.fn();

        render(
            <SubscriptionCards
                subscriptionArray={[mockSubscription]}
                detailsArray={[mockDetails]}
                isProvider={true}
                setCancelledSub={mockSetCancelledSub}
                setEditSubParams={mockSetEditSubParams}
                setLinkDisplayed={mockSetLinkDisplayed}
            />,
            { includeRouter: true }
        );

        expect(screen.getByRole('button', { name: /history/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /link/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('calls setCancelledSub when cancel button is clicked', async () => {
        const user = userEvent.setup();
        const mockSetCancelledSub = vi.fn();

        render(
            <SubscriptionCards
                subscriptionArray={[mockSubscription]}
                detailsArray={[mockDetails]}
                isProvider={true}
                setCancelledSub={mockSetCancelledSub}
            />,
            { includeRouter: true }
        );

        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        await user.click(cancelButton);

        expect(mockSetCancelledSub).toHaveBeenCalledWith(mockSubscription.subscription);
    });

    it('calls setEditSubParams when edit button is clicked', async () => {
        const user = userEvent.setup();
        const mockSetEditSubParams = vi.fn();

        render(
            <SubscriptionCards
                subscriptionArray={[mockSubscription]}
                detailsArray={[mockDetails]}
                isProvider={true}
                setEditSubParams={mockSetEditSubParams}
            />,
            { includeRouter: true }
        );

        const editButton = screen.getByRole('button', { name: /edit/i });
        await user.click(editButton);

        expect(mockSetEditSubParams).toHaveBeenCalledWith({
            id: mockSubscription.subscription.id,
            f: mockSubscription.subscription.frequency,
            d: mockSubscription.subscription.dueDay,
        });
    });

    it('renders subscriber buttons when not provider', async () => {
        const mockSetUnsubscribedSub = vi.fn();

        render(
            <SubscriptionCards
                subscriptionArray={[mockSubscription]}
                detailsArray={[mockDetails]}
                isProvider={false}
                setUnsubscribedSub={mockSetUnsubscribedSub}
            />,
            { includeRouter: true }
        );

        expect(screen.getByRole('button', { name: /history/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /unsubscribe/i })).toBeInTheDocument();
    });

    it('calls setUnsubscribedSub when unsubscribe button is clicked', async () => {
        const user = userEvent.setup();
        const mockSetUnsubscribedSub = vi.fn();

        render(
            <SubscriptionCards
                subscriptionArray={[mockSubscription]}
                detailsArray={[mockDetails]}
                isProvider={false}
                setUnsubscribedSub={mockSetUnsubscribedSub}
            />,
            { includeRouter: true }
        );

        const unsubscribeButton = screen.getByRole('button', { name: /unsubscribe/i });
        await user.click(unsubscribeButton);

        expect(mockSetUnsubscribedSub).toHaveBeenCalledWith(mockSubscription.subscription);
    });

    it('renders subscribe button when isLink and not subscribed', () => {
        const mockSubscribe = vi.fn();

        render(
            <SubscriptionCards
                subscriptionArray={[mockSubscription]}
                detailsArray={[mockDetails]}
                isLink={true}
                isSubscribed={false}
                isProvider={false}
                subscribe={mockSubscribe}
                hasEnoughBalance={true}
            />,
            { includeRouter: true }
        );

        expect(screen.getByRole('button', { name: /subscribe/i })).toBeInTheDocument();
    });

    it('disables subscribe button when hasEnoughBalance is false', () => {
        const mockSubscribe = vi.fn();

        render(
            <SubscriptionCards
                subscriptionArray={[mockSubscription]}
                detailsArray={[mockDetails]}
                isLink={true}
                isSubscribed={false}
                isProvider={false}
                subscribe={mockSubscribe}
                hasEnoughBalance={false}
            />,
            { includeRouter: true }
        );

        const subscribeButton = screen.getByRole('button', { name: /insufficient balance/i });
        expect(subscribeButton).toBeDisabled();
        expect(screen.getByText(/you don't have enough tokens to subscribe/i)).toBeInTheDocument();
    });

    it('calls subscribe when subscribe button is clicked', async () => {
        const user = userEvent.setup();
        const mockSubscribe = vi.fn();

        render(
            <SubscriptionCards
                subscriptionArray={[mockSubscription]}
                detailsArray={[mockDetails]}
                isLink={true}
                isSubscribed={false}
                isProvider={false}
                subscribe={mockSubscribe}
                hasEnoughBalance={true}
            />,
            { includeRouter: true }
        );

        const subscribeButton = screen.getByRole('button', { name: /subscribe/i });
        await user.click(subscribeButton);

        expect(mockSubscribe).toHaveBeenCalled();
    });

    it('displays weekly frequency correctly', () => {
        const weeklySubscription: SubView = {
            ...mockSubscription,
            subscription: {
                ...mockSubscription.subscription,
                frequency: 0, // Weekly
                dueDay: 1, // Monday
            },
        };

        render(
            <SubscriptionCards
                subscriptionArray={[weeklySubscription]}
                detailsArray={[mockDetails]}
            />,
            { includeRouter: true }
        );

        expect(screen.getByText(/every monday/i)).toBeInTheDocument();
    });

    it('displays monthly frequency correctly', () => {
        render(
            <SubscriptionCards
                subscriptionArray={[mockSubscription]}
                detailsArray={[mockDetails]}
            />,
            { includeRouter: true }
        );

        expect(screen.getByText(/15th Day of the Month/i)).toBeInTheDocument();
    });

    it('displays subscriber count for provider view', () => {
        render(
            <SubscriptionCards
                subscriptionArray={[mockSubscription]}
                detailsArray={[mockDetails]}
                isProvider={true}
            />,
            { includeRouter: true }
        );

        // Subscriber count should be in a link when > 0
        const subscriberLink = screen.getByRole('link', { name: /5/i });
        expect(subscriberLink).toBeInTheDocument();
        expect(screen.getByText(/subscribers/i)).toBeInTheDocument();
    });

    it('displays pay per period for provider view', () => {
        render(
            <SubscriptionCards
                subscriptionArray={[mockSubscription]}
                detailsArray={[mockDetails]}
                isProvider={true}
            />,
            { includeRouter: true }
        );

        // 5 subscribers * 1 ETH = 5 ETH
        expect(screen.getByText(/pay per period/i)).toBeInTheDocument();
    });

    it('handles missing URL gracefully', () => {
        const detailsWithoutUrl: DetailsLog = {
            ...mockDetails,
            url: '',
        };

        render(
            <SubscriptionCards
                subscriptionArray={[mockSubscription]}
                detailsArray={[detailsWithoutUrl]}
                isLink={true}
            />,
            { includeRouter: true }
        );

        expect(screen.getByText('---')).toBeInTheDocument();
    });

    it('handles missing description gracefully', () => {
        const detailsWithoutDesc: DetailsLog = {
            ...mockDetails,
            description: '',
        };

        render(
            <SubscriptionCards
                subscriptionArray={[mockSubscription]}
                detailsArray={[detailsWithoutDesc]}
            />,
            { includeRouter: true }
        );

        expect(screen.getByText('---')).toBeInTheDocument();
    });

    it('navigates to history when history button is clicked', async () => {
        const user = userEvent.setup();

        render(
            <SubscriptionCards
                subscriptionArray={[mockSubscription]}
                detailsArray={[mockDetails]}
                isProvider={true}
            />,
            { includeRouter: true }
        );

        const historyButton = screen.getByRole('button', { name: /history/i });
        await user.click(historyButton);

        expect(mockNavigate).toHaveBeenCalledWith(`../history/${mockSubscription.subscription.id}`);
    });

    it('does not render cancelled subscriptions', () => {
        const cancelledSubscription: SubView = {
            ...mockSubscription,
            status: 1, // Cancelled (status >= 1 means cancelled)
        };

        const { container } = render(
            <SubscriptionCards
                subscriptionArray={[cancelledSubscription]}
                detailsArray={[mockDetails]}
            />,
            { includeRouter: true }
        );

        // Should not render the subscription card
        expect(screen.queryByText('Test Subscription')).not.toBeInTheDocument();
    });

    it('renders multiple cards in carousel', () => {
        const subscription2: SubView = {
            ...mockSubscription,
            subscription: {
                ...mockSubscription.subscription,
                id: '0x9876543210987654321098765432109876543210987654321098765432109876' as `0x${string}`,
            },
        };

        const details2: DetailsLog = {
            ...mockDetails,
            description: 'Second Subscription',
        };

        render(
            <SubscriptionCards
                subscriptionArray={[mockSubscription, subscription2]}
                detailsArray={[mockDetails, details2]}
            />,
            { includeRouter: true }
        );

        expect(screen.getByText('Test Subscription')).toBeInTheDocument();
        expect(screen.getByText('Second Subscription')).toBeInTheDocument();
    });
});

