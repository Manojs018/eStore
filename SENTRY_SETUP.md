# Sentry Error Tracking Setup

This project has been configured with Sentry for error tracking and performance monitoring.

## 1. Create Sentry Account
- Go to [Sentry.io](https://sentry.io/signup/) and sign up.
- Create a new Organization if prompted.

## 2. Backend Setup (Node.js)
1. In Sentry, create a new **Node.js** (Express) project.
2. Get the **DSN** (Client Key) from `Settings > Client Keys (DSN)`.
3. Open `eStore/backend/.env` file.
4. Replace the placeholder DSN with your actual DSN:
   ```env
   SENTRY_DSN=https://your_backend_dsn@o0.ingest.sentry.io/0
   ```
5. Restart the backend server:
   ```bash
   cd backend
   npm start
   ```

## 3. Frontend Setup (React)
1. In Sentry, create a new **React** project.
2. Get the **DSN** from `Settings > Client Keys (DSN)`.
3. Open `eStore/frontend/.env` file.
4. Replace the placeholder DSN:
   ```env
   REACT_APP_SENTRY_DSN=https://your_frontend_dsn@o0.ingest.sentry.io/0
   ```
5. Rebuild/Restart the frontend:
   ```bash
   cd frontend
   npm run build
   # or
   npm start
   ```

## 4. Verify Integration
- **Backend:** visit `http://localhost:5000/debug-sentry`. It should trigger an error and report to Sentry.
- **Frontend:** visit `http://localhost:3000/sentry-test`. Click the "Break me" button to trigger a frontend error.

## 5. View Errors
- Go to your Sentry Dashboard.
- You should see the error events from both backend and frontend.
