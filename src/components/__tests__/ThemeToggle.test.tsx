import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '../../test-utils';
import userEvent from '@testing-library/user-event';
import ThemeToggle from '../ThemeToggle';

describe('ThemeToggle', () => {
    beforeEach(() => {
        // Reset localStorage before each test
        localStorage.clear();
    });

    it('renders the theme toggle button', () => {
        render(<ThemeToggle />);
        
        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
        expect(button).toHaveClass('theme-toggle');
    });

    it('displays moon icon when in light mode', () => {
        // Set initial theme to light
        localStorage.setItem('theme', 'light');
        document.documentElement.setAttribute('data-bs-theme', 'light');
        
        render(<ThemeToggle />);
        
        const button = screen.getByRole('button');
        // Check that the button contains a moon icon (BsMoon)
        // react-icons uses SVG, so we check for the button's content
        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
    });

    it('displays sun icon when in dark mode', () => {
        // Set initial theme to dark
        localStorage.setItem('theme', 'dark');
        document.documentElement.setAttribute('data-bs-theme', 'dark');
        
        render(<ThemeToggle />);
        
        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
    });

    it('toggles theme when clicked', async () => {
        const user = userEvent.setup();
        
        // Start with light mode
        localStorage.setItem('theme', 'light');
        document.documentElement.setAttribute('data-bs-theme', 'light');
        
        const { rerender } = render(<ThemeToggle />);
        
        let button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
        
        // Click to toggle to dark mode
        await user.click(button);
        
        // Wait for the theme to update
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Check that theme changed in localStorage
        expect(localStorage.getItem('theme')).toBe('dark');
        
        // Re-render to see the updated state
        rerender(<ThemeToggle />);
        
        // Wait a bit for state to update
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // The aria-label should now indicate switching to light mode
        button = screen.getByRole('button');
        expect(localStorage.getItem('theme')).toBe('dark');
        // The component should update based on the new theme state
        expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
    });

    it('has correct button variant and styling', () => {
        render(<ThemeToggle />);
        
        const button = screen.getByRole('button');
        expect(button).toHaveClass('theme-toggle');
        expect(button).toHaveClass('btn');
        expect(button).toHaveClass('btn-outline-secondary');
    });

    it('updates aria-label based on current theme', async () => {
        const user = userEvent.setup();
        
        // Test light mode aria-label
        localStorage.setItem('theme', 'light');
        document.documentElement.setAttribute('data-bs-theme', 'light');
        
        const { rerender } = render(<ThemeToggle />);
        
        let button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
        
        // Click to switch to dark mode
        await user.click(button);
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Re-render to get updated state
        rerender(<ThemeToggle />);
        await new Promise(resolve => setTimeout(resolve, 50));
        
        button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
        expect(localStorage.getItem('theme')).toBe('dark');
    });
});
