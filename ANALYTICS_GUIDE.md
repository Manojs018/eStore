# Google Analytics Implementation Guide

This project uses `react-ga4` to track user behavior and key metrics.

## 1. Configuration

1.  Open `src/utils/analytics.js`.
2.  Replace `G-XXXXXXXXXX` with your actual Google Analytics 4 Measurement ID.

## 2. Tracked Events

### Page Views
-   Automatically tracked on every route change via `PageTracker` and `useEffect` in `App.js`.

### Key Events
The following events are explicitly tracked:

| Event Name | Trigger | parameters |
| :--- | :--- | :--- |
| `page_view` | Route change | `page_path` |
| `view_item` | Opening a product detail page | `item_name` |
| `add_to_cart` | Clicking "Add to Cart" | `value`, `currency`, `items`, `item_id`, `item_name`, `price`, `quantity` |
| `purchase` | Successful payment | `transaction_id`, `value`, `currency` |

## 3. Setting Up Conversion Goals (GA4)

In GA4, "Goals" are now "Conversions".

1.  Go to **Admin** > **Property** > **Events**.
2.  You will see `purchase` automatically marked as a conversion.
3.  To mark `add_to_cart` as a conversion:
    *   Find the `add_to_cart` event in the list (you may need to wait up to 24h for data to flow in, or create it manually).
    *   Toggle the **Mark as conversion** switch.

## 4. Setting Up Audience Segments

Use Audiences to group users (e.g., "Purchasers" vs "Cart Abandoners").

1.  Go to **Configure** > **Audiences**.
2.  Click **New Audience**.
3.  **Purchasers**:
    *   Condition: Event `purchase` count > 0.
4.  **Cart Abandoners**:
    *   Condition: Event `add_to_cart` count > 0.
    *   **AND**
    *   Exclude: Event `purchase` count > 0.

## 5. Dashboard for Metrics

Access your metrics dashboard directly in Google Analytics:

*   **Realtime**: See users currently on site and events firing.
*   **Life Cycle > Monetization > Ecommerce purchases**: View revenue, products sold, and "add to cart" stats.
*   **Life Cycle > Engagement > Events**: View breakdown of all custom events.

## Troubleshooting

-   **No Data?**
    -   Check if ad blockers are enabled (they often block GA).
    -   Verify the Measurement ID in `src/utils/analytics.js`.
    -   Check the browser console for any "GA4" errors.
