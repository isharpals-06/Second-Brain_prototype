# AEGISOS Agent Runtime REST API Reference

All Agent Runtime APIs are hosted under `/api/agents/`.

---

### 1. `GET /api/agents`
Returns all registered and running agents with health status and heartbeat timestamps.

---

### 2. `GET /api/agents/:id`
Returns metrics and status for a specific agent ID.

---

### 3. `POST /api/agents/:id/start`
Starts an agent process.

---

### 4. `POST /api/agents/:id/pause`
Pauses an agent process.

---

### 5. `POST /api/agents/:id/resume`
Resumes a paused agent process.

---

### 6. `POST /api/agents/:id/stop`
Stops an agent process.

---

### 7. `POST /api/agents/:id/restart`
Restarts an agent process with crash recovery tracking.

---

### 8. `GET /api/agents/queue`
Returns execution queue status (pending, running, completed, failed counts).

---

### 9. `GET /api/agents/capabilities`
Returns dynamically discovered agent capabilities.

---

### 10. `GET /api/agents/messages`
Returns inter-agent message logs routed through the MessageRouter.

---

### 11. `GET /api/agents/metrics`
Returns runtime metrics (total agents, running count, task throughput, health score).
