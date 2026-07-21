# AEGISOS Agent Development Guide

To create a new agent process for AEGISOS, extend `AgentBase` and register it with `agentRegistry`.

---

## Agent Boilerplate Example

```javascript
import { AgentBase } from './AgentBase.js';
import { capabilityRegistry } from './CapabilityRegistry.js';
import { agentRegistry } from './AgentRegistry.js';

export class CustomAgent extends AgentBase {
  constructor() {
    super({
      id: 'agent_custom',
      name: 'Custom Task Agent',
      description: 'Performs custom background processing tasks',
      version: '1.0.0',
      capabilities: ['summarization', 'planning'],
      permissions: ['read_file', 'write_file']
    });
  }

  // Override lifecycle hooks if needed
  start() {
    super.start();
    this.log.info('CustomAgent processing started');
    return true;
  }
}

// Register with AgentRegistry
const myAgent = new CustomAgent();
myAgent.register();
myAgent.initialize();
agentRegistry.registerAgent(myAgent);
```
