import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NotFound from '../NotFound';
import '@testing-library/jest-dom';

// Mock Lucide icons
jest.mock('lucide-react', () => ({
    Home: () => <span data-testid="icon-home" />,
    ShoppingBag: () => <span data-testid="icon-shopping" />,
    HelpCircle: () => <span data-testid="icon-help" />,
    ArrowLeft: () => <span data-testid="icon-arrow" />,
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
    },
}));

describe('NotFound Page', () => {
    const renderNotFound = () => {
        return render(
            <BrowserRouter>
                <NotFound />
            </BrowserRouter>
        );
    };

    test('renders 404 text', () => {
        renderNotFound();
        expect(screen.getByText('404')).toBeInTheDocument();
    });

    test('renders friendly message', () => {
        renderNotFound();
        expect(screen.getByText('Oops! Page not found')).toBeInTheDocument();
    });

    test('renders Go Home button', () => {
        renderNotFound();
        const homeBtn = screen.getByText('Go Home');
        expect(homeBtn).toBeInTheDocument();
        expect(homeBtn.closest('a')).toHaveAttribute('href', '/');
    });

    test('renders suggestion links', () => {
        renderNotFound();
        expect(screen.getByText('Shop Products')).toBeInTheDocument();
        expect(screen.getByText('View Cart')).toBeInTheDocument();
        expect(screen.getByText('Help Center')).toBeInTheDocument();
    });
});
