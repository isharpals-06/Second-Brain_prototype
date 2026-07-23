# RFC-001: Real-Time Bidirectional Voice Interface
**Status:** DRAFT  
**Date:** July 23, 2026  

## Summary
Proposal for integrating low-latency WebSockets / WebRTC audio streaming to allow continuous bidirectional voice interaction with the AI Companion on mobile and desktop.

## Proposed Architecture
- WebSockets bidirectional audio transport connected to MPAL voice providers.
- Real-time VAD (Voice Activity Detection) in `CognitiveStreamConsole`.
