import { cognitiveMemoryEngine } from '../memory/initMemory.js';
import { hybridRetrievalEngine } from '../memory/HybridRetrievalEngine.js';
import { reasoningEngine } from './ReasoningEngine.js';
import { serverServiceRegistry } from './serviceRegistry.js';
import { aegisLogger } from './logger.js';

const log = aegisLogger.child('Core:ContextAssembler');

export class ContextAssembler {
  async assemblePromptContext(userPrompt, options = {}) {
    log.info(`Assembling multi-layer cognitive context for prompt: "${userPrompt.slice(0, 50)}..."`);

    // 1. Identity Memory Context
    const identities = cognitiveMemoryEngine?.storage ? cognitiveMemoryEngine.storage.listIdentity() : [];
    const identityBlock = identities.map(i => `- ${i.key}: ${i.value}`).join('\n');

    // 2. Working Memory Context (running state & agents)
    const working = cognitiveMemoryEngine?.storage ? cognitiveMemoryEngine.storage.listWorking() : [];
    const workingBlock = working.map(w => `- [${w.agent_id || 'system'}] ${w.key}: ${JSON.stringify(w.state)}`).join('\n');

    // 3. Executive Planner Context
    let plannerBlock = 'No active plan';
    const plannerService = serverServiceRegistry.get('Planner');
    if (plannerService && plannerService.plannerAPI) {
      try {
        const goals = plannerService.plannerAPI.getGoals();
        if (goals.length > 0) {
          plannerBlock = `Active Goal: "${goals[0].title || goals[0].name}"\nPriority: ${goals[0].priority || 'High'}`;
        }
      } catch (_) {}
    }

    // 4. Hybrid Retrieved Memories
    const retrievedMemories = await hybridRetrievalEngine.retrieveRankedContext(userPrompt, { limit: 5 });
    const memoryBlock = retrievedMemories.map(m => `- [${m.entity_type || m.category || 'fact'}] ${m.name || m.title}: ${m.summary || m.content || ''}`).join('\n');

    // 5. Recent Reasoning Sessions
    const recentReasoning = reasoningEngine.getRecentSessions(2);
    const reasoningBlock = recentReasoning.map(r => `- Reasoning (${r.id}): Goal "${r.goal}" -> Decision: ${r.decision} (Summary: ${r.summary})`).join('\n');

    // Assemble System Instruction Prompt Block
    const systemInstruction = `
=== AEGISOS COGNITIVE SYSTEM CONTEXT ===
You are AEGISOS, an event-driven AI Operating System runtime.

[IDENTITY & SYSTEM DIRECTIVES]
${identityBlock || 'Directives: Architectural, concise, persistent.'}

[WORKING MEMORY & AGENT STATES]
${workingBlock || 'No active background tasks.'}

[EXECUTIVE PLANNER CONTEXT]
${plannerBlock}

[RETRIEVED COGNITIVE MEMORIES]
${memoryBlock || 'No prior relevant memories found.'}

[RECENT REASONING SESSIONS]
${reasoningBlock || 'No recent reasoning sessions.'}
========================================
`.trim();

    return {
      systemInstruction,
      userPrompt,
      retrievedMemories,
      recentReasoning
    };
  }
}

export const contextAssembler = new ContextAssembler();
