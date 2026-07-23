import { aegisLogger } from '../core/logger.js';

const log = aegisLogger.child('Platform:CapabilityRegistry');

export class CapabilityRegistry {
  constructor() {
    this.capabilities = new Map();
    this.registerDefaultCapabilities();
  }

  registerDefaultCapabilities() {
    const defaults = [
      { id: 'text_generation', label: 'Text Completion & Synthesis', providers: ['gemini', 'ollama', 'openrouter', 'huggingface'] },
      { id: 'embeddings', label: 'Vector & Semantic Embeddings', providers: ['ollama', 'gemini'] },
      { id: 'tool_calling', label: 'Structured Tool Invocation', providers: ['gemini', 'ollama'] },
      { id: 'code_execution', label: 'Safe Code & Shell Execution', providers: ['system_tool_runtime'] },
      { id: 'reasoning', label: 'High-Capability Reasoning Sessions', providers: ['gemini', 'openrouter'] },
    ];

    for (const cap of defaults) {
      this.capabilities.set(cap.id, cap);
    }
  }

  getCapability(capabilityId) {
    return this.capabilities.get(capabilityId) || null;
  }

  findProvidersFor(capabilityId) {
    const cap = this.capabilities.get(capabilityId);
    return cap ? cap.providers : [];
  }

  listCapabilities() {
    return Array.from(this.capabilities.values());
  }
}

export const capabilityRegistry = new CapabilityRegistry();
