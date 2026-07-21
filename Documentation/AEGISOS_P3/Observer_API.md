# AEGISOS Sentinel Perception REST API Reference

All endpoints are hosted under `/api/sentinel/`.

---

### 1. `GET /api/sentinel/status`
Returns overall Sentinel perception runtime status, health metrics, and observer count.

**Response**:
```json
{
  "status": "active",
  "version": "v0.2.0-Sentinel",
  "metrics": {
    "totalObservers": 6,
    "activeObservers": 6,
    "totalEvents": 42,
    "totalErrors": 0,
    "healthMonitorActive": true
  },
  "observers": [ ... ]
}
```

---

### 2. `GET /api/sentinel/observers`
Returns a list of all registered observers, their states, event counts, and error metrics.

---

### 3. `GET /api/sentinel/events`
Returns recent Sentinel perception events. Optional query parameter `?limit=20`.

---

### 4. `POST /api/sentinel/observers/:id/toggle`
Toggles an observer between `running` and `paused` states.

---

### 5. `POST /api/sentinel/observers/:id/restart`
Triggers an immediate isolated restart of the specified observer.
