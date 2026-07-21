# AEGISOS v1.0.0 — Application Startup & Architecture Guide

## Overview

AEGISOS combines a Node.js/Express backend server with a compiled React + Vite Single Page Application (SPA) frontend.

---

## 1. System Architecture

- **Backend Entry Point**: `90_System/dashboard/server/server.js` (Node.js v20+ ES Modules)
- **Backend Port**: `3010` (`http://localhost:3010`)
- **Frontend Source**: `90_System/dashboard/src/` (React 19 + Vite 8)
- **Frontend Build Output**: `90_System/dashboard/dist/`
- **Vite Dev Server Port**: `5180` (`http://localhost:5180`)

---

## 2. Static File & SPA Serving Strategy

In production, Express serves compiled static frontend assets directly from `dist/`:

1. **Static Middleware**: `express.static(DIST_DIR)` serves static assets (`/assets/*`, `/favicon.svg`, `/icons.svg`).
2. **REST API Routes**: `/api/*` endpoints handle backend data and AEGISOS subsystem queries.
3. **SPA Catch-All Fallback**: `app.get('*', ...)` returns `dist/index.html` for non-API client-side navigation.

---

## 3. Development Commands

### Fullstack Concurrent Mode (Dev)
```bash
cd 90_System/dashboard
npm run dev
```
Starts Vite dev server on `http://localhost:5180` (with `/api` proxy to `http://localhost:3010`) and Express server on `http://localhost:3010`.

### Production Build & Serve
```bash
cd 90_System/dashboard
npm run build
npm run server
```
Serves the fullstack application directly at `http://localhost:3010/`.

---

## 4. Troubleshooting & Diagnostics

- **"Cannot GET /" Resolution**: Resolved by registering `express.static(path.join(__dirname, '../dist'))` and `app.get('*', ...)` SPA fallback in `server/server.js`.
- **Health Check Endpoint**: `GET /api/system/health`
- **Version Endpoint**: `GET /api/system/version`
