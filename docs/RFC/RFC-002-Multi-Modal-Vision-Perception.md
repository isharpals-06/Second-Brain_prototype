# RFC-002: Multi-Modal Vision & Screen Perception
**Status:** DRAFT  
**Date:** July 23, 2026  

## Summary
Proposal for Sentinel observers to periodically sample screen region frames or window buffers to provide visual context during UI development and pair programming.

## Proposed Architecture
- Native image capture observer in `server/sentinel/`.
- Automatic vision encoding fed into `KnowledgeExtractor.js`.
