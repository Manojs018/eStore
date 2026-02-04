# GitHub Secrets Setup

The CI/CD pipeline requires several secrets to be configured in the GitHub repository settings to function correctly.

## Required Secrets

Go to **Settings** -> **Secrets and variables** -> **Actions** -> **New repository secret** and add the following:

| Secret Name | Description | Example / Note |
|:--- |:--- |:--- |
| `STRIPE_PUBLIC_KEY` | Stripe Publishable Key | `pk_test_...` |
| `STRIPE_SECRET_KEY` | Stripe Secret Key | `sk_test_...` |
| `MONGODB_URI` | Mongo DB Connection String | `mongodb://...` |
| `JWT_SECRET` | Secret for signing JWTs | Random strong string |
| `EMAIL_USER` | Email address for sending notifications | `user@gmail.com` |
| `EMAIL_PASSWORD` | App password for the email account | App Password (not login password) |
| `ADMIN_EMAIL` | Email to receive admin notifications | `admin@estore.com` |

## Deployment Secrets (Optional - for Vercel Preview)

| Secret Name | Description |
|:--- |:--- |
| `VERCEL_TOKEN` | Vercel API Token |
| `VERCEL_ORG_ID` | Vercel Organization ID |
| `VERCEL_PROJECT_ID` | Vercel Project ID |

## Staging Environment Secrets

These are required for the automated staging deployment job:

| Secret Name | Description |
|:--- |:--- |
| `STAGING_MONGODB_URI` | Separate DB for staging |
| `STAGING_STRIPE_SECRET_KEY` | Stripe Test Key (can be same as dev) |
| `STAGING_CLIENT_URL` | URL of deployed staging frontend |

## Notes

- **Tests**: The pipeline includes fallback values for tests (`dummy` values) if secrets are not provided, but for integration tests to mimic production behavior or for deployment steps, accurate secrets are required.
- **Security**: Never commit real secret values to `cicd.yml` or any bridged file. Always use the Secrets reference.
