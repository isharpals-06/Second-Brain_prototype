# AEGISOS FRONTEND CONSTITUTION (v1.0)
## Design System, Interaction Architecture & Product Specification

**Version:** 1.0.0  
**Roles:** Principal Product Designer, Principal UX Architect, Design Systems Lead, HCI Specialist, Senior Frontend Architect  
**Status:** Canonical & Unalterable

---

## PART 1 — PRODUCT IDENTITY

### 1.1 What is AEGISOS?
AEGISOS is a **Cognitive Operating System** and autonomous digital workstation. It serves as an invisible digital butler, mission control center, and proactive executive partner. Rather than acting as a passive tool or chat application, AEGISOS organizes computation around human intent, managing complex workflows, multi-agent execution, 5-layer cognitive memory, and relational knowledge webs transparently.

### 1.2 What is NOT AEGISOS?
- **Not a Dashboard:** AEGISOS does not organize UI into static widgets, administrative metrics cards, or generic analytics grids.
- **Not a Chatbot:** AEGISOS is not a linear conversation box like ChatGPT, Claude, or Gemini. Conversation is a primary interface, but it exists inside an active operational workspace.
- **Not an IDE or File Browser:** AEGISOS does not mimic VS Code, Cursor, or Obsidian. File trees and code editors appear contextually when required by a mission.
- **Not a Document Editor:** AEGISOS is not Notion, Linear, or an issue tracking application.

### 1.3 Differentiation Matrix

| Product | How AEGISOS Differs |
|---|---|
| **ChatGPT / Claude / Gemini** | Linear prompt-response chat vs. **Active Cognitive Workspace** with multi-agent execution, 5-layer memory, and tool runtimes. |
| **VS Code / Cursor** | Code editor with AI extensions vs. **Intent-Driven OS** where code generation is a sub-task managed by autonomous agents. |
| **Notion / Linear** | Static document & issue tracking tables vs. **Dynamic Mission Surface** where tasks self-decompose and execute automatically. |
| **Raycast / Arc Browser** | Quick launcher & browser shell vs. **Living Cognitive Kernel** that maintains continuous 24/7 background awareness. |

### 1.4 Product Identity & Principles
- **Mission:** Amplify human agency and cognitive bandwidth through invisible, self-optimizing AI partnership.
- **Vision:** Software navigation disappears; intent transforms directly into verified execution.
- **Emotional Goals:** Serenity, empowerment, technical precision, effortless control, and calm intelligence.

---

## PART 2 — EXPERIENCE PRINCIPLES

1. **The AI is Always Present:** The system is continuously listening, observing, or executing in the background without requiring constant manual prompts.
2. **The Workspace Adapts:** The UI mutates seamlessly based on the active intent, mode (`OBSERVE`, `THINK`, `RESEARCH`, `BUILD`, `REVIEW`, `FOCUS`), and mission phase.
3. **Navigation Disappears:** There are no deep hierarchical menus, nested sub-routes, or persistent sidebars. Navigation occurs through intent, command palette (`Ctrl+K`), and context breadcrumbs.
4. **Context Appears Only When Useful:** Memory inspectors, knowledge graphs, subagent matrices, and raw logs remain hidden or ambient until explicitly required or triggered by a critical anomaly.
5. **Execution is Visible & Thinking is Observable:** Internal OS states (`THINKING`, `PLANNING`, `DELEGATING`, `EXECUTING`, `LEARNING`, `REFLECTING`) are rendered through ambient glow tokens and live telemetry streams rather than generic spinners.

---

## PART 3 — DESIGN LANGUAGE

### 3.1 Visual & Tactical Tone
- **Industrial Precision:** Strict 0px sharp corner radii (`--radius-sharp: 0px`), clean micro-borders (`1px solid var(--color-outline)`), high contrast, and crisp monospace telemetry typography.
- **Mission Control:** Dense, high-information telemetry layout formatted cleanly into functional zones without decorative fluff or arbitrary whitespace.
- **Calm Intelligence:** Deep dark background values (`#0A0A0C`, `#131316`) with subdued text tones (`#A1A1AA`), illuminated by vivid status accents (`#2563EB` Blue, `#7C3AED` Purple, `#10B981` Emerald, `#F59E0B` Amber).

