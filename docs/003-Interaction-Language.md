# AEGISOS — Interaction Language Specification (docs/003-Interaction-Language.md)
**Document Version:** 1.0  
**Status:** CONSTITUTIONAL MANDATE  

---

## 1. Direct Cognitive Manipulation Metaphors

AEGISOS replaces traditional form controls and menu navigation with **Direct Cognitive Manipulations**:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                      DIRECT COGNITIVE MANIPULATIONS                         │
├──────────────┬──────────────────────────────────────────────────────────────┤
│ Manipulation │ Mechanism & UI Response                                      │
├──────────────┼──────────────────────────────────────────────────────────────┤
│ CONNECTING   │ Dragging a memory node onto a goal card links context.       │
│ DELEGATING   │ Dragging an unassigned task onto an active agent executes it.│
│ GROUPING     │ Drawing a selection box around graph nodes synthesizes a project.│
│ APPROVING    │ Single-tap or swipe inline checkpoint card authorizes action.│
│ INSPECTING   │ Clicking/hovering any entity projects state into Context Inspector.│
└──────────────┴──────────────────────────────────────────────────────────────┘
```

---

## 2. Shell Element Behaviors

### 2.1 Living Context Rail (64px)
- **Position:** Far left vertical bar.
- **Behavior:** Contains icon-only triggers for the 6 Cognitive Operating Modes (`OBSERVE`, `THINK`, `RESEARCH`, `BUILD`, `REVIEW`, `FOCUS`) and `System Control`.
- **Active State:** Vertical 2px Cobalt Blue indicator stroke on the left edge with a subtle outer glow.

### 2.2 Context Inspector (320px)
- **Position:** Right-hand fixed panel.
- **Behavior:** Displays deep properties of currently selected items (e.g. Memory layer TTL, Vector similarity distance, Subagent execution tree, Graph node neighbors).
- **Collapse Toggle:** `Ctrl+B` or top-right bracket chevron.

### 2.3 Cognitive Stream Console (240px)
- **Position:** Bottom-docked terminal pane.
- **Behavior:** Monospaced real-time SSE stream (`/api/events`). Displays live telemetry (`SENTINEL`, `REASONING`, `PLANNER`, `MEMORY`).
- **Filters:** `ALL`, `REASONING`, `SENTINEL`, `MEMORY`, `AGENT`, `SECURITY`.
