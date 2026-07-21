# AEGISOS Decision Simulation Engine REST API Reference

All Simulation APIs are hosted under `/api/simulation/`.

---

### 1. `POST /api/simulation/run`
Runs a virtual simulation on a plan object without side effects.

**Request Body**:
```json
{
  "plan": {
    "id": "plan_123",
    "goalId": "goal_456",
    "tasks": [...]
  }
}
```

---

### 2. `GET /api/simulation/reports`
Returns all generated virtual simulation reports.

---

### 3. `GET /api/simulation/report/:id`
Returns details for a specific simulation report.

---

### 4. `GET /api/simulation/metrics`
Returns Decision Simulation Engine metrics (simulations executed, approved plans, rejected plans, average latency).