### 3.2 What the Interface Must NEVER Become
- ❌ **No Soft Rounded Pill Shapes:** Rounded buttons (`border-radius: 8px/16px/9999px`) are strictly forbidden. All edges must remain 0px sharp.
- ❌ **No Glassmorphism or Translucent Blurs:** No `backdrop-filter: blur()`, frosted glass effects, or heavy drop shadows.
- ❌ **No Cyberpunk Neon Overkill:** No intense neon glow borders or tacky sci-fi decorative lines.
- ❌ **No Generic SaaS Light Themes:** AEGISOS operates exclusively in sleek, dark industrial space.

---

## PART 4 — VISUAL HIERARCHY

The user interface strictly prioritizes information according to operational urgency:

1. **Priority 1 — Current Mission:** The active primary goal, target outcome, and execution status.
2. **Priority 2 — Current Conversation & Intent:** Active dialog stream, intent classification, and prompt interface.
3. **Priority 3 — Current Execution:** Real-time subagent task execution, tool runtime calls, and reasoning steps.
4. **Priority 4 — Relevant Context:** Active working memory items, linked vault files, and entity graph nodes.
5. **Priority 5 — Optional Details:** Subagent logs, deep audit trails, and raw JSON payloads (confined to expandable drawers).
6. **Priority 6 — System Configuration:** Hardware statistics, provider settings, and credentials (accessible via platform surface).

---

## PART 5 — WORKSPACE PHILOSOPHY

AEGISOS replaces static pages with **5 Dynamic Adaptive Surfaces**:

```
+-----------------------------------------------------------------------------------+
| 1. MISSION SURFACE     | Primary Goal, Subagent Matrix & Execution Pipeline        |
| 2. CONVERSATION SURFACE| Living Multi-modal Cognitive Engine & Intent Dispatch     |
| 3. KNOWLEDGE SURFACE   | Graphify Relational Web & Vault Ingestion Browser         |
| 4. MEMORY SURFACE      | 5-Layer Memory Engine, Flashcard Recall & Reflections     |
| 5. PLATFORM SURFACE    | Provider Health (MPAL), MCP Tool Ecosystem & Observers    |
+-----------------------------------------------------------------------------------+
```

- **Transitions:** Surfaces transition smoothly across the single central viewport.
- **Context Preservation:** Switching surfaces does NOT reset conversation state, active agent execution, or background telemetry.

---

## PART 6 — AI PRESENCE & LIVING COGNITIVE STATES

AEGISOS explicitly communicates its active cognitive processing through 10 System States:

| Cognitive State | Description & Behavior | Primary Token Color |
|---|---|---|
| `IDLE` | Quiet background monitoring; waiting for intent | `#71717A` (Zinc) |
| `PERCEIVING` | Processing input, audio, or incoming event stream | `#3B82F6` (Blue) |
| `THINKING` | Multi-modal reasoning & candidate route generation | `#7C3AED` (Purple) |
| `PLANNING` | Goal decomposition & subagent dependency tree build | `#06B6D4` (Cyan) |
| `DELEGATING` | Spawning subagents & distributing task packets | `#8B5CF6` (Violet) |
| `EXECUTING` | Tool runtime invocation & shell command execution | `#F59E0B` (Amber) |
| `WAITING` | Awaiting human checkpoint approval or external API | `#EC4899` (Pink) |
| `LEARNING` | Updating procedural memory & self-learning lessons | `#EAB308` (Gold) |
| `REFLECTING` | Evaluating execution output against quality criteria | `#10B981` (Emerald) |
| `RECOVERING` | Automatic failover retry upon provider outage | `#EF4444` (Red) |

---

## PART 7 — INTERACTION MODEL

- **Command Layer (`Ctrl+K`):** Global command overlay for instant intent classification, system actions, memory queries, and subagent dispatch.
- **Keyboard-First:** Full navigation achievable without touching the mouse (`Ctrl+K` for commands, `Ctrl+B` for context inspector, `Esc` to dismiss drawers).
- **Context Drawer (`Ctrl+B`):** 320px right-hand side drawer that expands smoothly to reveal detailed logs, memory stats, or node inspections without interrupting the primary workspace.

---

## PART 8 — MOTION SYSTEM

