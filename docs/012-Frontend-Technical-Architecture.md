# AEGISOS FRONTEND TECHNICAL ARCHITECTURE (v1.0)
## High-Performance Engineering Blueprint for a Cognitive Operating System

**Version:** 1.0.0  
**Roles:** Principal Frontend Architect, React Platform Architect, TypeScript Architect, Design System Engineer, Performance Engineer, Software Architect  
**Status:** Canonical & Unalterable

---

## PART 1 — FRONTEND PHILOSOPHY & ENGINEERING PRINCIPLES

1. **Event-Driven Architecture:** All UI mutations, state updates, subagent streams, and context changes flow through an event-driven publish/subscribe architecture. Components never call disparate APIs directly.
2. **Context-Driven State:** State is not global or monolithic; it is organized around active human intent, cognitive modes, and mission context.
3. **Strict Component Composability:** Every UI component is built from immutable design primitives. Higher-level surfaces compose primitives without adding custom inline styling.
4. **Adaptive & Streaming Rendering:** The rendering engine updates incrementally via Server-Sent Events (SSE) and WebSocket streams, eliminating full-page re-renders and spinner locks.
5. **Zero Tight Coupling:** Presentation components have zero knowledge of API provider endpoints or specific backend logic. All data flows through abstract service gateways.

---

## PART 2 — LAYERED APPLICATION ARCHITECTURE

AEGISOS frontend is structured into 8 decoupled architectural layers:

```
[1. PRESENTATION LAYER]     --> UI Primitives, Badges, Inputs, Cards, Shell Viewports
         │
[2. INTERACTION LAYER]        --> Event handlers, Command Palette (Ctrl+K), Gestures, Keybindings
         │
[3. WORKSPACE ENGINE LAYER]   --> Mission Switcher, Surface Lifecycle, Context Assembly
         │
[4. CONTEXT ENGINE LAYER]     --> Working Memory Context, Knowledge Graph Subgraphs
         │
[5. STATE MANAGEMENT LAYER]   --> Centralized State Store, Reducers, Event Dispatcher
         │
[6. SERVICE GATEWAY LAYER]    --> REST & SSE Adapters (Cognitive, Memory, Platform, MCP APIs)
         │
[7. PLATFORM HARDWARE LAYER]  --> Browser LocalStorage, IndexedDB, Web Workers, Device Observers
         │
[8. BACKEND API ENGINE]       --> AEGISOS Node.js Core Kernel (Port 3010)
```

---

## PART 3 — WORKSPACE ENGINE ARCHITECTURE

The **Workspace Engine** manages the dynamic mutation of the viewport across the 5 Adaptive Surfaces (`MISSION`, `CONVERSATION`, `KNOWLEDGE`, `MEMORY`, `PLATFORM`):

- **Mission Switching:** Swaps active surfaces instantly while maintaining background execution and stream handles.
- **Context Loading:** Automatically requests multi-layer context (`Working`, `Session`, `Semantic`, `Graph`) from the backend context assembler upon mission activation.
- **Persistence & History:** Persists active workspace state and context breadcrumbs to local storage for instant session recovery.
- **Focus Management:** Traps focus within active modal overlays or command palettes while maintaining ambient visibility of background subagents.

---

## PART 4 — STATE ARCHITECTURE & OWNERSHIP

State is categorized cleanly into 10 decoupled domains:

| State Domain | Scope & Lifetime | Management Strategy |
|---|---|---|
| **UI State** | Transient (Drawer open, filter, mode) | Local Component & Workspace Context |
| **Mission State** | Session Persistent (Goal, active plan) | Central State Store (`StateStore.jsx`) |
| **Conversation State** | Session Persistent (Message trail, intent) | Core Kernel Event Stream |
| **Memory State** | Synchronized with Backend (5-layer metrics) | `MemoryAPI` REST Poller |
| **Planner State** | Synchronized with Backend (Subagents, tasks) | SSE Telemetry Stream |
| **Agent State** | Real-Time Telemetry (Swarm status, logs) | Server-Sent Events (SSE) |
| **Provider State** | Hardware Synchronized (MPAL health) | Platform Kernel Diagnostics API |
| **Settings & Secrets** | Encrypted Persistent (Key configuration) | `SecretsManager` Bridge |
| **Temporary State** | Single-Render (Hover, transient input) | React `useState` |
| **Persistent State** | Long-Term (User preferences, theme tokens) | Browser LocalStorage / IndexedDB |

