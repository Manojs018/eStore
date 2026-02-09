# Performance Monitoring Setup (New Relic)

This project uses **New Relic APM** to monitor backend performance, database queries, and resource usage.

## 1. Create New Relic Account
1. Go to [NewRelic.com](https://newrelic.com/signup) and sign up for a free account.
2. Select **Node.js** as your environment.
3. Get your **License Key** from the installation instruction page.

## 2. Configuration
1. Open `eStore/backend/newrelic.js`.
2. Ensure `app_name` matches your project name (default: `['eStore Backend']`).
3. Update `eStore/backend/.env` with your license key:
   ```env
   NEW_RELIC_LICENSE_KEY=your_actual_license_key_starts_with_eu_or_us...
   ```

## 3. Verify Installation
1. Start the backend:
   ```bash
   npm start
   ```
   You should see logs indicating the New Relic agent has started.
2. Generate some traffic:
   - Visit `http://localhost:3000`
   - Browse products, add to cart, check status page.
3. Go to **New Relic One** dashboard.
4. Click on **APM & Services** -> **eStore Backend**.

## 4. Key Metrics to Watch
- **Web transaction time**: Average response time for API requests.
- **Throughput**: Requests per minute (rpm).
- **Error rate**: Percentage of failed requests.
- **Apdex score**: User satisfaction score (aim for > 0.9).

## 5. Performance Dashboard (Frontend)
- We have added an internal performance overview at `/dashboard`.
- Visit `http://localhost:3000/dashboard` to see a summary of performance metrics (simulated/aggregated).

## 6. Setting up Alerts
In New Relic dashboard:
1. Go to **Alerts & AI** -> **Alert conditions**.
2. Create a condition for **High Response Time**:
   - Threshold: > 500ms for 5 minutes.
3. Create a condition for **High Error Rate**:
   - Threshold: > 1% errors for 5 minutes.
4. Set up notification channels (Email, Slack).
