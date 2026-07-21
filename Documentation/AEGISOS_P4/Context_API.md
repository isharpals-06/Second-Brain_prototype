# AEGISOS World Model Context REST API Reference

All endpoints are hosted under `/api/world/`.

---

### 1. `GET /api/world/state`
Returns the current unified World Model state object.

---

### 2. `GET /api/world/session`
Returns current active session metrics, duration, resources used, and session history.

---

### 3. `GET /api/world/projects`
Returns active project details, branch name, and recent file activity.

---

### 4. `GET /api/world/workspace`
Returns current workspace path and directory history.

---

### 5. `GET /api/world/timeline`
Returns the append-only activity timeline stream. Optional parameters: `?category=vault&limit=20`.

---

### 6. `GET /api/world/graph`
Returns the relationship graph nodes and edges.

---

### 7. `GET /api/world/metrics`
Returns World Model observability metrics (processed events, correlated events, graph counts).
