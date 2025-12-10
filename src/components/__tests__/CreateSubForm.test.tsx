import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../test-utils';
import userEvent from '@testing-library/user-event';
import CreateSubForm from '../CreateSubForm';

// Mock wagmi
vi.mock('wagmi', async (importOriginal) => {
    const actual = await importOriginal<typeof import('wagmi')>();
    return {
        ...actual,
        useConnection: vi.fn(() => ({
            chainId: 8453,
        })),
    };
});

vi.mock('wagmi/actions', () => ({
    readContract: vi.fn(),
}));

vi.mock('../../wagmiconfig', () => ({
    config: {},
}));

// Mock the config
vi.mock('../../config', () => ({
    TOKEN_LOOKUP: [
        { 
            address: '0x123' as `0x${string}`, 
            ticker: 'ETH', 
            decimals: 18, 
            icon: () => null, 
            chain: 8453 
        },
        { 
            address: '0x456' as `0x${string}`, 
            ticker: 'USDC', 
            decimals: 6, 
            icon: () => null, 
            chain: 8453 
        },
    ],
    FREQUENCY_LOOKUP: [
        { index: 0, name: 'Weekly', name2: 'Week' },
        { index: 1, name: 'Monthly', name2: 'Month' },
    ],
    DUEDAY_RANGE: [
        { frequency: 0, start: 1, stop: 7 },
        { frequency: 1, start: 1, stop: 31 },
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
    CHAIN_LOOKUP: [
        { id: 8453, contractAddress: '0xabc' as `0x${string}` },
    ],
    CLOCKTOWERSUB_ABI: [],
}));

import { readContract } from 'wagmi/actions';

describe('CreateSubForm', () => {
    const mockSetChangedCreateSub = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(readContract).mockResolvedValue([
            '0x123' as `0x${string}`,
            18,
            true,
            BigInt('100000000000000000'), // 0.1 ETH minimum
        ] as any);
    });

    it('renders the form with all fields', () => {
        render(<CreateSubForm setChangedCreateSub={mockSetChangedCreateSub} />);

        // Token uses a Dropdown, so check for the label text and dropdown button
        expect(screen.getByText(/^token:$/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /select token/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/frequency/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/due day/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/url/i)).toBeInTheDocument();
    });

    it('disables submit button initially', () => {
        render(<CreateSubForm setChangedCreateSub={mockSetChangedCreateSub} />);

        const submitButton = screen.getByRole('button', { name: /submit/i });
        expect(submitButton).toBeDisabled();
    });

    it('validates amount field', async () => {
        const user = userEvent.setup();
        render(<CreateSubForm setChangedCreateSub={mockSetChangedCreateSub} />);

        const amountInput = screen.getByLabelText(/amount/i) as HTMLInputElement;

        // Initially amount should be invalid (no token selected and no value)
        expect(amountInput).toHaveClass('is-invalid');
        
        // Select a token first
        const tokenDropdown = screen.getByRole('button', { name: /select token/i });
        await user.click(tokenDropdown);
        
        // Click on the first token option (ETH)
        const tokenOption = screen.getByText(/ETH/i);
        await user.click(tokenOption);
        
        // Wait for token minimum to be fetched
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Test with invalid amount (too small - less than minimum)
        await user.clear(amountInput);
        await user.type(amountInput, '0.01'); // Less than 0.1 minimum
        
        expect(amountInput).toHaveClass('is-invalid');
        expect(screen.getByText(/must be greater than or equal to token minimum/i)).toBeInTheDocument();
        
        // Test with valid amount (greater than or equal to minimum)
        await user.clear(amountInput);
        await user.type(amountInput, '0.1'); // Equal to minimum
        
        expect(amountInput).toHaveClass('is-valid');
    });

    it('validates description length', async () => {
        const user = userEvent.setup();
        render(<CreateSubForm setChangedCreateSub={mockSetChangedCreateSub} />);

        const descriptionInput = screen.getByLabelText(/description/i) as HTMLInputElement;
        const longDescription = 'a'.repeat(256);

        await user.type(descriptionInput, longDescription);

        expect(descriptionInput).toHaveClass('is-invalid');
        expect(screen.getByText(/description must be under 255 characters/i)).toBeInTheDocument();
    });

    it('validates URL format', async () => {
        const user = userEvent.setup();
        render(<CreateSubForm setChangedCreateSub={mockSetChangedCreateSub} />);

        const urlInput = screen.getByLabelText(/url/i) as HTMLInputElement;

        await user.type(urlInput, 'invalid-url');

        expect(urlInput).toHaveClass('is-invalid');
        expect(screen.getByText(/please provide a valid url/i)).toBeInTheDocument();
    });

    it('accepts valid URL', async () => {
        const user = userEvent.setup();
        render(<CreateSubForm setChangedCreateSub={mockSetChangedCreateSub} />);

        const urlInput = screen.getByLabelText(/url/i) as HTMLInputElement;

        await user.type(urlInput, 'https://valid-url.com');

        expect(urlInput).toHaveClass('is-valid');
    });

    it('validates frequency selection', async () => {
        const user = userEvent.setup();
        render(<CreateSubForm setChangedCreateSub={mockSetChangedCreateSub} />);

        const frequencySelect = screen.getByLabelText(/frequency/i) as HTMLSelectElement;

        // Initially should have invalid frequency
        expect(frequencySelect).toHaveClass('is-invalid');
        
        // Select a frequency
        await user.selectOptions(frequencySelect, '1');

        expect(frequencySelect).toHaveClass('is-valid');
    });

    it('validates due day selection', async () => {
        const user = userEvent.setup();
        render(<CreateSubForm setChangedCreateSub={mockSetChangedCreateSub} />);

        const frequencySelect = screen.getByLabelText(/frequency/i) as HTMLSelectElement;
        const dueDaySelect = screen.getByLabelText(/due day/i) as HTMLSelectElement;

        // Select frequency first
        await user.selectOptions(frequencySelect, '1');
        
        // Then select due day
        await user.selectOptions(dueDaySelect, '1');

        expect(dueDaySelect).toHaveClass('is-valid');
    });

    it('requires frequency to be selected before due day options appear', async () => {
        const user = userEvent.setup();
        render(<CreateSubForm setChangedCreateSub={mockSetChangedCreateSub} />);

        const frequencySelect = screen.getByLabelText(/frequency/i) as HTMLSelectElement;
        const dueDaySelect = screen.getByLabelText(/due day/i) as HTMLSelectElement;

        // Initially, due day should only have "Select Day" option
        expect(dueDaySelect.options.length).toBe(1);

        // Select frequency
        await user.selectOptions(frequencySelect, '1');

        // Now due day should have options
        expect(dueDaySelect.options.length).toBeGreaterThan(1);
    });

    it('submits form with valid data', async () => {
        const user = userEvent.setup();
        render(<CreateSubForm setChangedCreateSub={mockSetChangedCreateSub} />);

        // Select token first
        const tokenDropdown = screen.getByRole('button', { name: /select token/i });
        await user.click(tokenDropdown);
        const tokenOption = screen.getByText(/ETH/i);
        await user.click(tokenOption);
        
        // Wait for token minimum to be fetched
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Fill in all form fields with valid data
        const amountInput = screen.getByLabelText(/amount/i) as HTMLInputElement;
        const frequencySelect = screen.getByLabelText(/frequency/i) as HTMLSelectElement;
        const dueDaySelect = screen.getByLabelText(/due day/i) as HTMLSelectElement;
        const descriptionInput = screen.getByLabelText(/description/i) as HTMLInputElement;
        const urlInput = screen.getByLabelText(/url/i) as HTMLInputElement;

        await user.type(amountInput, '1');
        await user.selectOptions(frequencySelect, '1');
        await user.selectOptions(dueDaySelect, '1');
        await user.type(descriptionInput, 'Test Description');
        await user.type(urlInput, 'https://example.com');

        // Submit button should now be enabled
        const submitButton = screen.getByRole('button', { name: /submit/i });
        expect(submitButton).not.toBeDisabled();
        
        // Submit the form
        await user.click(submitButton);
        
        // Verify the callback was called with correct data
        expect(mockSetChangedCreateSub).toHaveBeenCalledTimes(1);
        const callArgs = mockSetChangedCreateSub.mock.calls[0][0];
        expect(callArgs).toMatchObject({
            token: '0x123',
            frequency: 1,
            dueDay: 1,
            details: {
                description: 'Test Description',
                url: 'https://example.com',
                domain: '',
                email: '',
                phone: '',
            },
        });
        expect(callArgs.amount).toBeGreaterThan(BigInt(0));
    });

    it('shows submitting state during submission', async () => {
        const user = userEvent.setup();
        render(<CreateSubForm setChangedCreateSub={mockSetChangedCreateSub} />);

        // Select token first
        const tokenDropdown = screen.getByRole('button', { name: /select token/i });
        await user.click(tokenDropdown);
        const tokenOption = screen.getByText(/ETH/i);
        await user.click(tokenOption);
        
        // Wait for token minimum to be fetched
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Fill in all form fields with valid data
        const amountInput = screen.getByLabelText(/amount/i) as HTMLInputElement;
        const frequencySelect = screen.getByLabelText(/frequency/i) as HTMLSelectElement;
        const dueDaySelect = screen.getByLabelText(/due day/i) as HTMLSelectElement;
        const descriptionInput = screen.getByLabelText(/description/i) as HTMLInputElement;
        const urlInput = screen.getByLabelText(/url/i) as HTMLInputElement;

        await user.type(amountInput, '1');
        await user.selectOptions(frequencySelect, '1');
        await user.selectOptions(dueDaySelect, '1');
        await user.type(descriptionInput, 'Test Description');
        await user.type(urlInput, 'https://example.com');

        // Initially button should show "Submit"
        const submitButton = screen.getByRole('button', { name: /submit/i });
        expect(submitButton).toHaveTextContent('Submit');
        
        // Submit the form
        await user.click(submitButton);
        
        // After submission, button should show "Submitting..." and be disabled
        expect(submitButton).toHaveTextContent('Submitting...');
        expect(submitButton).toBeDisabled();
    });

    it('allows empty description and URL', () => {
        render(<CreateSubForm setChangedCreateSub={mockSetChangedCreateSub} />);

        const descriptionInput = screen.getByLabelText(/description/i) as HTMLInputElement;
        const urlInput = screen.getByLabelText(/url/i) as HTMLInputElement;

        // Empty fields should not be invalid (they're optional)
        // They start empty, so they should not have invalid class
        expect(descriptionInput).not.toHaveClass('is-invalid');
        expect(urlInput).not.toHaveClass('is-invalid');
    });
});

