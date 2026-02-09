# Uptime Monitoring Setup

This guide walks you through setting up uptime monitoring for your eStore application using **UptimeRobot**, a free and reliable service.

## 1. Prerequisites
- Your application backend must be deployed and accessible publicly (e.g., via Render, Heroku, AWS).
- The `/health` endpoint must be working (we've verified it locally).

## 2. Setup UptimeRobot (Free Plan)
1. Go to [UptimeRobot.com](https://uptimerobot.com/) and create a free account.
2. Click **Add New Monitor**.
3. Select **Monitor Type**: `HTTP(s)`.
4. **Friendly Name**: `eStore Backend API`.
5. **URL (or IP)**: `https://your-backend-domain.com/health`.
   - *Note: Replace with your actual production URL.*
6. **Monitoring Interval**: `5 minutes` (free plan).
7. **Select Alert Contacts**: Check your email (or add Slack/SMS integrations if needed).

## 3. Verify Health Check
- UptimeRobot will ping your `/health` endpoint.
- It expects a `200 OK` status code.
- If your database goes down, your `/health` endpoint returns `503 Service Unavailable`, triggering an alert.

## 4. Setup Status Page (Public)
1. In UptimeRobot dashboard, click **Status Pages** -> **Add Status Page**.
2. **Friendly Name**: `eStore Status`.
3. **Monitors**: Select the monitors you just created.
4. Customize appearance and URL (e.g., `status.uptimerobot.com/your-page`).
5. Share this URL with your team or link it in your documentation.

## 5. In-App Status Page (Internal)
- We have added a `/status` page to your frontend application.
- Visit `http://localhost:3000/status` (or your production frontend URL) to see real-time health metrics.
- This page checks:
  - API Reachability
  - Database Connection
  - System Uptime

## 6. Incident Response Plan
- **Level 1 (Warning)**: High latency or brief 503 errors. Check logs.
- **Level 2 (Critical)**: Service Down alert received.
  1. Acknowledge alert.
  2. Check Sentry for error details.
  3. Check server logs.
  4. Update Status Page with "Investigating".
  5. Restart services if needed.
  6. Resolve issue and update Status Page to "Operational".
