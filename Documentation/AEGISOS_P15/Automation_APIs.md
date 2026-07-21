# AEGISOS Automation Platform REST API Reference

All Automation APIs are hosted under `/api/automation/`.

---

### 1. `GET /api/automation/list`
Returns all registered declarative automations.

---

### 2. `GET /api/automation/analytics`
Returns automation metrics (execution counts, success rates, time saved).

---

### 3. `GET /api/automation/level`
Returns the active Autonomy Safety Level (e.g. `L1_recommendation`).

---

### 4. `POST /api/automation/level`
Updates the Autonomy Safety Level.

**Request Body**:
```json
{
  "level": "L2_approval"
}
```

---

### 5. `POST /api/automation/trigger/:id`
Triggers an automation through the policy-aware executor and simulation checks.

---

### 6. `GET /api/automation/approvals`
Returns pending human-in-the-loop approval requests.

---

### 7. `GET /api/automation/rollbacks`
Returns execution rollback logs.

---

### 8. `POST /api/automation/rollback/:id`
Manually triggers a rollback for an execution ID.
