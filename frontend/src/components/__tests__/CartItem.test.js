import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import CartItem from '../CartItem';
import { CartProvider } from '../../contexts/CartContext';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// We need to mock the entire CartContext default export or wrap it properly
// Since CartItem uses useCart(), we can just wrap it in a real or mock provider
// Real provider with mock storage is acceptable to test the logic
const MockCartProvider = ({ children }) => {
    // A simplified cart context mock
    const [cart, setCart] = React.useState([
        { _id: '1', name: 'Test Product', price: 100, quantity: 1, stock: 5, imageUrl: 'img.jpg' }
    ]);
    const updateQuantity = jest.fn((id, qty) => {
        setCart(prev => prev.map(item => item._id === id ? { ...item, quantity: qty } : item));
    });
    const removeFromCart = jest.fn();

    return (
        <div data-testid="test-wrapper">
            {React.cloneElement(children, { item: cart[0] })}
            <button onClick={() => updateQuantity('1', cart[0].quantity + 1)} data-testid="mock-inc">Mock Inc</button>
        </div>
    );
};
const mockUpdateQuantity = jest.fn();
const mockRemoveFromCart = jest.fn();

jest.mock('../../contexts/CartContext', () => ({
    useCart: () => ({
        updateQuantity: mockUpdateQuantity,
        removeFromCart: mockRemoveFromCart,
    })
}));

import { useCart } from '../../contexts/CartContext';

describe('CartItem', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockItem = {
        _id: '1',
        name: 'Test Product',
        price: 99.99,
        quantity: 2,
        stock: 5,
        imageUrl: 'test.jpg'
    };

    test('renders cart item details correctly', () => {
        render(<CartItem item={mockItem} />);
        expect(screen.getByText('Test Product')).toBeInTheDocument();
        expect(screen.getByText('$99.99 each')).toBeInTheDocument();
        // Total price calculation check
        expect(screen.getByText('$199.98')).toBeInTheDocument();
    });

    test('calls updateQuantity on plus button click', () => {
        render(<CartItem item={mockItem} />);

        const plusBtn = screen.getByLabelText('Increase quantity');
        fireEvent.click(plusBtn);

        expect(mockUpdateQuantity).toHaveBeenCalledWith('1', 3);
    });

    test('calls updateQuantity on minus button click', () => {
        render(<CartItem item={mockItem} />);

        const minusBtn = screen.getByLabelText('Decrease quantity');
        fireEvent.click(minusBtn);

        expect(mockUpdateQuantity).toHaveBeenCalledWith('1', 1);
    });

    test('disables minus button at quantity 1', () => {
        const item1 = { ...mockItem, quantity: 1 };
        render(<CartItem item={item1} />);
        const minusBtn = screen.getByLabelText('Decrease quantity');
        expect(minusBtn).toBeDisabled();
    });

    test('calls removeFromCart on delete button click', () => {
        render(<CartItem item={mockItem} />);

        const deleteBtn = screen.getByLabelText('Remove item');
        fireEvent.click(deleteBtn);

        expect(mockRemoveFromCart).toHaveBeenCalledWith('1');
    });

    test('input change updates quantity', () => {
        render(<CartItem item={mockItem} />);

        const input = screen.getByRole('spinbutton');
        fireEvent.change(input, { target: { value: '4' } });

        expect(mockUpdateQuantity).toHaveBeenCalledWith('1', 4);
    });
});