---

## PART 5 — FRONTEND EVENT BUS ENGINE

All cross-component communication passes through a strongly-typed **Frontend Event Bus**:

```
                               ┌─────────────────────────┐
                               │  FRONTEND EVENT BUS     │
                               └───────────┬─────────────┘
                                           │
         ┌───────────────────┬─────────────┼─────────────┬───────────────────┐
         ▼                   ▼             ▼             ▼                   ▼
  MissionStarted      AgentFinished   MemoryUpdated  WorkspaceChanged  ExecutionFinished
```

- **Event Definitions:** `MissionStarted`, `MissionCompleted`, `MemoryUpdated`, `AgentCreated`, `AgentFinished`, `PlannerUpdated`, `WorkspaceChanged`, `ProviderChanged`, `ExecutionStarted`, `ExecutionFinished`, `NotificationEmitted`.
- **Decoupling:** Enables independent updates across the Header Telemetry Bar, Adaptive Viewport, Context Inspector, and Cognitive Stream Console without prop-drilling.

---

## PART 6 — ADAPTIVE RENDERING MODEL

AEGISOS implements an advanced 6-tier rendering strategy:

1. **Adaptive Rendering:** Mutates viewport layout based on active Cognitive Mode (`OBSERVE`, `THINK`, `RESEARCH`, `BUILD`, `REVIEW`, `FOCUS`).
2. **Context Rendering:** Renders context drawers and node graphs only when referenced by an active mission.
3. **Lazy Rendering:** Dynamically imports heavy surface modules (e.g., 3D graph visualizers) on demand.
4. **Progressive Rendering:** Renders textual reasoning streams chunk-by-chunk as tokens arrive over SSE.
5. **Streaming Rendering:** Renders terminal log streams in real-time without locking the UI thread.
6. **Background Rendering:** Updates off-screen metrics and background memory stats silently.

---

## PART 7 — COMPONENT ARCHITECTURE & HIERARCHY

Components strictly adhere to a 6-tier hierarchy:

```
[Level 1: PRIMITIVES]      --> Button, Input, Card, Badge (Strict 0px Sharp Radius)
         │
[Level 2: FOUNDATION]      --> HeaderTelemetryBar, LivingContextRail, ContextInspector
         │
[Level 3: COMPOSED]        --> SubagentMatrix, IntentPreviewCard, ReflectionCard
         │
[Level 4: SURFACES]        --> MissionSurface, ConversationSurface, KnowledgeSurface, MemorySurface, PlatformSurface
         │
[Level 5: VIEWPORT]        --> AdaptiveWorkspaceViewport (Surfaces Host)
         │
[Level 6: SHELL]           --> CockpitShell (Master Layout & State Provider)
```

---

## PART 8 — DESIGN SYSTEM ENGINE

- **Design Token System (`tokens.css`):** Central CSS custom properties governing spacing, 0px sharp radius, surface colors, outline borders, typography (`JetBrains Mono` + `Inter`), and motion curves.
- **Zero Hardcoded Values:** Components MUST consume CSS variables (`var(--color-surface-card)`, `var(--space-md)`). Direct pixel values or custom hex codes inside component files are strictly audited and rejected.
- **Theme Architecture:** Built-in dark space design token architecture ready for future theme extensions.

---

## PART 9 — RESPONSIVE ENGINE

- **Desktop Workstation (≥ 1024px):** Full 4-zone layout (Header 48px, Rail 64px, Viewport flexible, Inspector 320px, Console 240px).
- **Tablet Mission Control (768px - 1023px):** Auto-collapsing right inspector with touch-friendly surface triggers.
- **Phone AI Companion (< 768px):** Independent single-column companion view featuring Quick Intent Capture, Voice Trigger, and Subagent Approval Cards. Layout is engineered independently—never shrunk from desktop.

