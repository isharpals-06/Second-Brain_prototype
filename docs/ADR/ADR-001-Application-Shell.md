# ADR-001: Master Cockpit Application Shell Architecture
**Status:** ACCEPTED  
**Date:** July 23, 2026  

## Context
Legacy applications use multi-page routers or isolated tab switches, causing context loss and UI fragmentation.

## Decision
Implement **ONE master App Shell (`CockpitShell`)** containing:
1. Header Bar (48px) — Telemetry status, MPAL state, SSE indicator.
2. Living Context Rail (64px) — Persistent mode toggle bar.
3. Adaptive Workspace Viewport — Flexible central container.
4. Context Inspector (320px) — Property inspector.
5. Cognitive Stream Console (240px) — Monospaced SSE telemetry.

## Consequences
- Single layout container prevents reflow and context loss.
- All workspaces share the same telemetry stream and property inspector.
