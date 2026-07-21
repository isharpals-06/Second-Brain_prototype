# AEGISOS Tool SDK & Development Guide

To create a new tool for AEGISOS, extend `ToolBase` and register it with `toolRegistry`.

---

## Tool Boilerplate Example

```javascript
import { ToolBase } from '../ToolBase.js';
import { ToolCategory } from '../types.js';
import { toolRegistry } from '../ToolRegistry.js';

export class CustomSearchTool extends ToolBase {
  constructor() {
    super({
      id: 'tool_custom_search',
      name: 'Custom Search Tool',
      category: ToolCategory.WEB_SEARCH,
      description: 'Performs external search queries',
      version: '1.0.0',
      permissions: ['search_vault']
    });
  }

  validate(input) {
    if (!input || !input.query) {
      return { isValid: false, errors: ['query is required'] };
    }
    return { isValid: true, errors: [] };
  }

  async execute(input) {
    return {
      query: input.query,
      results: ['Result 1', 'Result 2']
    };
  }
}

// Register with ToolRegistry
const myTool = new CustomSearchTool();
myTool.register();
myTool.initialize();
toolRegistry.registerTool(myTool);
```
