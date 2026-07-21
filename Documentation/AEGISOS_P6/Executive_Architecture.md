# AEGISOS v0.4.0 — ADR-005: Executive Planner Architecture

## Overview

The Executive Planner is the strategic reasoning layer of AEGISOS. It analyzes current world state, evaluates priorities, infers user intent, formulates goals, decomposes objectives, evaluates system constraints, and produces structured execution plans.

**STRICT PRINCIPLE**: Separate thinking from execution. The Executive Planner **thinks**. It **never acts**. It does NOT execute tools, run shell commands, or mutate files. Action execution belongs exclusively to the future Agent Runtime.

---

## Subsystem Architecture

```
                               ┌────────────────────────────────┐
                               │ World Model & Knowledge Graph  │
                               └───────────────┬────────────────┘
                                               │
                               ┌───────────────▼────────────────┐
                               │       Executive Runtime        │
                               └───────────────┬────────────────┘
                                               │
┌──────────────────────────────────────────────┴──────────────────────────────────────────────┐
│                                     Executive Modules                                       │
├─────────────────────┬─────────────────────┬─────────────────────┬───────────────────────────┤
│    Intent Engine    │     Goal Engine     │   Priority Engine   │     Constraint Engine     │
│(Infers User Intent) │ (Goal Formulation)  │ (Evaluates Urgency) │ (Runtime Limit Evaluator) │
├─────────────────────┼─────────────────────┼─────────────────────┼───────────────────────────┤
│   Planning Engine   │   Decision Engine   │Recommendation Engine│       Plan Validator      │
│(Hierarchical Plans) │ (Alternative Ranks) │(Proactive Insights) │(Plan Safety & Pre-Checks) │
└─────────────────────┴─────────────────────┴─────────────────────┴───────────────────────────┘
                                               │
                               ┌───────────────▼────────────────┐
                               │      Planner API Facade        │
                               │        (/api/planner/*)        │
                               └────────────────────────────────┘
```

---

## Core Modules

### 1. Intent Engine (`IntentEngine.js`)
- Infers active user intent based on session type, active project, and recent activity.
- Maintains intent history and confidence scores.

### 2. Goal Engine (`GoalEngine.js`)
- Formulates, tracks, and manages goals.
- Fields: `id`, `title`, `description`, `priority`, `status`, `dependencies`, `estimatedDurationMin`, `relatedProject`, `relatedResources`.

### 3. Priority Engine (`PriorityEngine.js`)
- Evaluates goal priorities (`Critical`, `High`, `Medium`, `Low`, `Deferred`) with numeric scoring and transparent rationale.

### 4. Constraint Engine (`ConstraintEngine.js`)
- Respects system runtime constraints (`offlineMode`, `memoryHigh`, `gpuBusy`, restricted tools).

### 5. Planning Engine (`PlanningEngine.js`)
- Generates hierarchical execution plans:
  `Goal -> Objectives -> Tasks -> Steps -> Required Resources & Skills -> Suggested Agents`.
- Produces deterministic, validated plan DTOs with reasoning traces.

### 6. Decision Engine (`DecisionEngine.js`)
- Ranks alternative courses of action with clear, transparent reasoning.

### 7. Recommendation Engine (`RecommendationEngine.js`)
- Generates non-intrusive proactive recommendations (e.g., pending flashcards, git commits, session break warnings).

### 8. Plan Validator (`PlanValidator.js`)
- Pre-evaluates generated plans to guarantee safety and resource availability before publication.

### 9. Planner Storage (`PlannerStorage.js`)
- Persists goals and plans to SQLite tables `planner_goals` and `planner_plans`.
