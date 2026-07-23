# AEGISOS — Design System Specification (docs/004-Design-System.md)
**Document Version:** 1.0  
**Status:** CONSTITUTIONAL MANDATE  
**Canonical Reference:** Stitch Project `projects/1451802319451370177` ("Systematic Intelligence")  

---

## 1. Design System Tokens (`tokens.css`)

```css
:root {
  /* Color Palette (Obsidian Base + Tactical Accents) */
  --color-surface-base: #0A0A0C;       /* Canvas */
  --color-surface-panel: #131316;      /* Workspace Tiled Panels */
  --color-surface-container: #1C1C1F;  /* Content Containers & Cards */
  --color-surface-overlay: #2D2D30;    /* Modals & Dropdowns */
  
  --color-on-surface: #E4E1E5;         /* Primary Text */
  --color-on-surface-variant: #C3C6D7; /* Secondary Text */
  --color-outline: #434655;            /* Structural Borders (1px) */
  --color-outline-subtle: #2A2A2D;     /* Dividers */

  --color-primary-blue: #2563EB;       /* Active Agency Accent */
  --color-primary-blue-glow: rgba(37, 99, 235, 0.25);
  --color-secondary-purple: #7C3AED;   /* Reasoning & Synthesis Accent */
  --color-secondary-purple-glow: rgba(124, 58, 237, 0.25);
  --color-status-success: #00E676;     /* Nominal */
  --color-status-warning: #FFB596;     /* Attention */
  --color-status-error: #FFB4AB;       /* Fault */

  /* Typography */
  --font-family-ui: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-family-mono: 'JetBrains Mono', monospace;

  /* Spacing Scale (4px Baseline) */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;

  /* Dimensions */
  --rail-width: 64px;
  --inspector-width: 320px;
  --console-height: 240px;
  --header-height: 48px;

  /* Shape Rules */
  --radius-sharp: 0px;                /* STRICT MANDATE: 0px Roundedness */
  --border-width: 1px;
}
```

---

## 2. Component Hierarchy & Rules

### 2.1 Buttons
- **Ghost Primary:** 1px solid Cobalt Blue (`#2563EB`) border, transparent fill, white text. High contrast fill reserved only for critical single actions.
- **Secondary:** 1px solid Slate border (`#434655`), grey text. Hover shifts background +5% brightness with 0ms latency.

### 2.2 Telemetry Cards & Panels
- **Containers:** Zero shadow. Tonal shifts define depth.
- **Headers:** Separated by thin 1px horizontal rule (`--color-outline-subtle`). Titles set in `label-caps` (`JetBrains Mono`, 11px, bold, uppercase).

### 2.3 Terminal Console Blocks
- **Font:** `JetBrains Mono`.
- **Text:** Streaming typing effect. Cobalt blue for system events, amethyst for AI reasoning steps.
