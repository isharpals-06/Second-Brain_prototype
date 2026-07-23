# ADR-007: Operational System Control Center
**Status:** ACCEPTED  
**Date:** July 23, 2026  

## Context
System configuration in an operating system layer requires unified control over providers, memory, tools, and diagnostics.

## Decision
Build `SystemControlCenter.jsx` as the central operational hub for MPAL provider manager, 6-layer memory controls, security sandbox grants, and backup utilities.

## Consequences
- Provides full operational control over the AEGISOS runtime.
