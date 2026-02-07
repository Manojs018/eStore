# Production Runbook & Incident Response Guide

## 🚨 Emergency Contacts

| Role | Name | Phone | Email |
|------|------|-------|-------|
| **On-Call Engineer** | [Name] | [Phone] | oncall@estore.com |
| **Engineering Lead** | [Name] | [Phone] | lead@estore.com |
| **CTO** | [Name] | [Phone] | cto@estore.com |

**Escalation Policy:**
1.  **Level 1**: On-Call Engineer (Response within 15m)
2.  **Level 2**: Engineering Lead (If unresolved after 1hr)
3.  **Level 3**: CTO (If major outage persists > 4hrs)

---

## 🛠️ Common Issues & Solutions

### 1. Database Connection Failure
**Symptoms:** `500 Internal Server Error`, Logs show `MongooseServerSelectionError`.
**Diagnosis:**
```bash
# Check Backend Logs
docker logs estore-backend
# OR
kubectl logs -l app=backend
```
**Resolution:**
1.  Check MongoDB Status: `docker ps` or `kubectl get pods`.
2.  Verify Network: Can backend reach mongo?
3.  Verify Credentials: Check `MONGO_URI` secret.
4.  **Restart Database:** `docker restart estore-mongo`.

### 2. High API Latency / Timeouts
**Symptoms:** Slow page loads, `504 Gateway Timeout`.
**Diagnosis:**
1.  Check CPU/Memory usage: `docker stats` or `kubectl top pods`.
2.  Check for slow queries in MongoDB logs.
**Resolution:**
1.  **Scale Up:** Increase replicas (K8s: `kubectl scale deploy backend --replicas=3`).
2.  **Restart Service:** If memory leak suspected, restart backend.

### 3. Deployment Failure (Bad Code)
**Symptoms:** New features broken, boot loops.
**Resolution:**
-   **Immediate:** See [ROLLBACK.md](./ROLLBACK.md).

---

## 🔄 Recovery Procedures

### Backup Strategy
-   **Frequency:** Daily (00:00 UTC).
-   **Retention:** 30 days.
-   **Location:** S3 Bucket `estore-backups`.

### Disaster Recovery (Restore)
**RTO (Recovery Time Objective):** < 4 Hours
**RPO (Recovery Point Objective):** < 24 Hours

**Procedure:**
1.  **Locate Backup:** Find latest dump in S3.
2.  **Download:** `aws s3 cp s3://estore-backups/latest.dump .`
3.  **Restore:**
    ```bash
    mongorestore --uri="$MONGO_URI" --drop ./latest.dump
    ```
4.  **Verify:** Check record counts in critical collections (Users, Orders).

---

## 🔍 Troubleshooting Flowchart

1.  **Is the site accessible?**
    *   **NO** -> Check Load Balancer / Ingress -> Check Frontend Pods.
    *   **YES** -> Go to step 2.

2.  **Can you login?**
    *   **NO** -> Check Backend Logs -> Check Database Connection.
    *   **YES** -> Go to step 3.

3.  **Are orders failing?**
    *   **YES** -> Check Stripe API Keys -> Check Webhook Logs.

---

## 📝 Incident Post-Mortem Template

**Date:**
**Status:** Resolved
**Duration:**
**Impact:** [User impact]
**Root Cause:** [Technical cause]
**Timeline:**
-   [Time] Incident detected
-   [Time] Fix applied
**Action Items:**
1.  [Preventative Measure 1]
2.  [Preventative Measure 2]
