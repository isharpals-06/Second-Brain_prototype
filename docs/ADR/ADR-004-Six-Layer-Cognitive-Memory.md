# ADR-004: Six-Layer Cognitive Memory Architecture
**Status:** ACCEPTED  
**Date:** July 23, 2026  

## Context
In-memory arrays and flat markdown vaults fail to capture structured cognitive state.

## Decision
Architect a native 6-layer memory hierarchy (Session, Working, Episodic, Semantic, Procedural, Identity) backed by SQLite tables, vector stores, and automated consolidation passes.

## Consequences
- Enables structured retrieval, procedural learning, and automatic memory decay.