Motion in AEGISOS communicates system intelligence rather than aesthetic decoration:
- **Duration Tokens:** Fast (`100ms`), Standard (`200ms`), Slow (`350ms`).
- **Timing Functions:** `cubic-bezier(0.16, 1, 0.3, 1)` for clean industrial snapping.
- **Rule:** Animations must indicate state changes (e.g., drawer expansion, pulse on new telemetry log, stream token arrival). Unnecessary looping decorative animations are forbidden.

---

## PART 9 — COMPONENT BEHAVIOR RULES

1. **Self-Justification:** Every component must directly serve the current active mission or context.
2. **Contextual Expansion:** Components start collapsed or ambient and expand only upon user interaction or system trigger.
3. **Sharp Edge Enforcement:** All container cards, inputs, badges, and buttons enforce strict `0px` border radius (`--radius-sharp: 0px`).
4. **State-Driven Display:** Components inspect `useAppState()` and react to global state changes instantaneously.

---

## PART 10 — RESPONSIVE PHILOSOPHY

- **Desktop (≥ 1024px):** Comprehensive AI Workstation with Living Context Rail (64px), Adaptive Workspace Viewport, Context Inspector (320px), and Bottom Cognitive Stream Console (240px).
- **Tablet (768px - 1023px):** Portable Mission Control with collapsible inspector and auto-hiding log stream.
- **Mobile (< 768px):** AI Companion interface featuring single-line intent capture, voice trigger, approval checkpoint cards, and mobile memory feed.

---

## PART 11 — DESIGN TOKENS (STRICT SPECIFICATION)

```css
:root {
  /* Spacing Tokens */
  --space-2xs: 2px;
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;

  /* Strict Sharp Radius */
  --radius-sharp: 0px;

  /* Typography Tokens */
  --font-family-mono: 'JetBrains Mono', monospace;
  --font-family-ui: 'Inter', system-ui, -apple-system, sans-serif;

  /* Color System */
  --color-surface-base: #0A0A0C;
  --color-surface-panel: #131316;
  --color-surface-card: #1C1C1F;
  --color-surface-hover: #27272A;
  
  --color-outline: #27272A;
  --color-outline-subtle: #1E1E22;
  
  --color-on-surface: #FAFAFA;
  --color-on-surface-variant: #A1A1AA;
  
  --color-primary-blue: #2563EB;
  --color-secondary-purple: #7C3AED;
  --color-accent-emerald: #10B981;
  --color-accent-amber: #F59E0B;
  --color-accent-red: #EF4444;

  /* Layout Dimensions */
  --header-height: 48px;
  --rail-width: 64px;
  --inspector-width: 320px;
  --console-height: 240px;

  /* Transitions */
  --transition-fast: all 100ms cubic-bezier(0.16, 1, 0.3, 1);
  --transition-normal: all 200ms cubic-bezier(0.16, 1, 0.3, 1);
}
```

---

## PART 12 — ACCESSIBILITY & ANTI-PATTERNS

### 12.1 Accessibility
- Full keyboard navigation with explicit focus outlines (`2px solid var(--color-primary-blue)`).
- Minimum contrast ratio of 4.5:1 for normal text and 7:1 for headers.
- Support for `prefers-reduced-motion` media query.

### 12.2 Forbidden Anti-Patterns
- ❌ **No Dashboard Cards / Widgets:** Avoid placing disconnected metrics cards across the viewport.
- ❌ **No Multi-Tab Navigation Headers:** Do not use browser-style tab bars.
- ❌ **No Decorative Loading Spinners:** Use ambient state glows or real-time text stream indicators.
- ❌ **No Generic Light Themes:** AEGISOS is strictly a high-contrast dark industrial system.

---

## PART 13 — IMPLEMENTATION WORKFLOW

All future frontend development must strictly follow this lifecycle:

```
Vision & Philosophy
       ↓
Frontend Constitution (v1.0)
       ↓
Design Tokens Enforcement (tokens.css)
       ↓
Adaptive Surface Implementation
       ↓
Empirical Runtime Verification & Build Test
```

---

## PART 14 — TECHNICAL RECOMMENDATIONS

1. **State Store Integrity:** Maintain single source of truth in `StateStore.jsx`.
2. **Vite Production Bundling:** Ensure `npm run build` completes cleanly without warnings or unused imports.
3. **REST & SSE Endpoint Alignment:** Connect surfaces directly to `/api/cognitive/kernel/intent`, `/api/memory/stats`, `/api/platform/diagnostics`, `/api/mcp/health`.
