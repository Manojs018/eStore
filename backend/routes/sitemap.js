const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { format } = require('date-fns');

const generateSitemap = async (req, res) => {
    try {
        const products = await Product.find({ isActive: true, isDeleted: false });

        const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

        // Static pages
        const staticPages = [
            '/',
            '/products',
            '/about',
            '/contact',
            '/login',
            '/register'
        ];

        staticPages.forEach(page => {
            xml += `  <url>
    <loc>${baseUrl}${page}</loc>
    <changefreq>${page === '/' ? 'daily' : 'weekly'}</changefreq>
    <priority>${page === '/' ? '1.0' : '0.8'}</priority>
  </url>
`;
        });

        // Dynamic product pages
        products.forEach(product => {
            const updatedAt = product.updatedAt ? new Date(product.updatedAt).toISOString() : new Date().toISOString();
            xml += `  <url>
    <loc>${baseUrl}/product/${product._id}</loc>
    <lastmod>${updatedAt}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`;
        });

        xml += `</urlset>`;

        res.header('Content-Type', 'application/xml');
        res.send(xml);
    } catch (error) {
        console.error('Sitemap generation error:', error);
        res.status(500).send('Error generating sitemap');
    }
};

router.get('/sitemap.xml', generateSitemap);

module.exports = router;
