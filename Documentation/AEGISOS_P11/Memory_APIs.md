# AEGISOS Memory OS REST API Reference

All Memory OS APIs are hosted under `/api/memory/`.

---

### 1. `GET /api/memory/search`
Hybrid search across long-term memory objects.

**Query Parameters**:
- `q`: Search query string
- `type`: Filter by MemoryType (`semantic`, `learning`, etc.)
- `limit`: Result count (default: 10)

---

### 2. `GET /api/memory/recent`
Returns recently updated memory entries.

---

### 3. `GET /api/memory/important`
Returns memories ranked by importance score.

---

### 4. `GET /api/memory/reflection`
Triggers and returns the latest reflection report.

---

### 5. `GET /api/memory/experience`
Returns experience history records.

---

### 6. `GET /api/memory/metrics`
Returns Memory OS platform metrics.

---

### 7. `POST /api/memory/store`
Creates a new long-term memory object.

---

### 8. `POST /api/memory/consolidate`
Triggers an on-demand memory consolidation pass.

---

### 9. `DELETE /api/memory/:id`
Purges/forgets a memory entry with audit logging.
