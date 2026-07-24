# AEGISOS COMPONENT LIBRARY & DESIGN SYSTEM SPECIFICATION (v2.0)
## Semantic Token Engine & UI Component System

**Version:** 2.0.0  
**Roles:** Principal Design Systems Engineer, Senior Product Designer, Frontend Architect, UI Systems Engineer, Accessibility Specialist  
**Status:** Canonical & Unalterable

---

## PART 1 — SEMANTIC DESIGN TOKEN SYSTEM

AEGISOS uses a semantic token architecture. Direct hex codes, raw pixel values, or arbitrary inline styles are strictly forbidden.

### 1.1 Color Tokens
- `--color-semantic-mission`: `#2563EB` (Royal Blue) — Active goal & primary mission emphasis.
- `--color-semantic-execution`: `#F59E0B` (Amber) — Tool runtime execution & shell operations.
- `--color-semantic-reasoning`: `#7C3AED` (Purple) — Multi-modal cognitive reasoning & candidate generation.
- `--color-semantic-planning`: `#06B6D4` (Cyan) — Goal decomposition & dependency trees.
- `--color-semantic-memory`: `#10B981` (Emerald) — 5-layer memory storage & active recall.
- `--color-semantic-knowledge`: `#6366F1` (Indigo) — Relational graph web & entity nodes.
- `--color-semantic-agent`: `#8B5CF6` (Violet) — Autonomous subagent swarms.
- `--color-semantic-warning`: `#F97316` (Orange) — Non-fatal checkpoints & resource warnings.
- `--color-semantic-error`: `#EF4444` (Red) — Critical failure & outage alerts.
- `--color-semantic-success`: `#10B981` (Emerald) — Mission completion & test clearance.
- `--color-semantic-passive`: `#71717A` (Zinc) — Ambient logs & background telemetry.

### 1.2 Typography Tokens
- `--font-telemetry`: `'JetBrains Mono', monospace` — Monospace for code, metrics, execution feeds, and telemetry.
- `--font-workspace`: `'Inter', system-ui, sans-serif` — UI titles, surface headers, and conversation text.
- `--type-mission-title`: `20px / 1.2 / 700 / --font-workspace`
- `--type-workspace-header`: `16px / 1.3 / 600 / --font-workspace`
- `--type-telemetry-mono`: `12px / 1.4 / 400 / --font-telemetry`
- `--type-command-overlay`: `14px / 1.4 / 500 / --font-telemetry`

### 1.3 Spacing, Radius & Motion Tokens
- `--space-micro`: `2px`, `--space-compact`: `4px`, `--space-focused`: `8px`, `--space-comfortable`: `16px`, `--space-immersive`: `24px`
- `--radius-sharp`: `0px` — Strictly enforced sharp 0px corners across all components.
- `--motion-snappy`: `100ms cubic-bezier(0.16, 1, 0.3, 1)`
- `--motion-smooth`: `200ms cubic-bezier(0.16, 1, 0.3, 1)`

---

## PART 2 — FOUNDATION COMPONENTS SPECIFICATION

Specification for the 23 Foundation UI Primitives:

1. **Button:** Primary, Secondary, Ghost, Danger variants. Enforces `--radius-sharp: 0px`, high-contrast focus rings, and explicit hover/pressed states.
2. **IconButton:** Square 32px/40px icon trigger for compact toolbars.
3. **Input:** Monospace text input with active cyan focus ring (`--color-semantic-planning`).
4. **CommandInput:** Large 48px prompt field embedded in the Command Palette (`Ctrl+K`).
5. **Badge:** Status tag (`nominal`, `info`, `warning`, `error`, `active`) with sharp borders.
6. **Card:** Structural surface container (`--color-surface-card`) with 1px border (`--color-outline`).
7. **Toggle & Checkbox:** Sharp square toggles for state clearance.
8. **Drawer & Sheet:** Collapsible 320px context inspector panels (`Ctrl+B`).
9. **Progress & LoadingIndicator:** Streaming line indicators replacing generic spinners.
10. **Dropdown, Select, Tooltip, Popover, Dialog, Tabs, Accordion, Chip, Avatar:** Engineered with sharp 0px radii, high-contrast dark space tokens, and ARIA keyboard support.

---

## PART 3 — AEGISOS CORE COMPONENTS SPECIFICATION

OS-Specific Components:

