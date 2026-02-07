import { rest } from 'msw';

export const handlers = [
    // User Login
    rest.post('/api/auth/login', async (req, res, ctx) => {
        console.log('MSW: Login Handler Hit');
        const info = await req.json();
        if (info.email === 'test@example.com' && info.password === 'password123') {
            return res(
                ctx.json({
                    success: true,
                    data: {
                        user: { id: '1', name: 'Test User', email: 'test@example.com', role: 'user' },
                        token: 'fake-jwt-token'
                    }
                })
            );
        }
        return res(ctx.status(401), ctx.json({ message: 'Invalid credentials' }));
    }),

    // Get User Profile
    rest.get('/api/auth/profile', (req, res, ctx) => {
        return res(
            ctx.json({
                success: true,
                data: { id: '1', name: 'Test User', email: 'test@example.com', role: 'user' }
            })
        );
    }),

    // Get Products
    rest.get('/api/products', (req, res, ctx) => {
        return res(
            ctx.json({
                success: true,
                count: 2,
                pagination: { currentPage: 1, totalPages: 1 },
                data: [
                    { _id: '1', name: 'Product 1', price: 100, category: 'electronics', inStock: true, image: 'img1.jpg', description: 'desc' },
                    { _id: '2', name: 'Product 2', price: 200, category: 'clothing', inStock: false, image: 'img2.jpg', description: 'desc' }
                ]
            })
        );
    }),

    // Get Product Detail
    rest.get('/api/products/:id', (req, res, ctx) => {
        const { id } = req.params;
        if (id === '1') {
            return res(
                ctx.json({
                    success: true,
                    data: { _id: '1', name: 'Product 1', price: 100, description: 'Desc 1', inStock: true }
                })
            );
        }
        return res(ctx.status(404));
    }),
];
