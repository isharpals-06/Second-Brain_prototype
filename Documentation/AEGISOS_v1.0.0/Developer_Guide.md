# AEGISOS v1.0.0 Developer & Extension Guide

## Extending AEGISOS

AEGISOS features modular extension points across tools, agents, workflows, policies, and automations.

---

## 1. Creating a Custom Tool
Extend `ToolBase` (`server/toolRuntime/ToolBase.js`) and register with `toolRegistry`:

```javascript
import { ToolBase } from './ToolBase.js';
import { toolRegistry } from './ToolRegistry.js';

export class CustomTool extends ToolBase {
  constructor() {
    super({ id: 'tool_custom', name: 'Custom Tool', permissions: ['read_file'] });
  }
  async execute(input) { return { result: 'ok' }; }
}
```

---

## 2. Creating a Custom Agent
Extend `AgentBase` (`server/agentRuntime/AgentBase.js`) and register with `agentRegistry`.

---

## 3. Creating a Declarative Workflow
Register step definitions in `WorkflowRegistry` (`server/workflow/WorkflowRegistry.js`).

---

## 4. Creating a Security Policy
Register policy rules in `PolicyEngine` (`server/governance/PolicyEngine.js`).
