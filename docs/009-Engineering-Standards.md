# AEGISOS — Engineering & Code Quality Standards (docs/009-Engineering-Standards.md)
**Document Version:** 1.0  
**Status:** CONSTITUTIONAL MANDATE  

---

## The 10 Inviolable Engineering Rules

1. **Zero Duplicate Components:** Never create parallel versions of existing UI components. Refactor or extend shared primitives (`TelemetryCard`, `StatusChip`, `MonospacedTerminal`).
2. **Zero Inline Styles:** All styling MUST use CSS tokens defined in `src/styles/tokens.css`. Banned: `style={{ color: 'red' }}`.
3. **Zero Placeholder Screens:** Banned: "Coming Soon" or empty placeholder cards. Every mode MUST render functional cognitive telemetry.
4. **Single Source of Truth:** Never duplicate state across component hooks. Use `StateStore.js` and SSE subscribers.
5. **Composition Over Inheritance:** Build complex modes by composing atomic design system primitives.
6. **Strict Error Boundaries:** Wrap all async operations in try/catch blocks with graceful UI fallback telemetry. Never let exceptions break the main loop.
7. **Empirical Verification Required:** Never mark a task resolved without running verification commands (`npm run dev`, API `Invoke-RestMethod` tests).
8. **Preserve Existing Backend APIs:** Never break existing backend contracts. Extend DTOs rather than rewriting working endpoints.
9. **Zero Dead Code:** Unused imports, orphaned components, and commented-out dead code are strictly prohibited.
10. **Clean Modular ESM:** All JavaScript files must use clean ES Module syntax (`import`/`export`) with explicit extension handling.
