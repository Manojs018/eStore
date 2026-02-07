import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';
import { AuthProvider } from '../contexts/AuthContext';
import { server } from '../mocks/server';
import { rest } from 'msw';

// Mock Header/Footer not needed for Login page unit test strictly, 
// but Login page might be rendered with them if using App router? 
// Here we render <Login /> directly.

// We need to mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate
}));

// Mock react-hot-toast to verify calls
jest.mock('react-hot-toast', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
    Toaster: () => null
}));

const renderWithProvider = (ui) => {
    return render(
        <BrowserRouter>
            <AuthProvider>
                {ui}
            </AuthProvider>
        </BrowserRouter>
    );
};

describe('Login Integration', () => {
    beforeEach(() => {
        mockNavigate.mockClear();
    });

    it('renders login form', () => {
        renderWithProvider(<Login />);
        expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    it('allows user to login successfully', async () => {
        renderWithProvider(<Login />);

        fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });

        const loginButton = screen.getByRole('button', { name: /login/i });
        await waitFor(() => expect(loginButton).toBeEnabled());
        fireEvent.click(loginButton);

        await waitFor(() => {
            expect(require('react-hot-toast').toast.success).toHaveBeenCalledWith('Login successful!');
        });

        // Check if token is stored (mocked by MSW response to return token)
        // Check navigation
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('displays error on invalid credentials', async () => {
        renderWithProvider(<Login />);

        fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'wrong@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpass' } });

        const loginButton = screen.getByRole('button', { name: /login/i });
        await waitFor(() => expect(loginButton).toBeEnabled());
        fireEvent.click(loginButton);

        await waitFor(() => {
            expect(require('react-hot-toast').toast.error).toHaveBeenCalledWith(expect.stringMatching(/invalid/i));
        });

        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
