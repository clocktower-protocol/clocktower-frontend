import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../test-utils';
import userEvent from '@testing-library/user-event';
import EditDetailsForm from '../EditDetailsForm';
import { Subscription, DetailsLog, SubscriptionEditResult } from '../../types/subscription';

// Mock the config
vi.mock('../../config', () => ({
    TOKEN_LOOKUP: [
        { address: '0x123' as `0x${string}`, ticker: 'ETH', decimals: 18, icon: () => null, chain: 8453 },
    ],
    FREQUENCY_LOOKUP: [
        { index: 0, name: 'Weekly', name2: 'Week' },
        { index: 1, name: 'Monthly', name2: 'Month' },
    ],
    DAY_OF_WEEK_LOOKUP: [
        { index: 0, name: 'sunday' },
        { index: 1, name: 'monday' },
    ],
}));

describe('EditDetailsForm', () => {
    const mockSetEditResult = vi.fn();
    
    const mockSubscription: Subscription = {
        id: '0x123' as `0x${string}`,
        amount: BigInt('1000000000000000000'), // 1 ETH
        token: '0x123' as `0x${string}`,
        frequency: 1,
        dueDay: 1,
        provider: '0x456' as `0x${string}`,
    };

    const mockPreEditDetails: DetailsLog = {
        description: 'Test Description',
        url: 'https://example.com',
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the form with initial values', () => {
        render(
            <EditDetailsForm
                editSub={mockSubscription}
                preEditDetails={mockPreEditDetails}
                setEditResult={mockSetEditResult}
            />
        );

        expect(screen.getByLabelText(/token/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/frequency/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/day/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/url/i)).toBeInTheDocument();
    });

    it('displays disabled fields with subscription data', () => {
        render(
            <EditDetailsForm
                editSub={mockSubscription}
                preEditDetails={mockPreEditDetails}
                setEditResult={mockSetEditResult}
            />
        );

        const tokenField = screen.getByLabelText(/token/i) as HTMLInputElement;
        const amountField = screen.getByLabelText(/amount/i) as HTMLInputElement;
        expect(tokenField).toBeDisabled();
        expect(amountField).toBeDisabled();
        expect(tokenField.placeholder).toBe('ETH');
        expect(amountField.placeholder).toContain('1');
    });

    it('validates description length', async () => {
        const user = userEvent.setup();
        render(
            <EditDetailsForm
                editSub={mockSubscription}
                preEditDetails={mockPreEditDetails}
                setEditResult={mockSetEditResult}
            />
        );

        const descriptionInput = screen.getByLabelText(/description/i) as HTMLInputElement;
        const longDescription = 'a'.repeat(256);

        await user.clear(descriptionInput);
        await user.type(descriptionInput, longDescription);

        expect(descriptionInput).toHaveClass('is-invalid');
        expect(screen.getByText(/description must be under 255 characters/i)).toBeInTheDocument();
    });

    it('validates URL format', async () => {
        const user = userEvent.setup();
        render(
            <EditDetailsForm
                editSub={mockSubscription}
                preEditDetails={mockPreEditDetails}
                setEditResult={mockSetEditResult}
            />
        );

        const urlInput = screen.getByLabelText(/url/i) as HTMLInputElement;
        
        await user.clear(urlInput);
        await user.type(urlInput, 'invalid-url');

        expect(urlInput).toHaveClass('is-invalid');
        expect(screen.getByText(/please provide a valid url/i)).toBeInTheDocument();
    });

    it('accepts valid URL', async () => {
        const user = userEvent.setup();
        render(
            <EditDetailsForm
                editSub={mockSubscription}
                preEditDetails={mockPreEditDetails}
                setEditResult={mockSetEditResult}
            />
        );

        const urlInput = screen.getByLabelText(/url/i) as HTMLInputElement;
        
        await user.clear(urlInput);
        await user.type(urlInput, 'https://valid-url.com');

        expect(urlInput).toHaveClass('is-valid');
    });

    it('accepts empty description and URL', async () => {
        const user = userEvent.setup();
        render(
            <EditDetailsForm
                editSub={mockSubscription}
                preEditDetails={mockPreEditDetails}
                setEditResult={mockSetEditResult}
            />
        );

        const descriptionInput = screen.getByLabelText(/description/i) as HTMLInputElement;
        const urlInput = screen.getByLabelText(/url/i) as HTMLInputElement;

        await user.clear(descriptionInput);
        await user.clear(urlInput);

        // Empty fields should not be invalid
        expect(descriptionInput).not.toHaveClass('is-invalid');
        expect(urlInput).not.toHaveClass('is-invalid');
    });

    it('submits form with valid data', async () => {
        const user = userEvent.setup();
        render(
            <EditDetailsForm
                editSub={mockSubscription}
                preEditDetails={mockPreEditDetails}
                setEditResult={mockSetEditResult}
            />
        );

        const submitButton = screen.getByRole('button', { name: /submit/i });
        
        // Form should be valid with initial data
        await user.click(submitButton);

        expect(mockSetEditResult).toHaveBeenCalledWith({
            details: {
                description: 'Test Description',
                url: 'https://example.com',
            },
            id: '0x123',
        });
    });

    it('updates description and URL on change', async () => {
        const user = userEvent.setup();
        render(
            <EditDetailsForm
                editSub={mockSubscription}
                preEditDetails={mockPreEditDetails}
                setEditResult={mockSetEditResult}
            />
        );

        const descriptionInput = screen.getByLabelText(/description/i) as HTMLInputElement;
        const urlInput = screen.getByLabelText(/url/i) as HTMLInputElement;

        await user.clear(descriptionInput);
        await user.type(descriptionInput, 'New Description');
        
        await user.clear(urlInput);
        await user.type(urlInput, 'https://new-url.com');

        const submitButton = screen.getByRole('button', { name: /submit/i });
        await user.click(submitButton);

        expect(mockSetEditResult).toHaveBeenCalledWith({
            details: {
                description: 'New Description',
                url: 'https://new-url.com',
            },
            id: '0x123',
        });
    });

    it('disables submit button when form is invalid', async () => {
        const user = userEvent.setup();
        render(
            <EditDetailsForm
                editSub={mockSubscription}
                preEditDetails={mockPreEditDetails}
                setEditResult={mockSetEditResult}
            />
        );

        const descriptionInput = screen.getByLabelText(/description/i) as HTMLInputElement;
        const submitButton = screen.getByRole('button', { name: /submit/i });

        // Make description invalid
        await user.clear(descriptionInput);
        await user.type(descriptionInput, 'a'.repeat(256));

        expect(submitButton).toBeDisabled();
    });
});

