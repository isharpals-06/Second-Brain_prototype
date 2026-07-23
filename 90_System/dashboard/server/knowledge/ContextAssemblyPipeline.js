import { cognitiveMemoryEngine } from '../memory/CognitiveMemoryEngine.js';
import { dynamicKnowledgeGraph } from './DynamicKnowledgeGraph.js';
import { worldModelEngine } from '../worldModel/WorldModelEngine.js';

export class ContextAssemblyPipeline {
  async assembleContext(goal, options = {}) {
    const working = await cognitiveMemoryEngine.recall('', { layer: 'working', limit: 5 });
    const session = await cognitiveMemoryEngine.recall('', { layer: 'session', limit: 5 });
    const identity = await cognitiveMemoryEngine.recall('', { layer: 'identity', limit: 5 });

    const graphSummary = dynamicKnowledgeGraph.getGraphSummary();
    const relatedEdges = dynamicKnowledgeGraph.search(goal);
    const worldState = worldModelEngine.getState().slice(-10);

    const systemContext = {
      workingMemory: working,
      sessionMemory: session,
      identityPreferences: identity,
      knowledgeGraphSummary: graphSummary,
      relevantEntities: relatedEdges,
      worldModelState: worldState,
    };

    const formattedPromptContext = `
=== AEGISOS COGNITIVE SYSTEM CONTEXT ===
Identity Preferences: ${JSON.stringify(identity.map(m => m.key || m.id))}
Active Working Goals: ${JSON.stringify(working.map(m => m.key || m.id))}
Recent Session Trails: ${JSON.stringify(session.map(m => m.key || m.id))}
World Model Entities: ${worldState.map(e => `${e.type}:${e.label}`).join(', ')}
Knowledge Graph: ${graphSummary.nodeCount} nodes, ${graphSummary.edgeCount} edges.
========================================
`.trim();

    return {
      structured: systemContext,
      promptFormatted: formattedPromptContext,
    };
  }
}

export const contextAssemblyPipeline = new ContextAssemblyPipeline();
