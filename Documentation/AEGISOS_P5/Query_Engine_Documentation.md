# AEGISOS Knowledge Query Engine & REST API Reference

All Knowledge APIs are accessible under `/api/knowledge/`.

---

### 1. `GET /api/knowledge/entities`
Returns registered entities. Filter by type using `?type=note` or `?type=project`.

---

### 2. `GET /api/knowledge/relationships`
Returns property graph edges.

---

### 3. `GET /api/knowledge/entity/:id`
Returns entity details along with its graph neighborhood.

---

### 4. `POST /api/knowledge/query` (Hybrid Query)
Executes a hybrid search query combining graph traversal, semantic vector similarity, and metadata filters.

**Request Body**:
```json
{
  "queryText": "Operating Systems Deadlocks",
  "entityType": "note",
  "seedEntityId": "SecondBrain",
  "topK": 5
}
```

---

### 5. `GET /api/knowledge/search`
Executes a pure semantic vector search across indexed notes and documents. Query parameter: `?q=Semaphore&limit=5`.

---

### 6. `GET /api/knowledge/metrics`
Returns Knowledge subsystem metrics (entity count, edge count, vector count, update count).
