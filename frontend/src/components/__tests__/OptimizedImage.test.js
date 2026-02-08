import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import OptimizedImage from '../OptimizedImage';

describe('OptimizedImage', () => {
    test('renders with correct src and props', () => {
        render(
            <OptimizedImage
                src="https://example.com/image.jpg"
                alt="Test Image"
                width={300}
                height={200}
                className="test-class"
            />
        );

        const img = screen.getByRole('img');
        expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
        expect(img).toHaveAttribute('alt', 'Test Image');
        expect(img).toHaveClass('test-class');
        expect(img).toHaveAttribute('width', '300');
        expect(img).toHaveAttribute('height', '200');
        expect(img).toHaveAttribute('loading', 'lazy');
    });

    // Test that opacity starts at 0 (loading)
    test('starts with opacity-0 class', () => {
        render(
            <OptimizedImage
                src="https://example.com/image.jpg"
                alt="Test Image"
            />
        );
        const img = screen.getByRole('img');
        expect(img).toHaveClass('opacity-0');
    });

    // Test that opacity becomes 100 on load
    test('changes opacity on load', () => {
        render(
            <OptimizedImage
                src="https://example.com/image.jpg"
                alt="Test Image"
            />
        );
        const img = screen.getByRole('img');
        fireEvent.load(img);
        expect(img).toHaveClass('opacity-100');
    });

    test('generates Unsplash URLs correctly', () => {
        const unsplashSrc = 'https://images.unsplash.com/photo-123';
        render(
            <OptimizedImage
                src={unsplashSrc}
                alt="Unsplash Image"
                width={400}
            />
        );
        const img = screen.getByRole('img');
        // The src will be processed by our logic
        expect(img.getAttribute('src')).toContain('w=800'); // default fallback width

        // Check srcset existence
        expect(img).toHaveAttribute('srcSet');
        const srcSet = img.getAttribute('srcSet');
        expect(srcSet).toContain('w=400');
        expect(srcSet).toContain('w=800');
        expect(srcSet).toContain('w=1200');
    });

    test('handles image load error', () => {
        render(
            <OptimizedImage
                src="https://broken-link.com/image.jpg"
                alt="Test Image"
            />
        );
        const img = screen.getByRole('img');
        fireEvent.error(img);
        expect(img).toHaveAttribute('src', 'https://via.placeholder.com/400x300?text=No+Image');
    });
});
