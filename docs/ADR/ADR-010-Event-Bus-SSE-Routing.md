# ADR-010: Server-Sent Events (SSE) for Real-Time Telemetry Streaming
**Status:** ACCEPTED  
**Date:** July 23, 2026  

## Context
Polling REST APIs causes latency and wasteful server load.

## Decision
Route all system events (`SENTINEL`, `REASONING`, `PLANNER`, `MEMORY`) through a persistent SSE stream (`/api/events`) connected to `StateStore.js` and `CognitiveStreamConsole`.

## Consequences
- Zero latency real-time telemetry streaming across the application shell.
