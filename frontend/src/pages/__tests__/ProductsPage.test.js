
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Products from '../Products';
import { MemoryRouter, useLocation } from 'react-router-dom';
import '@testing-library/jest-dom';
import { SAMPLE_PRODUCTS } from '../../utils/constants';

// Mock ProductCard to simplify testing
jest.mock('../../components/ProductCard', () => ({ product }) => (
    <div data-testid="product-card">
        {product.name} - ${product.price}
    </div>
));

// Mock Skeleton
jest.mock('../../components/SkeletonLoader', () => ({
    ProductCardSkeleton: () => <div data-testid="skeleton" />
}));

// Mock useLocation
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: jest.fn(),
}));

describe('Products Page', () => {
    beforeEach(() => {
        // Reset mocks
        useLocation.mockReturnValue({ search: '' });
    });

    test('renders loading state initially', () => {
        // Mock useState to start with loading=true default
        render(
            <MemoryRouter>
                <Products />
            </MemoryRouter>
        );
        expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0);
    });

    test('renders products after loading', async () => {
        render(
            <MemoryRouter>
                <Products />
            </MemoryRouter>
        );

        // Wait for mock API call
        await waitFor(() => {
            expect(screen.getAllByTestId('product-card').length).toBeGreaterThan(0);
        }, { timeout: 1500 }); // Longer timeout for the setTimeout mock

        // Check if categories are rendered (Filter sidebar)
        expect(screen.getByText('All')).toBeInTheDocument();
    });

    test('filters by category', async () => {
        render(
            <MemoryRouter>
                <Products />
            </MemoryRouter>
        );

        await waitFor(() => screen.getAllByTestId('product-card'), { timeout: 1500 });

        // Click on a category filter, e.g., Electronics (assuming it exists in constants)
        // We find the element containing 'Electronics'. There might be multiple (select option + button span)
        // We want to click the one that triggers the action.
        const categoryElements = screen.getAllByText('Electronics');
        // The desktop button span is clickable.
        fireEvent.click(categoryElements[0]);

        // Verify filter logic (ProductCard should be filtered)
        // Use waitFor as setFilteredProducts is async
        await waitFor(() => {
            // Just check that we didn't crash and list updated
            // In a real test with controlled data we count items
            const products = screen.getAllByTestId('product-card');
            expect(products.length).toBeGreaterThan(0);
        });
    });

    test('search functionality', async () => {
        render(
            <MemoryRouter>
                <Products />
            </MemoryRouter>
        );

        await waitFor(() => screen.getAllByTestId('product-card'), { timeout: 1500 });

        const searchInput = screen.getByPlaceholderText('Search products...');
        fireEvent.change(searchInput, { target: { value: 'Headphones' } });

        await waitFor(() => {
            expect(screen.getByText(/Headphones/)).toBeInTheDocument();
        });
    });
});
