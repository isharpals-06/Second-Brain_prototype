# AEGISOS v0.1.5 — Future Agent API Specification

## Overview

This specification defines the exact interface contracts that future autonomous AI agents (such as Sentinel, Planner, and Automation agents) will use to plug into AEGISOS.

---

## 1. Agent Registration Contract

All future agents must implement the following registration schema:

```typescript
interface AgentDefinition {
  id: string;                    // Unique identifier (e.g., 'agent_sentinel')
  name: string;                  // Human-readable name
  role: string;                  // Operational role description
  version: string;               // Semantic version (e.g., '1.0.0')
  capabilities: string[];        // Array of required skill IDs
  enabled?: boolean;             // Initial enabled state (default: true)
  metadata?: Record<string, any>;// Additional configuration options
}
```

---

## 2. Agent Execution & Inter-Agent Communication

Agents communicate exclusively through the `EventBus` and execute capabilities via the `SkillRegistry`. Direct coupling between agents is prohibited.

```javascript
// Example: Sentinel Agent subscribing to file events and triggering a skill
import { serverEventBus, SystemEvents } from '../core/eventBus.js';
import { serverSkillRegistry } from '../core/skillRegistry.js';
import { serverAgentManager } from '../core/agentManager.js';

class SentinelAgent {
  constructor() {
    this.id = 'agent_sentinel';
  }

  init() {
    serverAgentManager.register({
      id: this.id,
      name: 'Sentinel Agent',
      role: 'Proactive Context Observer',
      capabilities: ['summarize', 'search_notes']
    });

    // Subscribe to note creation events
    serverEventBus.subscribe(SystemEvents.NOTE_CREATED, async (payload) => {
      serverAgentManager.heartbeat(this.id);
      
      // Execute skill safely via registry
      await serverSkillRegistry.executeSkill('summarize', { notePath: payload.note });
      
      serverAgentManager.recordTaskExecution(this.id, true, 120);
    });
  }
}
```

---

## 3. Required Health & Telemetry Protocol

Future agents must emit a periodic heartbeat ping to `AgentManager`:

```javascript
// Agent heartbeat loop
setInterval(() => {
  serverAgentManager.heartbeat('agent_sentinel');
}, 30000);
```

If an agent fails to report a heartbeat within `maxStaleMs`, the `AgentManager.checkHealth()` scanner marks the agent as unresponsive and triggers corrective recovery.
