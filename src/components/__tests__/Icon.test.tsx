import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '../../test-utils';
import userEvent from '@testing-library/user-event';
import Icon from '../Icon';
import React from 'react';

// Mock console.warn to test warnings
const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

describe('Icon', () => {
    beforeEach(() => {
        consoleWarnSpy.mockClear();
    });

    afterEach(() => {
        consoleWarnSpy.mockClear();
    });

    it('renders a valid icon component', () => {
        const TestIcon = ({ className }: { className?: string }) => (
            <svg data-testid="test-icon" className={className}>
                <circle />
            </svg>
        );

        render(<Icon icon={TestIcon} className="test-class" />);
        
        const icon = screen.getByTestId('test-icon');
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveClass('test-class');
    });

    it('forwards all props to the icon component', async () => {
        const user = userEvent.setup();
        const TestIcon = ({ 'data-testid': testId, title, onClick }: any) => (
            <svg data-testid={testId} title={title} onClick={onClick}>
                <circle />
            </svg>
        );

        const handleClick = vi.fn();
        render(
            <Icon 
                icon={TestIcon} 
                data-testid="custom-icon"
                title="Test Icon"
                onClick={handleClick}
            />
        );

        const icon = screen.getByTestId('custom-icon');
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveAttribute('title', 'Test Icon');
        
        await user.click(icon);
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('returns null when icon is undefined', () => {
        const { container } = render(<Icon icon={undefined as any} />);
        
        expect(container.firstChild).toBeNull();
        expect(consoleWarnSpy).toHaveBeenCalledWith(
            'Invalid or undefined icon prop:',
            undefined
        );
    });

    it('returns null when icon is null', () => {
        const { container } = render(<Icon icon={null as any} />);
        
        expect(container.firstChild).toBeNull();
        expect(consoleWarnSpy).toHaveBeenCalledWith(
            'Invalid or undefined icon prop:',
            null
        );
    });

    it('handles icon with no additional props', () => {
        const TestIcon = () => (
            <svg data-testid="simple-icon">
                <circle />
            </svg>
        );

        render(<Icon icon={TestIcon} />);
        
        const icon = screen.getByTestId('simple-icon');
        expect(icon).toBeInTheDocument();
    });

    it('handles multiple props correctly', () => {
        const TestIcon = ({ className, style, id }: any) => (
            <svg 
                data-testid="multi-prop-icon" 
                className={className}
                style={style}
                id={id}
            >
                <circle />
            </svg>
        );

        const customStyle = { color: 'red', fontSize: '20px' };
        render(
            <Icon 
                icon={TestIcon}
                className="custom-class"
                style={customStyle}
                id="icon-123"
            />
        );

        const icon = screen.getByTestId('multi-prop-icon');
        expect(icon).toHaveClass('custom-class');
        expect(icon).toHaveStyle({ color: 'rgb(255, 0, 0)', fontSize: '20px' });
        expect(icon).toHaveAttribute('id', 'icon-123');
    });
});
