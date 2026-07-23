# ADR-006: Subagent Execution & Permission Architecture
**Status:** ACCEPTED  
**Date:** July 23, 2026  

## Context
Autonomous agents require strict permission boundaries to prevent unintended system side effects.

## Decision
Execute subagents through an explicit Tool Runtime sandbox with security permission grants and real-time EventBus logging.

## Consequences
- Guarantees safe tool execution with explicit user authorization checkpoints.
