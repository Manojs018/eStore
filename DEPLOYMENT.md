# Deployment Guide

This guide provides step-by-step instructions for deploying the eStore application to production. We recommend using **Railway** or **Render** as they offer excellent support for Node.js and Docker applications, but the principles apply to **Heroku** and others as well.

---

## 📋 Prerequisites

Before you begin, ensure you have dependencies ready:
1.  **GitHub Account**: Your code must be pushed to a repository.
2.  **MongoDB Atlas Account**: For a production-ready database.
3.  **Stripe Account**: For payment processing (use Test mode API keys).
4.  **Hosting Account**: Railway, Render, or Heroku.

---

## 🗄️ Step 1: Database Setup (MongoDB Atlas)

1.  **Create an Account**: Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up.
2.  **Deploy a Cluster**: Create a free "Shared" cluster.
3.  **Create Database User**:
    *   Go to **Database Access**.
    *   Add a new database user (e.g., `estore_admin`).
    *   **Important**: Use a strong password and save it securely.
4.  **Network Access**:
    *   Go to **Network Access**.
    *   Add IP Address -> "Allow Access from Anywhere" (`0.0.0.0/0`) (Required for cloud hosting).
5.  **Get Connection String**:
    *   Click **Connect** on your cluster.
    *   Select **Drivers** (Node.js).
    *   Copy the connection string. It looks like: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority`.

---

## 🚀 Step 2: Deployment (Railway.app Recommended)

Railway is easiest because it detects the repository structure automatically.

### 1. Project Setup
1.  Log in to [Railway.app](https://railway.app/).
2.  Click **New Project** -> **Deploy from GitHub repo**.
3.  Select your `eStore` repository.
4.  Railway will likely detect two distinct root folders (`backend` and `frontend`) or just the root.

### 2. Deploying Backend
1.  Add a service within Railway for the **Backend**.
2.  **Settings**:
    *   Root Directory: `backend`
    *   Build Command: `npm install`
    *   Start Command: `npm start`
3.  **Variables** (Environment Variables):
    Add the following variables:
    *   `NODE_ENV`: `production`
    *   `PORT`: `5000` (or let Railway assign one)
    *   `MONGO_URI`: (Paste your Atlas connection string, replace `<password>`)
    *   `JWT_SECRET`: (Generate a long random string)
    *   `STRIPE_SECRET_KEY`: (Your Stripe Secret Key `sk_test_...`)
    *   `CLIENT_URL`: `https://<your-frontend-domain>.up.railway.app` (You will look this up after deploying frontend)
    *   `ADMIN_URL`: `https://<your-frontend-domain>.up.railway.app`
    *   `EMAIL_USER`: (Your email)
    *   `EMAIL_PASS`: (Your App Password)
    *   `ADMIN_EMAIL`: (Your admin email)

### 3. Deploying Frontend
1.  Add a second service for the **Frontend**.
2.  **Settings**:
    *   Root Directory: `frontend`
    *   Build Command: `npm install && npm run build`
    *   Start Command: `npm install -g serve && serve -s build -l 3000` (or use Nginx Dockerfile if preferred)
3.  **Variables**:
    *   `REACT_APP_STRIPE_PUBLISHABLE_KEY`: (Your Stripe Public Key `pk_test_...`)
4.  **Networking**:
    *   Expose this service to the public internet (Railway will generate a domain).
    *   Start port: `3000`.

### 4. Linking
1.  Copy the **Frontend Domain** (e.g., `estore-frontend.up.railway.app`) and update the `CLIENT_URL` in the **Backend** variables.
2.  Copy the **Backend Domain** (e.g., `estore-backend.up.railway.app`) and update the `package.json` proxy in Frontend OR configure Nginx proxying.
    *   *Note*: For React production, `proxy` in package.json doesn't work. You must set the API base URL in your frontend code using an environment variable like `REACT_APP_API_URL`.
    *   You may need to update `frontend/src/services/api.js` (or created axios instance) to use `process.env.REACT_APP_API_URL`.

---

## 🚢 Step 2 (Alternative): Heroku

1.  **Install Heroku CLI**: `npm install -g heroku`.
2.  **Login**: `heroku login`.

### Backend
1.  Create app: `heroku create estore-api`.
2.  Set configs:
    ```bash
    heroku config:set MONGO_URI="mongodb+srv..." -a estore-api
    heroku config:set JWT_SECRET="secret" -a estore-api
    # ... set all other env vars
    ```
3.  Deploy:
    ```bash
    git subtree push --prefix backend heroku main
    ```

### Frontend
1.  Create app: `heroku create estore-ui`.
2.  Set buildpack: `heroku buildpacks:set mars/create-react-app -a estore-ui`.
3.  Deploy:
    ```bash
    git subtree push --prefix frontend heroku main
    ```

---

## ✅ Step 3: Post-Deployment Checks

Once deployed, perform these checks:

1.  **Health Check**: Visit `https://<your-backend-url>/health`.
    *   Expected: `{"status": "ok", "checks": { "database": "ok", ... }}`
2.  **Frontend Load**: Visit your frontend URL. The homepage should load without errors.
3.  **Registration**: Try to register a new user.
    *   Check if you receive the **Welcome Email**.
4.  **Login**: Log in with the new user.
5.  **Payment (Test)**: Add an item to cart and proceed to checkout using Stripe Test Card (e.g., `4242 4242...`).

---

## 🔧 Troubleshooting

### Database Connection Error
*   **Symptom**: `GET /health` shows `("status": "error", "database": "error")` or logs show `MongooseServerSelectionError`.
*   **Fix**: Check MongoDB Atlas **Network Access**. Ensure `0.0.0.0/0` is whitelisted. Verify connection string password matches exactly.

### CORS Error
*   **Symptom**: Frontend shows `Access to XMLHttpRequest blocked by CORS policy`.
*   **Fix**: Ensure `CLIENT_URL` environment variable in the Backend exactly matches your Frontend URL (no trailing slash).

### Stripe Error
*   **Symptom**: 500 Error during checkout.
*   **Fix**: Ensure `STRIPE_SECRET_KEY` is set in Backend and `REACT_APP_STRIPE_PUBLISHABLE_KEY` is set in Frontend.

### Admin Access
*   **How to create admin?**: You cannot register as admin.
    *   **Fix**: Connect to MongoDB Atlas using Compass. Find your user document. Edit `role` from `user` to `admin`.

---

## 🔒 GitHub Secrets (for CI/CD)

If using the GitHub Actions pipeline (`cicd.yml`), verify these secrets in **Settings > Secrets**:
*   `MONGODB_URI`
*   `JWT_SECRET`
*   `STRIPE_SECRET_KEY`
*   `STRIPE_PUBLIC_KEY`
*   `EMAIL_USER`
*   `EMAIL_PASS`
