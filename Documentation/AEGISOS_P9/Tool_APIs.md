# AEGISOS Tool Runtime REST API Reference

All Tool Runtime APIs are hosted under `/api/tools/`.

---

### 1. `GET /api/tools`
Returns all registered tools with metadata, permissions, and health status.

---

### 2. `GET /api/tools/:id`
Returns details for a specific tool ID.

---

### 3. `POST /api/tools/execute`
Executes a tool through the hardware abstraction layer.

**Request Body**:
```json
{
  "id": "tool_file_read",
  "input": {
    "filePath": "C:\\Users\\ishar\\Projects\\SecondBrain\\README.md"
  }
}
```

---

### 4. `GET /api/tools/history`
Returns execution log history.

---

### 5. `GET /api/tools/metrics`
Returns Tool Runtime metrics (registered count, total executions, success count, failure count, success rate %, average duration ms).
