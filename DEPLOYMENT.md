# Deployment Guide

This guide provides comprehensive instructions for deploying the eStore application using various methods: **Docker Compose**, **Kubernetes**, and **PaaS providers** (Railway/Heroku).

---

## 📋 Prerequisites

Before you begin, ensure you have:

1.  **Git**: Installed and configured.
2.  **Docker & Docker Compose**: For containerized deployment.
3.  **Kubectl & Minikube/Kind** (Optional): For Kubernetes deployment.
4.  **MongoDB Atlas Account** (Optional): If using a cloud database instead of a local container.
5.  **Stripe Account**: For payment processing (Test keys).

---

## 🔑 Environment Variables Reference

These variables are required for the application to function correctly.

### Backend

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://admin:password@mongodb:27017/estore?authSource=admin` |
| `JWT_SECRET` | Secret for signing JWTs | `your_long_random_secret_string` |
| `STRIPE_SECRET_KEY` | Stripe Secret Key | `sk_test_...` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:3000` |
| `ADMIN_URL` | Admin URL for emails | `http://localhost:3000` |
| `EMAIL_USER` | Email for sending notifications | `verify@estore.com` |
| `EMAIL_PASS` | Email password/App password | `your_email_password` |
| `ADMIN_EMAIL` | Admin email address | `admin@estore.com` |

### Frontend

| Variable | Description | Example |
| :--- | :--- | :--- |
| `REACT_APP_STRIPE_PUBLISHABLE_KEY` | Stripe Public Key | `pk_test_...` |
| `REACT_APP_API_URL` | Backend API URL | `http://localhost:5000/api` |

---

## 🐳 Docker Deployment (Docker Compose)

The easiest way to run the full stack (Frontend, Backend, MongoDB) locally or on a VPS.

### 1. Configure Environment
*   **Backend**: Ensure `backend/.env` exists with the variables listed above.
    *   *Note*: `MONGO_URI` is automatically overridden by Docker Compose to point to the local MongoDB container.
*   **Frontend**: Ensure `frontend/.env` exists with `REACT_APP_` variables for the build process.

### 2. Build and Run
Run the following command in the project root:

```bash
docker-compose up --build -d
```

### 3. Verify Deployment
*   **Frontend**: [http://localhost:3000](http://localhost:3000)
*   **Backend Health**: [http://localhost:5000/health](http://localhost:5000/health)
*   **Swagger API Docs**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

### 4. Stop Services
```bash
docker-compose down
```

---

## ☸️ Kubernetes Deployment

Deploy to a Kubernetes cluster (Minikube, EKS, GKE, etc.).

### 1. Prerequisites
*   Ensure `kubectl` is configured to point to your cluster.
*   Navigate to the `k8s/` directory.

### 2. Apply Configuration & Secrets
**Important**: modifying `k8s/secret.yaml` with your actual base64 encoded secrets before applying.

```bash
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
```

### 3. Deploy Database (MongoDB)
If you are NOT using an external MongoDB (Atlas), deploy the in-cluster MongoDB:

```bash
kubectl apply -f k8s/mongo.yaml
```

### 4. Deploy Backend & Frontend
```bash
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
```

### 5. Expose Services (Ingress)
Ensure you have an Ingress Controller (like Nginx) installed.

```bash
kubectl apply -f k8s/ingress.yaml
```

### 6. Verify Status
```bash
kubectl get pods
kubectl get services
kubectl get ingress
```

---

## ☁️ PaaS Deployment (Railway/Heroku/Render)

### Railway (Recommended)
1.  **Connect GitHub**: Login to Railway and select "Deploy from GitHub repo".
2.  **Select Repo**: Choose `eStore`.
3.  **Variables**: Add all Backend Environment Variables in the project settings.
    *   *Note*: Railway provides a MongoDB service plugin you can add easily.
4.  **Frontend**: If creating a separate service for frontend, ensure build command is `npm run build` and start command serves the `build` folder.

### Heroku
1.  **Install CLI**: `npm install -g heroku` & `heroku login`.
2.  **Backend**:
    ```bash
    heroku create estore-api
    heroku config:set MONGO_URI="..." JWT_SECRET="..." ...
    git subtree push --prefix backend heroku main
    ```
3.  **Frontend**:
    ```bash
    heroku create estore-ui
    heroku buildpacks:set mars/create-react-app
    git subtree push --prefix frontend heroku main
    ```

---

## 🔧 Troubleshooting

### Docker Issues
*   **Container fails to start**: Check logs with `docker-compose logs <service_name>`.
*   **MongoDB Connection Error**: Ensure `MONGO_URI` in backend matches the container name (e.g., `mongodb://mongodb:27017...`) or Atlas URI.
*   **Hot Reload not working**: In Windows, you may need to enable polling or check volume mounts.

### Kubernetes Issues
*   **CrashLoopBackOff**: Check pod logs: `kubectl logs <pod-name>`.
*   **Pending Pods**: Check describe for resource issues: `kubectl describe pod <pod-name>`.
*   **Ingress 404**: Ensure the Ingress Controller is running and the `host` in `ingress.yaml` matches your domain (or remove host for localhost testing).

### Deployment Issues
*   **CORS Error**: Ensure `CLIENT_URL` env var matches the frontend domain exactly.
*   **White Screen (Frontend)**: Check browser console for errors. Often due to missing `REACT_APP_...` env vars at build time.

---

## 📊 Monitoring & Health Checks

### Health Endpoint
The backend exposes a health check endpoint for uptime monitoring:
*   **URL**: `/health`
*   **Response**: `{"status": "ok", "timestamp": "...", "uptime": ...}`

### Logging
*   **Docker**: `docker-compose logs -f backend`
*   **Kubernetes**: `kubectl logs -f -l app=backend`
*   **Files**: Logs are also written to `backend/logs/` if configured (ensure volume persistence).

### Metrics
*   Integration with tools like **Sentry** and **New Relic** is supported if environment variables are configured (`SENTRY_DSN`, `NEW_RELIC_LICENSE_KEY`).
