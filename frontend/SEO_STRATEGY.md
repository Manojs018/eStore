# eStore SEO & Meta Tag Strategy

## Overview

This document outlines the strategy for managing meta tags and SEO in the eStore frontend application using `react-helmet-async`.

## Components

### `SEO.js`

A reusable component located at `src/components/SEO.js`. It accepts the following props:

- `title`: The page title. Appended with ` | eStore`.
- `description`: The meta description. Defaults to a site-wide description.
- `image`: The URL for the Open Graph and Twitter card image. Defaults to a placeholder.
- `url`: The canonical URL of the page.
- `type`: The Open Graph type (e.g., `website`, `product`). Defaults to `website`.

## Implementation Details

### Basic Meta Tags

- `<title>`: Dynamic title for each page.
- `<meta name="description">`: Page-specific description.
- `<link rel="canonical">`: Canonical URL to prevent duplicate content issues.

### Open Graph (OG) Tags

Used for social media previews (Facebook, LinkedIn, etc.):
- `og:title`: Same as page title.
- `og:description`: Same as meta description.
- `og:image`: Product image or default site image.
- `og:url`: Canonical URL.
- `og:type`: `website` for general pages, `product` for product details.
- `og:site_name`: "eStore".

### Twitter Card Tags

Used for Twitter previews:
- `twitter:card`: Set to `summary_large_image`.
- `twitter:title`: Same as page title.
- `twitter:description`: Same as meta description.
- `twitter:image`: Same as OG image.

## Usage Guide

Import the `SEO` component and place it inside the component for any page you want to optimize.

```jsx
import SEO from '../components/SEO';

const MyPage = () => {
  return (
    <div>
      <SEO 
        title="My Page Title" 
        description="This is a description of my page."
        url="https://estore.example.com/my-page"
      />
      {/* ... content */}
    </div>
  );
};
```

## Testing

To verify the tags:
1. inspect the DOM elements in the `<head>` section using browser developer tools.
2. Use tools like [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) or [Twitter Card Validator](https://cards-dev.twitter.com/validator) (requires a public URL).
