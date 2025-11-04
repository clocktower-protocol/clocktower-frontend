import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../test-utils';
import userEvent from '@testing-library/user-event';
import EditAccountForm from '../EditAccountForm';
import { AccountDetails } from '../../types/account';

describe('EditAccountForm', () => {
    const mockSetChangedAccountDetails = vi.fn().mockResolvedValue(undefined);
    
    const mockAccountDetails: AccountDetails = {
        description: 'Test Description',
        company: 'Test Company',
        url: 'https://example.com',
        domain: 'example.com',
        email: 'test@example.com',
        misc: 'Test Misc',
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the form with all fields', () => {
        render(
            <EditAccountForm
                accountDetails={mockAccountDetails}
                setChangedAccountDetails={mockSetChangedAccountDetails}
            />
        );

        expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/company/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/misc/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/url/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/domain/i)).toBeInTheDocument();
        expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('pre-fills form fields with account details', () => {
        render(
            <EditAccountForm
                accountDetails={mockAccountDetails}
                setChangedAccountDetails={mockSetChangedAccountDetails}
            />
        );

        const descriptionInput = screen.getByLabelText(/description/i) as HTMLInputElement;
        const companyInput = screen.getByLabelText(/company/i) as HTMLInputElement;
        const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;

        expect(descriptionInput.value).toBe('Test Description');
        expect(companyInput.value).toBe('Test Company');
        expect(emailInput.value).toBe('test@example.com');
    });

    it('validates description length', async () => {
        const user = userEvent.setup();
        render(
            <EditAccountForm
                accountDetails={mockAccountDetails}
                setChangedAccountDetails={mockSetChangedAccountDetails}
            />
        );

        const descriptionInput = screen.getByLabelText(/description/i) as HTMLInputElement;
        const longDescription = 'a'.repeat(256);

        await user.clear(descriptionInput);
        await user.type(descriptionInput, longDescription);

        expect(descriptionInput).toHaveClass('is-invalid');
        expect(screen.getByText(/description must be under 255 characters/i)).toBeInTheDocument();
    });

    it('validates company name length', async () => {
        const user = userEvent.setup();
        render(
            <EditAccountForm
                accountDetails={mockAccountDetails}
                setChangedAccountDetails={mockSetChangedAccountDetails}
            />
        );

        const companyInput = screen.getByLabelText(/company/i) as HTMLInputElement;
        const longCompany = 'a'.repeat(256);

        await user.clear(companyInput);
        await user.type(companyInput, longCompany);

        expect(companyInput).toHaveClass('is-invalid');
        expect(screen.getByText(/company name must be under 255 characters/i)).toBeInTheDocument();
    });

    it('validates email format', async () => {
        const user = userEvent.setup();
        render(
            <EditAccountForm
                accountDetails={mockAccountDetails}
                setChangedAccountDetails={mockSetChangedAccountDetails}
            />
        );

        const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;

        await user.clear(emailInput);
        await user.type(emailInput, 'invalid-email');

        expect(emailInput).toHaveClass('is-invalid');
        expect(screen.getByText(/please provide a valid email address/i)).toBeInTheDocument();
    });

    it('accepts valid email', async () => {
        const user = userEvent.setup();
        render(
            <EditAccountForm
                accountDetails={mockAccountDetails}
                setChangedAccountDetails={mockSetChangedAccountDetails}
            />
        );

        const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;

        await user.clear(emailInput);
        await user.type(emailInput, 'valid@email.com');

        expect(emailInput).toHaveClass('is-valid');
    });

    it('validates URL format', async () => {
        const user = userEvent.setup();
        render(
            <EditAccountForm
                accountDetails={mockAccountDetails}
                setChangedAccountDetails={mockSetChangedAccountDetails}
            />
        );

        const urlInput = screen.getByLabelText(/url/i) as HTMLInputElement;

        await user.clear(urlInput);
        await user.type(urlInput, 'invalid-url');

        expect(urlInput).toHaveClass('is-invalid');
        expect(screen.getByText(/please provide a valid url/i)).toBeInTheDocument();
    });

    it('validates domain format', async () => {
        const user = userEvent.setup();
        render(
            <EditAccountForm
                accountDetails={mockAccountDetails}
                setChangedAccountDetails={mockSetChangedAccountDetails}
            />
        );

        const domainInput = screen.getByLabelText(/domain/i) as HTMLInputElement;

        await user.clear(domainInput);
        await user.type(domainInput, 'invalid domain');

        expect(domainInput).toHaveClass('is-invalid');
        expect(screen.getByText(/please provide a valid domain/i)).toBeInTheDocument();
    });

    it('accepts valid domain', async () => {
        const user = userEvent.setup();
        render(
            <EditAccountForm
                accountDetails={mockAccountDetails}
                setChangedAccountDetails={mockSetChangedAccountDetails}
            />
        );

        const domainInput = screen.getByLabelText(/domain/i) as HTMLInputElement;

        await user.clear(domainInput);
        await user.type(domainInput, 'example.com');

        expect(domainInput).toHaveClass('is-valid');
    });

    it('requires checkbox to be checked before submission', async () => {
        const user = userEvent.setup();
        render(
            <EditAccountForm
                accountDetails={mockAccountDetails}
                setChangedAccountDetails={mockSetChangedAccountDetails}
            />
        );

        const checkbox = screen.getByRole('checkbox');
        const submitButton = screen.getByRole('button', { name: /submit/i });

        // Initially disabled because checkbox is unchecked
        expect(submitButton).toBeDisabled();

        await user.click(checkbox);

        // Now should be enabled (assuming all fields are valid)
        expect(submitButton).not.toBeDisabled();
    });

    it('submits form with valid data when checkbox is checked', async () => {
        const user = userEvent.setup();
        render(
            <EditAccountForm
                accountDetails={mockAccountDetails}
                setChangedAccountDetails={mockSetChangedAccountDetails}
            />
        );

        const checkbox = screen.getByRole('checkbox');
        await user.click(checkbox);

        const submitButton = screen.getByRole('button', { name: /submit/i });
        await user.click(submitButton);

        expect(mockSetChangedAccountDetails).toHaveBeenCalledWith({
            description: 'Test Description',
            company: 'Test Company',
            url: 'https://example.com',
            domain: 'example.com',
            email: 'test@example.com',
            misc: 'Test Misc',
        });
    });

    it('shows submitting state during submission', async () => {
        const user = userEvent.setup();
        let resolvePromise: () => void;
        const delayedMock = vi.fn().mockImplementation(() => {
            return new Promise<void>((resolve) => {
                resolvePromise = resolve;
            });
        });

        render(
            <EditAccountForm
                accountDetails={mockAccountDetails}
                setChangedAccountDetails={delayedMock}
            />
        );

        const checkbox = screen.getByRole('checkbox');
        await user.click(checkbox);

        const submitButton = screen.getByRole('button', { name: /submit/i });
        await user.click(submitButton);

        expect(screen.getByRole('button', { name: /submitting/i })).toBeInTheDocument();
        expect(submitButton).toBeDisabled();

        resolvePromise!();
        await new Promise(resolve => setTimeout(resolve, 100));
    });
});

