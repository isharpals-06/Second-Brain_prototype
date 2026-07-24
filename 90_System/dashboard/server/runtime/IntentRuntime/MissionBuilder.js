export class MissionBuilder {
  buildMission({ intent, classification, goals, taskGraph, validation }) {
    const id = `msn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    const mission = {
      id,
      intent,
      category: classification.category,
      confidence: classification.confidence,
      goals,
      taskGraph,
      validation,
      estimatedComplexity: classification.category === 'Coding' || classification.category === 'Planning' ? 'high' : 'medium',
      estimatedDurationSeconds: taskGraph.nodeCount * 15,
      requiredCapabilities: ['text_generation', 'reasoning'],
      requiredAgents: ['PlannerAgent', 'ExecutionAgent'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return Object.freeze(mission); // Immutable
  }
}

export const missionBuilder = new MissionBuilder();
