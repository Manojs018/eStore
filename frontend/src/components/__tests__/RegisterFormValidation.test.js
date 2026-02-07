
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterForm from '../RegisterForm';
import { MemoryRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import '@testing-library/jest-dom';

// Mock dependencies
jest.mock('react-hot-toast', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
    Toaster: () => <div data-testid="toaster" />,
}));

// Mock AuthContext
const mockRegister = jest.fn();
jest.mock('../../contexts/AuthContext', () => ({
    useAuth: () => ({
        register: mockRegister,
    }),
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
    Check: () => <div data-testid="check-icon" />,
    AlertCircle: () => <div data-testid="error-icon" />,
    X: () => <div data-testid="x-icon" />,
}));

// Helper to render with Router
const renderWithRouter = (ui) => {
    return render(
        <MemoryRouter>
            {ui}
            <Toaster />
        </MemoryRouter>
    );
};

describe('RegisterForm Live Validation', () => {
    beforeEach(() => {
        mockRegister.mockClear();
    });

    test('renders registration form correctly', () => {
        renderWithRouter(<RegisterForm />);
        expect(screen.getByPlaceholderText(/John Doe/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/john@example.com/i)).toBeInTheDocument();
    });

    test('shows error for short name', async () => {
        renderWithRouter(<RegisterForm />);
        const nameInput = screen.getByPlaceholderText(/John Doe/i);

        // Type short name
        fireEvent.change(nameInput, { target: { value: 'Jo' } });
        fireEvent.blur(nameInput);

        // Expect error message
        expect(screen.getByText(/Name must be at least 3 characters/i)).toBeInTheDocument();
        // Check for red border class usage
        expect(nameInput.className).toContain('border-red-500');
    });

    test('shows error for invalid email', async () => {
        renderWithRouter(<RegisterForm />);
        const emailInput = screen.getByPlaceholderText(/john@example.com/i);

        fireEvent.change(emailInput, { target: { value: 'bad-email' } });
        fireEvent.blur(emailInput);

        expect(screen.getByText(/Invalid email format/i)).toBeInTheDocument();
        expect(emailInput.className).toContain('border-red-500');
    });

    test('password strength validation', async () => {
        renderWithRouter(<RegisterForm />);
        // Use LabelText to avoid ambiguity
        const passwordInput = screen.getByLabelText('Password');

        fireEvent.change(passwordInput, { target: { value: 'weak' } });
        fireEvent.blur(passwordInput);

        expect(screen.getByText(/At least 8 characters/i)).toBeInTheDocument();
    });

    test('submit flow with valid data', async () => {
        renderWithRouter(<RegisterForm />);
        const submitBtn = screen.getByRole('button', { name: /Register/i });

        // Initial state disabled
        expect(submitBtn).toBeDisabled();

        // Fill valid data
        fireEvent.change(screen.getByPlaceholderText(/John Doe/i), { target: { value: 'Valid Name' } });
        fireEvent.change(screen.getByPlaceholderText(/john@example.com/i), { target: { value: 'valid@email.com' } });

        const validPass = 'StrongPass123!';
        const passInput = screen.getByLabelText('Password');
        const confirmInput = screen.getByLabelText('Confirm Password');

        fireEvent.change(passInput, { target: { value: validPass } });
        // Simulate real-time validation being satisfied
        fireEvent.change(confirmInput, { target: { value: validPass } });

        // Trigger blur to ensure touched states
        fireEvent.blur(passInput);
        fireEvent.blur(confirmInput);

        // Button should be enabled
        await waitFor(() => {
            expect(submitBtn).not.toBeDisabled();
        });

        // Submit
        mockRegister.mockResolvedValueOnce({ success: true });
        fireEvent.click(submitBtn);

        // Expect loading state and then success
        expect(screen.getByText(/Creating Account.../i)).toBeInTheDocument();

        await waitFor(() => {
            expect(mockRegister).toHaveBeenCalledWith('Valid Name', 'valid@email.com', 'StrongPass123!');
        });
    });
});
