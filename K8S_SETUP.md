# Kubernetes Setup Guide

This guide describes how to deploy the eStore application to a Kubernetes cluster.

## Prerequisites
- A running Kubernetes cluster (Minikube, Docker Desktop, GKE, EKS, etc.)
- `kubectl` command-line tool installed and configured.
- Docker images built and available to the cluster (or pushed to a registry).

## 1. Configuration (Secrets & ConfigMaps)

First, create the configuration and sensitive data storage.

```bash
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
```

**Note:** The `secret.yaml` contains base64 encoded dummy values. For production, replace them with your actual secrets encoded in base64.

## 2. Database

Deploy MongoDB with persistent storage.

```bash
kubectl apply -f k8s/mongo.yaml
```

Wait for MongoDB to be ready:
```bash
kubectl get pods -w
```

## 3. Application Services

Deploy the Backend and Frontend services.

```bash
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
```

The pods include:
- **Resource Limits:** CPU and Memory constraints.
- **Health Probes:** Liveness and Readiness checks to ensure traffic only goes to healthy pods.

## 4. Ingress (Routing)

Deploy the Ingress resource to route traffic to the appropriate services.

```bash
kubectl apply -f k8s/ingress.yaml
```

**Routing Rules:**
- `/api/*` -> Backend Service (Port 5000)
- `/*` -> Frontend Service (Port 80)

## 5. Verification

Check the status of all resources:

```bash
kubectl get all
kubectl get ingress
```

To test the application locally (if using Minikube):
```bash
minikube tunnel
```
Then access `http://localhost` (or the Ingress IP).

## Troubleshooting

If pods are crashing, check logs:
```bash
kubectl logs <pod-name>
```

If probes fail, check describe:
```bash
kubectl describe pod <pod-name>
```