---

## PART 10 — PERFORMANCE & OPTIMIZATION BUDGET

- **Target Metrics:**
  - Initial Bundle Size: `< 250 KB` gzipped (Achieved: `72.67 KB` gzipped).
  - Time to Interactive (TTI): `< 300 ms`.
  - Frame Rate: Stable `60 FPS` during SSE streaming passes.
- **Optimization Patterns:**
  - `React.memo` and `useCallback` on high-frequency stream items.
  - Virtualized list rendering for log consoles exceeding 100 items.
  - Efficient event throttling (100ms debounce on state sync).

---

## PART 11 — ACCESSIBILITY ENGINE (A11Y)

- **Keyboard First:** 100% operational control achievable via keyboard. `Ctrl+K` opens Command Palette; `Ctrl+B` toggles Context Inspector; `Esc` closes overlays.
- **Focus Management:** High-contrast focus indicators (`2px solid var(--color-primary-blue)`). Focus traps enforce ARIA compliance within modal overlays.
- **Screen Reader Support:** Semantic HTML5 landmarks (`<header>`, `<main>`, `<aside>`, `<nav>`) and explicit `aria-live="polite"` regions for streaming telemetry tokens.

---

## PART 12 — ENTERPRISE FILE STRUCTURE

```
src/
├── assets/                 # Icons, branding SVG assets
├── components/
│   ├── primitives/         # Level 1: Button, Input, Card, Badge
│   ├── shell/              # Level 2: CockpitShell, HeaderTelemetryBar, LivingContextRail, ContextInspector, CommandPalette
│   ├── surfaces/           # Level 4: MissionSurface, ConversationSurface, KnowledgeSurface, MemorySurface, PlatformSurface
│   └── ui/                 # Shared UI primitives
├── config/                 # Platform constants & routing policies
├── core/
│   ├── ccl/                # IntentDetector, CommandRegistry, CognitiveHistory
│   ├── events/             # Frontend EventBus Engine
│   └── StateStore.jsx      # Centralized Reducer State Store
├── services/               # REST & SSE API Clients
├── styles/
│   ├── index.css           # Global reset & CSS variables
│   └── tokens.css          # Design System Tokens
└── types/                  # Data models & API contracts
```

---

## PART 13 — DEPENDENCY RULES & BOUNDARIES

1. `primitives` MUST NOT import `surfaces` or `shell`.
2. `surfaces` MAY import `primitives` and `services`.
3. `services` MUST NOT depend on React components.
4. `core/events` MUST remain pure JavaScript without DOM dependencies.
5. Circular imports between `surfaces` and `shell` are strictly forbidden.

---

## PART 14 — TESTING STRATEGY

- **Unit Testing:** Vitest for pure functions (`IntentDetector`, `CommandRegistry`, `EventBus`).
- **Component Testing:** React Testing Library for primitive rendering and sharp token compliance.
- **Integration Testing:** Mock REST/SSE endpoints to verify 5 Adaptive Surface state transitions.
- **End-to-End Testing:** Playwright Go / Node scripts validating real-time server telemetry and Command Palette shortcuts.

---

## PART 15 — PHASED IMPLEMENTATION ROADMAP

- **Phase 1 (Foundation - COMPLETED):** Master App Shell, Design System Tokens (`tokens.css`), UI Primitives, `StateStore.jsx`.
- **Phase 2 (Adaptive Surfaces - COMPLETED):** `MissionSurface`, `ConversationSurface`, `KnowledgeSurface`, `MemorySurface`, `PlatformSurface`.
- **Phase 3 (Platform Integration - COMPLETED):** REST & SSE wiring to `/api/cognitive/kernel/health`, `/api/memory/stats`, `/api/platform/diagnostics`, `/api/mcp/health`.
- **Phase 4 (Refinement & Optimization - NEXT):** Advanced virtualized stream rendering and mobile companion shell optimization.
