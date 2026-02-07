import React from 'react';
import { render, screen, waitFor, fireEvent } from '../test-utils';
import Products from '../pages/Products';
import { server } from '../mocks/server';
import { rest } from 'msw';

// Mock Header and Footer to avoid noise
jest.mock('../components/Header', () => () => <div data-testid="header">Header</div>);
jest.mock('../components/Footer', () => () => <div data-testid="footer">Footer</div>);

describe('Products Page Integration', () => {
    it('fetches and displays products', async () => {
        // Need to match the base URL used in api.js
        // api.js uses process.env.REACT_APP_API_URL || '/api'
        // MSW path should match this. In handlers.js, I changed some to /api/products
        // and others to http://localhost...
        // Let's modify handlers to catch all or specify relative path if baseURL is configured.
        // If api.js creates axios instance, it respects baseURL.
        // If running in Jest, env var might not be set, so '/api' is used.
        // MSW relative paths like '/api/products' will match calls to 'http://localhost/api/products' in browser/jsdom.

        render(<Products />);

        // Check loading. Since mock response might be fast, we use waitFor immediately.
        // However, if Products.js sets loading true initially, we might see skeletons first.

        await waitFor(() => {
            // Look for content from mock handler
            // Handler returns Product 1 in data array
            expect(screen.getByText('Product 1')).toBeInTheDocument();
            expect(screen.getByText('Product 2')).toBeInTheDocument();
        });

        expect(screen.getByText('$100.00')).toBeInTheDocument();
    });

    it('handles server error gracefully', async () => {
        // Override handler for this test
        server.use(
            rest.get('/api/products', (req, res, ctx) => {
                return res(ctx.status(500));
            })
        );

        render(<Products />);

        await waitFor(() => {
            // Check for error text
            expect(screen.getByText(/Failed to load products/i)).toBeInTheDocument();
        });
    });
});
