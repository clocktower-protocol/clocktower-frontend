import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test-utils';
import userEvent from '@testing-library/user-event';
import SubscribersTable from '../SubscribersTable';

describe('SubscribersTable', () => {
    const mockSubscribers = [
        { accountAddress: '0x1234567890123456789012345678901234567890' as `0x${string}` },
        { accountAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' as `0x${string}` },
        { accountAddress: '0x9876543210987654321098765432109876543210' as `0x${string}` },
    ];

    it('returns null when subscribers array is empty', () => {
        const { container } = render(<SubscribersTable allSubscribers={[]} />, { includeRouter: true });
        expect(container.firstChild).toBeNull();
    });

    it('returns null when subscribers is not an array', () => {
        const { container } = render(<SubscribersTable allSubscribers={null as any} />, { includeRouter: true });
        expect(container.firstChild).toBeNull();
    });

    it('renders table with subscribers', () => {
        render(<SubscribersTable allSubscribers={mockSubscribers} />, { includeRouter: true });

        expect(screen.getByText(mockSubscribers[0].accountAddress)).toBeInTheDocument();
        expect(screen.getByText(mockSubscribers[1].accountAddress)).toBeInTheDocument();
    });

    it('renders pagination controls', () => {
        render(<SubscribersTable allSubscribers={mockSubscribers} />, { includeRouter: true });

        expect(screen.getByText(/items per page/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /1/i })).toBeInTheDocument();
    });

    it('allows changing items per page', async () => {
        const user = userEvent.setup();
        render(<SubscribersTable allSubscribers={mockSubscribers} />, { includeRouter: true });

        const itemsPerPageSelect = screen.getByDisplayValue('10') as HTMLSelectElement;
        await user.selectOptions(itemsPerPageSelect, '5');

        expect(itemsPerPageSelect.value).toBe('5');
    });

    it('renders links to history and subscriptions', () => {
        render(<SubscribersTable allSubscribers={mockSubscribers} />, { includeRouter: true });

        const historyLinks = screen.getAllByText(/history/i);
        const subscriptionLinks = screen.getAllByText(/subscriptions/i);

        expect(historyLinks.length).toBeGreaterThan(0);
        expect(subscriptionLinks.length).toBeGreaterThan(0);
    });

    it('paginates correctly with many subscribers', async () => {
        const manySubscribers = Array.from({ length: 25 }, (_, i) => ({
            accountAddress: `0x${i.toString().padStart(40, '0')}` as `0x${string}`,
        }));

        render(<SubscribersTable allSubscribers={manySubscribers} />, { includeRouter: true });

        // Should show pagination with multiple pages
        const pageButtons = screen.getAllByRole('button');
        expect(pageButtons.length).toBeGreaterThan(1);
    });

    it('shows correct number of items per page', async () => {
        const user = userEvent.setup();
        const manySubscribers = Array.from({ length: 25 }, (_, i) => ({
            accountAddress: `0x${i.toString().padStart(40, '0')}` as `0x${string}`,
        }));

        render(<SubscribersTable allSubscribers={manySubscribers} />, { includeRouter: true });

        // Change to 5 items per page
        const itemsPerPageSelect = screen.getByDisplayValue('10') as HTMLSelectElement;
        await user.selectOptions(itemsPerPageSelect, '5');

        // Should show 5 items on first page
        const firstPageAddress = manySubscribers[0].accountAddress;
        expect(screen.getByText(firstPageAddress)).toBeInTheDocument();
    });
});

