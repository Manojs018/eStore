# Rollback Procedure

This document outlines the procedures for rolling back deployments and database changes for the eStore application.

## 1. Deployment Rollback

### Prerequisites
- Previous Docker images must be available in the container registry (tagged by Commit SHA).
- Access to the deployment environment (Railway/Render/Heroku/K8s).

### Procedure

#### Option A: Reverting to a Previous Docker Image
1.  Identify the Commit SHA of the last known good version.
2.  Update the deployment configuration to use the image tag corresponding to that SHA.
    -   Example: `estore-backend:a1b2c3d` instead of `estore-backend:latest`
3.  Redeploy the service.

#### Option B: GitHub Revert
1.  Revert the merge commit in GitHub.
2.  Push the reversion to the `main` branch.
3.  The CI/CD pipeline will automatically build and deploy the previous code state as a new version.

## 2. Database Rollback

We use `migrate-mongo` to manage database migrations.

### Prerequisites
- `migrate-mongo` must be installed and configured.
- Database connection string must be available in `MONGO_URI` environment variable.

### Procedure

To revert the last batch of applied migrations:

1.  Navigate to the `backend` directory.
2.  Run the rollback command:
    ```bash
    npm run list:migrations # Check status before rolling back
    npm run db:down         # Revert the last migration
    ```

### verification
1.  Check the logs to confirm the migration was reverted.
2.  Verify the database state (e.g., using Compass or a query).

## 3. Automated Rollback Script

A convenience script is available in `backend/scripts/rollback.js`.

**Usage:**
```bash
# Rollback the last database migration
npm run db:rollback
```

## 4. Runbook Entry: Emergency Rollback

**Severity:** Critical
**Trigger:** Production incident after a new deployment.

**Steps:**
1.  **Acknowledge**: Notify the team of the rollback initiation.
2.  **Database**: If the release included database schema changes that are causing issues:
    -   Run `cd backend && npm run db:down`.
    -   Verify database integrity.
3.  **Application**:
    -   If using Railway: "Rollback" feature in deployments tab.
    -   If using CI/CD: Revert the PR and merge.
4.  **Verify**:
    -   Run specific health checks: `npm run test:health`.
    -   Check error logs.
