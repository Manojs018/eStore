# Sitemap & SEO Guide

## Sitemap Overview

The project now includes a dynamically generated `sitemap.xml`.
This sitemap is served by the backend but is accessible via the frontend domain (due to proxying in development or Nginx routing in production).

**URL:** `/sitemap.xml` (e.g., `https://estore.example.com/sitemap.xml`)

### How it Works
1.  **Backend Route**: `routes/sitemap.js` fetches all active products from the database.
2.  **Generation**: It constructs an XML response following the [Sitemap Protocol](https://www.sitemaps.org/).
3.  **Metadata**:
    -   Static pages (Home, Products, Login, etc.) have predefined priorities and change frequencies.
    -   Product pages include the `lastmod` date based on the product's `updatedAt` timestamp.

## Submitting to Search Engines

### Google Search Console (GSC)
1.  Go to [Google Search Console](https://search.google.com/search-console).
2.  Select your property (domain).
3.  In the left sidebar, click on **Sitemaps**.
4.  Enter `sitemap.xml` in the "Add a new sitemap" field.
5.  Click **Submit**.
6.  GSC will verify the sitemap and start crawling the URLs.

### Robots.txt
A `robots.txt` file has been added to `frontend/public/robots.txt`.
It includes a directive pointing bots to the sitemap:
```
Sitemap: https://estore.example.com/sitemap.xml
```
*Make sure to update the domain in `robots.txt` and `backend/routes/sitemap.js` (via `CLIENT_URL` env var) when deploying to production.*

## Verification
You can verify the sitemap is working by:
-   Navigating to `http://localhost:3000/sitemap.xml` in your browser.
-   Using `curl http://localhost:3000/sitemap.xml`.
-   Checking that the XML contains `<url>` entries for your products.
