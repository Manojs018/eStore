import React from 'react';
import { render, screen, fireEvent } from '../../test-utils';
import Header from '../Header';

// Mock Lucide icons to avoid rendering issues if any (though usually fine)
// But to be safe and consistent with previous successful tests
jest.mock('lucide-react', () => ({
    ShoppingBag: () => <span data-testid="icon-shopping-bag">Icon</span>,
    Search: () => <span data-testid="icon-search">Icon</span>,
    Menu: () => <span data-testid="icon-menu">Icon</span>,
    X: () => <span data-testid="icon-x">Icon</span>,
    User: () => <span data-testid="icon-user">Icon</span>,
    LogOut: () => <span data-testid="icon-logout">Icon</span>,
    ChevronDown: () => <span data-testid="icon-chevron-down">Icon</span>,
    LayoutDashboard: () => <span data-testid="icon-layout-dashboard">Icon</span>,
    Package: () => <span data-testid="icon-package">Icon</span>,
    Heart: () => <span data-testid="icon-heart">Icon</span>
}));

const mockUser = {
    name: 'Test User',
    email: 'test@example.com',
    role: 'user'
};

const mockAdmin = {
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin'
};

describe('Header Component', () => {
    it('renders navigation links and logo', () => {
        render(<Header />);
        expect(screen.getByText('eStore')).toBeInTheDocument();
        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('Products')).toBeInTheDocument();
    });

    it('shows login/register buttons when not authenticated', () => {
        render(<Header />);
        // Check for both desktop and mobile versions if present, using queryAll or getAll
        const loginButtons = screen.getAllByText('Log in');
        expect(loginButtons.length).toBeGreaterThan(0);
        const signupButtons = screen.getAllByText('Sign up');
        expect(signupButtons.length).toBeGreaterThan(0);
    });

    it('shows user info when authenticated', () => {
        render(<Header />, { authProps: { user: mockUser } });

        expect(screen.getByText('Test User')).toBeInTheDocument();
        // Assuming 'Log in' is hidden for authenticated users on desktop
        // Mobile menu might still have it in DOM but hidden via CSS? 
        // Usually React conditionals remove it.
        // Let's check that 'Sign up' is NOT present in the document at all or at least not visible
        // Based on code: {user ? (...) : (...)} so it should be removed.
        expect(screen.queryByText('Log in')).not.toBeInTheDocument();
    });

    it('shows admin link for admin user', () => {
        render(<Header />, { authProps: { user: mockAdmin } });
        expect(screen.getByText('Admin')).toBeInTheDocument();
    });

    it('displays cart and wishlist count', () => {
        render(<Header />, {
            cartProps: { getCartItemsCount: () => 5 },
            wishlistProps: { wishlist: [1, 2, 3] }
        });

        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('handles logout', () => {
        const logoutMock = jest.fn();
        render(<Header />, { authProps: { user: mockUser, logout: logoutMock } });

        // Open user menu
        const userButton = screen.getByText('Test User');
        fireEvent.click(userButton);

        // Click logout
        const logoutButton = screen.getByText('Sign out');
        fireEvent.click(logoutButton);

        expect(logoutMock).toHaveBeenCalled();
    });

    it('handles search input', () => {
        render(<Header />);
        // There might be multiple search inputs (desktop/mobile)
        const searchInputs = screen.getAllByPlaceholderText(/Search/i);
        const searchInput = searchInputs[0];

        fireEvent.change(searchInput, { target: { value: 'Laptop' } });
        expect(searchInput.value).toBe('Laptop');
    });
});
