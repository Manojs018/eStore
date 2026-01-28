import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CategoryFilter from '../CategoryFilter';
import '@testing-library/jest-dom';

describe('CategoryFilter Component', () => {
    const mockCategories = ['All', 'Electronics', 'Books'];
    const mockProducts = [
        { _id: 1, category: 'Electronics' },
        { _id: 2, category: 'Electronics' },
        { _id: 3, category: 'Books' }
    ];
    const mockOnSelect = jest.fn();

    test('renders all categories', () => {
        render(
            <CategoryFilter
                categories={mockCategories}
                selectedCategory="All"
                onSelectCategory={mockOnSelect}
                products={mockProducts}
            />
        );

        expect(screen.getAllByText('All').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Electronics').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Books').length).toBeGreaterThan(0);
    });

    test('displays correct product counts', () => {
        render(
            <CategoryFilter
                categories={mockCategories}
                selectedCategory="All"
                onSelectCategory={mockOnSelect}
                products={mockProducts}
            />
        );

        // All: 3, Electronics: 2, Books: 1
        // We look for elements containing the count
        // Since counts are in separate spans in desktop view
        const desktopCounts = screen.getAllByText('3'); // 'All' has 3 items
        expect(desktopCounts.length).toBeGreaterThan(0);
    });

    test('calls onSelectCategory when a category is clicked (Desktop)', () => {
        render(
            <CategoryFilter
                categories={mockCategories}
                selectedCategory="All"
                onSelectCategory={mockOnSelect}
                products={mockProducts}
            />
        );

        // Find the button acting as the filter for 'Electronics'
        // Since there is a mobile select and desktop buttons, we target the text in the button
        const categoryButtons = screen.getAllByText('Electronics');
        // Usually the first one or the one that is a span inside a button

        // Let's filter to find the one that is part of the button structure
        const desktopSpan = categoryButtons.find(el => el.tagName === 'SPAN');
        fireEvent.click(desktopSpan);

        expect(mockOnSelect).toHaveBeenCalledWith('Electronics');
    });

    test('mobile dropdown works', () => {
        render(
            <CategoryFilter
                categories={mockCategories}
                selectedCategory="All"
                onSelectCategory={mockOnSelect}
                products={mockProducts}
            />
        );

        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'Books' } });
        expect(mockOnSelect).toHaveBeenCalledWith('Books');
    });
});
