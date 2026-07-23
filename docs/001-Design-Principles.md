# AEGISOS — Core Principles (docs/001-Design-Principles.md)
**Document Version:** 1.0  
**Status:** CONSTITUTIONAL MANDATE  

---

## The 10 Core Architectural Principles

Every future feature, component, and pull request MUST adhere to these 10 inviolable principles:

### 1. AI is Always Present
The AI runtime does not sleep when the user is idle. It continuously observes filesystem events, updates knowledge graphs, consolidates memories, and scans for workflow optimizations. Visual state indicators reflect its ambient awareness.

### 2. Navigation Should Disappear
Static navigation bars and deep nested menus are banned. Navigation is replaced by **Contextual Awareness**—UI elements and panels appear automatically based on active tasks and system events.

### 3. Context Over Menus
Users should never be forced to navigate software to find information. Selecting an entity (memory, agent, goal, graph node) instantly projects its properties into the persistent 320px Context Inspector.

### 4. Collaboration Over Commands
AEGISOS is a pair-engineering environment. The AI suggests, assists, decomposes, and executes tasks alongside the human operator, seeking authorization only at security checkpoints.

### 5. Motion Communicates Cognition
Animations are strictly functional. Pulse frequencies, border scanlines, and node glows communicate AI processing states (`PERCEIVING`, `REASONING`, `EXECUTING`, `REFLECTING`), never decorative flourish.

### 6. Minimal Interface, Maximum Intelligence
Pixel density is prioritized over whitespace. HARD 0px border radiuses, 1px solid structural outlines, dark obsidian tones (`#0A0A0C`), and dual monospace typography maximize information throughput.

### 7. Form Factor Divergence: Workstation vs Companion
- **Desktop = AI Workstation:** High-density telemetry, multi-panel cockpit, 2D/3D knowledge graphs, subagent execution grid.
- **Mobile = AI Companion:** Voice-first interaction, active objective ring, single-tap approval checkpoints, quick note capture.

### 8. Single Source of Truth
State is never duplicated. All UI components subscribe to a unified central State Store synchronized in real-time via Server-Sent Events (`/api/events`).

### 9. Direct Cognitive Manipulation
Prefer dragging, connecting, delegating, approving, and grouping over form submissions, drop-down menus, and modal dialogs.

### 10. Non-Destructive Progression
Upgrades and refactors must preserve all existing functionality. Legacy features are merged or evolved into cognitive operating modes, never discarded arbitrarily.
