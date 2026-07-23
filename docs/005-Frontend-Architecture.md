# AEGISOS — Frontend Architecture Specification (docs/005-Frontend-Architecture.md)
**Document Version:** 1.0  
**Status:** CONSTITUTIONAL MANDATE  

---

## 1. Master Application Shell (`CockpitShell`)

Every UI component in AEGISOS exists inside **ONE master application shell**. Different pages are replaced by context-aware workspaces inside the central adaptive viewport.

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ TOP TELEMETRY HEADER (Logo | Subsystem Indicator | Provider Status | SSE Live Dot)    │
├──────┬─────────────────────────────────────────────────────────┬──────────────────────┤
│ L    │                                                         │                      │
│ I    │                   ADAPTIVE WORKSPACE                    │ C                    │
│ V    │                       VIEWPORT                          │ O                    │
│ I    │                                                         │ N                    │
│ N    │  (OBSERVE | THINK | RESEARCH | BUILD | REVIEW | FOCUS)  │ T                    │
│ G    │                                                         │ E                    │
│      │                                                         │ X                    │
│ R    │                                                         │ T                    │
│ A    │                                                         │                      │
│ I    │                                                         │ I                    │
│ L    │                                                         │ N                    │
│ (64) │                                                         │ S                    │
│      │                                                         │ P                    │
│      │                                                         │ (320px)              │
├──────┴─────────────────────────────────────────────────────────┴──────────────────────┤
│ DOCKED COGNITIVE STREAM CONSOLE (Monospaced SSE Telemetry Stream)              [240px] │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Directory & Component Structure (`src/`)

```text
src/
├── assets/                  # Icons, SVGs, static assets
├── components/
│   ├── shell/               # Master App Shell Primitives
│   │   ├── CockpitShell.jsx
│   │   ├── HeaderTelemetryBar.jsx
│   │   ├── LivingContextRail.jsx
│   │   ├── ContextInspector.jsx
│   │   └── CognitiveStreamConsole.jsx
│   ├── modes/               # 6 Cognitive Operating Mode Workspaces
│   │   ├── ObserveMode.jsx
│   │   ├── ThinkMode.jsx
│   │   ├── ResearchMode.jsx
│   │   ├── BuildMode.jsx
│   │   ├── ReviewMode.jsx
│   │   └── FocusMode.jsx
│   ├── control/             # System Control Center
│   │   └── SystemControlCenter.jsx
│   └── shared/              # Reusable UI Primitives
│       ├── TelemetryCard.jsx
│       ├── StatusChip.jsx
│       └── MonospacedTerminal.jsx
├── core/
│   ├── EventBus.js          # Client-side event dispatcher
│   ├── StateStore.js        # Centralized App State Provider
│   └── ServiceRegistry.js   # Service locator utility
└── styles/
    ├── tokens.css           # Design tokens (colors, typography, spacing)
    └── global.css           # CSS Reset & base styles
```

---

## 3. Centralized State Store Architecture (`StateStore.js`)

State is managed centrally and updated directly by SSE events (`/api/events`) to guarantee a single source of truth across all components.
