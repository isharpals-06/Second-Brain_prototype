# AEGISOS Workflow Orchestration Platform REST API Reference

All Workflow APIs are hosted under `/api/workflows/`.

---

### 1. `GET /api/workflows`
Returns all registered declarative workflow templates.

---

### 2. `GET /api/workflows/instances`
Returns all active, completed, or failed workflow instances.

---

### 3. `GET /api/workflows/instance/:id`
Returns state, step progress, variables, and latest checkpoint snapshot for an instance ID.

---

### 4. `POST /api/workflows/run`
Starts a declarative workflow instance.

**Request Body**:
```json
{
  "id": "wf_research_pipeline",
  "inputs": { "subject": "Operating Systems" }
}
```

---

### 5. `GET /api/workflows/approvals`
Returns all pending approval gate requests.

---

### 6. `POST /api/workflows/approve`
Approves a pending approval gate and resumes the workflow.

**Request Body**:
```json
{
  "approvalId": "appr_1784650877_a1b2"
}
```

---

### 7. `POST /api/workflows/reject`
Rejects an approval gate.

---

### 8. `GET /api/workflows/metrics`
Returns WOP performance metrics (registered count, total instances, completed count, failed count, pending approvals, success rate %).
