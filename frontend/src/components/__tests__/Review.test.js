import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReviewForm from '../ReviewForm';
import ReviewList from '../ReviewList';
import { AuthContext } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import '@testing-library/jest-dom';

// Mocks
jest.mock('lucide-react', () => ({
    Star: ({ fill, className }) => <span data-testid="star-icon" className={className}>{fill === "currentColor" ? "filled" : "empty"}</span>,
    ThumbsUp: () => <span>ThumbsUp</span>,
    User: () => <span>User</span>
}));

jest.mock('react-hot-toast', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn()
    }
}));

const mockUser = { _id: '123', name: 'Test User' };
const mockLogout = jest.fn();

const renderWithAuth = (component, user = mockUser) => {
    return render(
        <AuthContext.Provider value={{ user, logout: mockLogout }}>
            {component}
        </AuthContext.Provider>
    );
};

describe('ReviewForm', () => {
    test('renders form elements', () => {
        renderWithAuth(<ReviewForm productId="1" onReviewAdded={jest.fn()} />);
        expect(screen.getByText('Write a Review')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('What did you like or dislike about this product?')).toBeInTheDocument();
        expect(screen.getByText('Submit Review')).toBeInTheDocument();
    });

    test('validates submission', () => {
        renderWithAuth(<ReviewForm productId="1" onReviewAdded={jest.fn()} />);
        fireEvent.click(screen.getByText('Submit Review'));
        expect(toast.error).toHaveBeenCalledWith('Please select a rating');
    });

    test('submits valid data', async () => {
        const handleAdd = jest.fn();
        renderWithAuth(<ReviewForm productId="1" onReviewAdded={handleAdd} />);

        // Select rating (assuming buttons are index based 0-4)
        const starButtons = screen.getAllByRole('button', { hidden: true }).slice(0, 5); // get first 5 which are stars 
        // Logic for finding star buttons might need to be specific if icons are wrapped in buttons
        // In my code: <button onClick={() => setRating(ratingValue)} ...>
        // Let's blindly click the 5th button inside the container
        fireEvent.click(starButtons[4]);

        fireEvent.change(screen.getByPlaceholderText('What did you like or dislike about this product?'), {
            target: { value: 'Great product!' }
        });

        fireEvent.click(screen.getByText('Submit Review'));

        await waitFor(() => {
            expect(handleAdd).toHaveBeenCalled();
        });
    });
});

describe('ReviewList', () => {
    test('renders reviews', async () => {
        // Mock fetch
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    reviews: [
                        { _id: '1', user: { name: 'Alice' }, rating: 5, comment: 'Awesome', createdAt: new Date().toISOString(), helpful: [] }
                    ],
                    totalPages: 1
                })
            })
        );

        renderWithAuth(<ReviewList productId="1" />);
        await waitFor(() => {
            expect(screen.getByText('Awesome')).toBeInTheDocument();
            expect(screen.getByText('Alice')).toBeInTheDocument();
        });
    });

    test('renders loading state', () => {
        global.fetch = jest.fn(() => new Promise(() => { })); // Never resolves
        renderWithAuth(<ReviewList productId="1" />);
        expect(screen.getByText('Loading reviews...')).toBeInTheDocument();
    });
});
