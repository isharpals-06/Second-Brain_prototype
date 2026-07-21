# AEGISOS Executive Planner REST API Reference

All Planner APIs are hosted under `/api/planner/`.

---

### 1. `GET /api/planner/intent`
Returns inferred user intent, confidence score, and supporting evidence.

---

### 2. `GET /api/planner/goals`
Returns active goals. Optional filter: `?status=active`.

---

### 3. `POST /api/planner/goals`
Creates or proposes a new goal.

---

### 4. `GET /api/planner/priorities`
Returns calculated priority rankings and explanation rationale for all goals.

---

### 5. `GET /api/planner/plans`
Returns generated execution plans.

---

### 6. `POST /api/planner/plan/generate`
Generates a structured execution plan for a specific goal ID.

**Request Body**:
```json
{
  "goalId": "goal_aegisos_core"
}
```

---

### 7. `GET /api/planner/recommendations`
Returns proactive non-intrusive recommendations.

---

### 8. `GET /api/planner/decisions`
Returns ranked decision alternatives and reasoning traces.

---

### 9. `GET /api/planner/constraints`
Returns active system runtime constraints.

---

### 10. `GET /api/planner/metrics`
Returns Planner observability metrics (goals count, plans count, recommendations count, confidence).
