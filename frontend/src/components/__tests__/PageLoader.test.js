import React from 'react';
import { render, screen } from '@testing-library/react';
import PageLoader from '../PageLoader';

describe('PageLoader', () => {
    test('renders loading spinner and text', () => {
        render(<PageLoader />);
        expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
        // Check for the spinner element (using a class check or simple existence if structure matches)
        const spinner = screen.getByText(/Loading.../i).previousSibling;
        expect(spinner).toHaveClass('animate-spin');
    });
});
