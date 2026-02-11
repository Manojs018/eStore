# Service Level Agreement (SLA) & Uptime Targets

## 1. Service Commitment

eStore is committed to providing a reliable, high-quality service. This Service Level Agreement (SLA) outlines our uptime guarantees and recovery objectives.

### **Uptime Target: 99.9%**

We guarantee that the eStore Service (Core API, Frontend, and Database) will be available **99.9%** of the time during any monthly billing cycle.

| Commitment | Monthly Downtime Handling |
| :--- | :--- |
| **99.9%** | ~43 minutes / month |
| **99.0%** | ~7 hours / month |

---

## 2. Recovery Objectives

In the event of a disaster or major outage, we adhere to the following objectives:

### **Recovery Time Objective (RTO): 4 Hours**
*   **Definition**: The maximum acceptable length of time that the application can be offline.
*   **Goal**: Restore service within 4 hours of incident detection.

### **Recovery Point Objective (RPO): 24 Hours**
*   **Definition**: The maximum acceptable amount of data loss measured in time.
*   **Goal**: Restore data from the last daily backup (maximum 24 hours of data loss in catastrophic failure).

---

## 3. Monitoring & Reporting

### **SLA Dashboard**
We track our SLA performance using the following tools:

1.  **Public Status Page**: [status.estore.com](https://status.estore.com) (Simulated)
    *   Real-time uptime status.
    *   Incident history.
2.  **Internal Admin Dashboard**:
    *   Navigate to **Admin Panel > Monitoring**.
    *   View real-time System Uptime and Database Health.

### **Alerting**
*   **Downtime Alerts**: Notifies On-Call team immediately if uptime drops below target.
*   **Latency Alerts**: Triggered if API response time exceeds 500ms for > 5 minutes.

---

## 4. Scope & Exclusions

### **In Scope**
*   Frontend Application Availability
*   Backend API Availability
*   Database Connectivity
*   Checkout & Payment Processing Flows

### **Exclusions**
The SLA does not apply to:
1.  **Scheduled Maintenance**: Announced at least 24 hours in advance.
2.  **Force Majeure**: Events beyond our reasonable control (ISP failures, AWS region outages, natural disasters).
3.  **Client-Side Issues**: Issues caused by user equipment, browser, or network connection.
4.  **Third-Party Services**: Outages caused strictly by Stripe, SendGrid, or other external providers (though we will mitigate impact).

---

## 5. Service Credits

If we fail to meet the 99.9% uptime guarantee, customers may be eligible for service credits on a case-by-case basis (for Enterprise plans).

| Monthly Uptime Percentage | Service Credit |
| :--- | :--- |
| < 99.9% | 10% |
| < 99.0% | 25% |
| < 95.0% | 100% |
