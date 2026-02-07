import React from 'react';
import { render, screen, fireEvent } from '../../test-utils';
import ProductCard from '../ProductCard';

const mockProduct = {
    _id: '1',
    name: 'Test Product',
    description: 'Test Description',
    price: 99.99,
    category: 'Electronics',
    imageUrl: 'test.jpg',
    stock: 10,
    averageRating: 4.5,
    numOfReviews: 5,
    inStock: true
};

describe('ProductCard Component', () => {
    it('renders product information correctly', () => {
        render(<ProductCard product={mockProduct} />);

        expect(screen.getByText('Test Product')).toBeInTheDocument();
        expect(screen.getByText('$99.99')).toBeInTheDocument();
        expect(screen.getByText('4.5 (5)')).toBeInTheDocument();
        expect(screen.getByRole('img')).toHaveAttribute('src', 'test.jpg');
    });

    it('handles add to cart interaction', () => {
        const addToCart = jest.fn();
        render(<ProductCard product={mockProduct} />, {
            cartProps: { addToCart }
        });

        const addButton = screen.getByText('Add to Cart'); // Assuming button text
        // The button seems to be buried or using specific text. 
        // Checking file content: ProductCard.js uses "Add to Cart" or "Out of Stock"
        fireEvent.click(addButton);

        expect(addToCart).toHaveBeenCalledWith(mockProduct);
    });

    it('handles wishlist toggle', () => {
        const addToWishlist = jest.fn();
        const isInWishlist = jest.fn().mockReturnValue(false);

        render(<ProductCard product={mockProduct} />, {
            wishlistProps: { addToWishlist, isInWishlist }
        });

        const wishlistButton = screen.getByLabelText('Add to wishlist');
        fireEvent.click(wishlistButton);

        expect(addToWishlist).toHaveBeenCalledWith(mockProduct);
    });

    it('shows out of stock state', () => {
        const outOfStockProduct = { ...mockProduct, inStock: false };
        render(<ProductCard product={outOfStockProduct} />);

        // Should be at least one indicator
        expect(screen.getAllByText('Out of Stock').length).toBeGreaterThan(0);

        // Button should be disabled and show text
        const button = screen.getByRole('button', { name: /out of stock/i });
        expect(button).toBeInTheDocument();
        expect(button).toBeDisabled();
    });
});