1. **MissionSurface Host:** Viewport manager for primary active goal decomposition.
2. **ConversationSurface Host:** Multi-modal streaming dialogue container.
3. **KnowledgeSurface Host:** Graphify entity web & vault browser.
4. **MemorySurface Host:** 5-layer memory stats & active recall flashcard container.
5. **PlatformSurface Host:** Provider health matrix (MPAL) & MCP tool ecosystem.
6. **AgentCapsule:** Status card for an active subagent (`Platform Architect`, `Vault Sentinel`).
7. **ReasoningTimeline:** Vertical step-by-step stream of cognitive reasoning passes.
8. **ExecutionFeed:** Real-time log terminal container for tool runtime calls.
9. **MemoryRecallCard:** Active recall flashcard with spaced repetition buttons.
10. **KnowledgeNode & KnowledgeEdge:** Canvas rendering elements for entity graphs.
11. **ThinkingIndicator:** Ambient pulsing telemetry token emitting current OS state.
12. **CommandPalette Overlay:** Global `Ctrl+K` prompt overlay with intent preview.

---

## PART 4 — COMPONENT STATE MATRIX

Every component supports 17 explicit System States:

`DEFAULT` | `HOVER` | `FOCUS` | `PRESSED` | `DISABLED` | `LOADING` | `THINKING` | `EXECUTING` | `COMPLETED` | `ERROR` | `OFFLINE` | `RECOVERING` | `EXPANDED` | `COLLAPSED` | `PINNED` | `FLOATING` | `HIDDEN`

---

## PART 5 — RESPONSIVE VARIANTS & LAYOUT CONTRACTS

- **Desktop (≥ 1024px):** 4-zone layout (Header 48px, Rail 64px, Viewport flexible, Inspector 320px, Console 240px). Full keyboard control.
- **Tablet (768px - 1023px):** Auto-collapsing right inspector drawer; single-tap surface switcher.
- **Phone (< 768px):** Independent single-column AI Companion. Quick Intent Capture, Voice Trigger, and Touch Approval Cards.

---

## PART 6 — COMPOSITION RULES & CONSTRAINTS

1. **Maximum Nesting Depth:** Surface ➔ Section Card ➔ Component ➔ Primitive (Max 4 levels).
2. **Sharp Edge Rule:** A container card MUST NOT contain rounded children. All radii enforce `0px`.
3. **No Overflow Scrollbars:** Viewports handle vertical scrolling cleanly; horizontal scrollbars are forbidden.

---

## PART 7 — ACCESSIBILITY CONTRACTS (A11Y)

- **Keyboard Traps:** Enforced focus traps inside Command Palette (`Ctrl+K`) and Modal Dialogs.
- **ARIA Roles:** `role="region"`, `role="log"`, `role="dialog"`, `role="status"`.
- **Focus Indicator:** `2px solid var(--color-primary-blue)` outline with `2px` offset.
- **Reduced Motion:** Respects `prefers-reduced-motion` by disabling sliding transitions and using instant opacity swaps.

---

## PART 8 — PERFORMANCE CONTRACTS & BUDGETS

- **Virtualization:** Log streams and note lists exceeding 50 items MUST use virtualized list windowing.
- **Render Budget:** Zero unnecessary re-renders during high-frequency SSE telemetry passes.
- **Bundle Target:** Component library overhead `< 30 KB` gzipped.

---

## PART 9 — PUBLIC COMPONENT APIS & CONTRACTS

Foundation Component Props:
```ts
interface ComponentContract {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  status?: 'nominal' | 'info' | 'warning' | 'error';
  disabled?: boolean;
  active?: boolean;
  onClick?: (event: MouseEvent) => void;
  children?: ReactNode;
}
```

---

## PART 10 — VISUAL QA CHECKLIST

- [ ] **Sharp Edge Check:** All borders enforce strict 0px radii (`border-radius: 0px`).
- [ ] **Token Compliance:** Zero hardcoded hex colors or inline pixel styles.
- [ ] **Keyboard Nav:** Complete keyboard operation (`Tab`, `Enter`, `Space`, `Esc`, `Ctrl+K`, `Ctrl+B`).
- [ ] **Contrast Check:** WCAG AAA compliance on dark background (`#0A0A0C`).
- [ ] **Performance Check:** 60 FPS rendering during SSE token streaming.
