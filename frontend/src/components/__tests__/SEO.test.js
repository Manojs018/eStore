import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import SEO from '../SEO';

describe('SEO Component', () => {
    it('renders title and meta tags correctly', async () => {
        const context = {};
        render(
            <HelmetProvider context={context}>
                <SEO
                    title="Test Page"
                    description="Test description"
                    url="https://example.com/test"
                    image="https://example.com/image.jpg"
                />
            </HelmetProvider>
        );

        // Helmet updates the document head asynchronously
        await waitFor(() => {
            expect(document.title).toBe('Test Page | eStore');

            const descriptionMeta = document.querySelector('meta[name="description"]');
            expect(descriptionMeta).toHaveAttribute('content', 'Test description');

            const canonicalLink = document.querySelector('link[rel="canonical"]');
            expect(canonicalLink).toHaveAttribute('href', 'https://example.com/test');

            const ogTitle = document.querySelector('meta[property="og:title"]');
            expect(ogTitle).toHaveAttribute('content', 'Test Page | eStore');

            const ogImage = document.querySelector('meta[property="og:image"]');
            expect(ogImage).toHaveAttribute('content', 'https://example.com/image.jpg');
        });
    });

    it('renders default values when props are missing', async () => {
        const context = {};
        render(
            <HelmetProvider context={context}>
                <SEO />
            </HelmetProvider>
        );

        await waitFor(() => {
            expect(document.title).toBe('eStore');
            const descriptionMeta = document.querySelector('meta[name="description"]');
            expect(descriptionMeta).toHaveAttribute('content', 'Your one-stop shop for premium electronics and accessories.');
        });
    });
});
