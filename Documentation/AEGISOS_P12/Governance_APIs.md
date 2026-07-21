# AEGISOS Governance & Trust Platform REST API Reference

All Governance APIs are hosted under `/api/governance/`.

---

### 1. `GET /api/governance/policies`
Returns all registered declarative security policies.

---

### 2. `GET /api/governance/trust`
Returns entity trust scores across agents, tools, plugins, and workflows.

---

### 3. `GET /api/governance/audit`
Returns immutable audit logs of all permission decisions, tool invocations, and policy evaluations.

---

### 4. `GET /api/governance/alerts`
Returns security monitor alerts (policy violations, permission abuse, unauthorized execution attempts).

---

### 5. `GET /api/governance/identities`
Returns registered user, agent, and service identities.

---

### 6. `GET /api/governance/secrets`
Returns secret metadata (masked values only).

---

### 7. `GET /api/governance/compliance`
Returns workspace isolation rules and data retention status.

---

### 8. `GET /api/governance/metrics`
Returns platform metrics (total policies, total audit logs, denied count, security alerts count, average trust score).

---

### 9. `POST /api/governance/evaluate`
Evaluates a policy decision for an action request and logs an audit entry.

**Request Body**:
```json
{
  "action": "tool_file_read",
  "requester": "agent_librarian"
}
```
