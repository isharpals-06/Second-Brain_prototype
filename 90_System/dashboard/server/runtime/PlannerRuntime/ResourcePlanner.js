export class ResourcePlanner {
  estimateResources(nodes = [], category = 'General') {
    const nodeCount = nodes.length || 1;

    const estimatedInputTokens = nodeCount * 1500;
    const estimatedOutputTokens = nodeCount * 900;
    const tokenBudget = estimatedInputTokens + estimatedOutputTokens;
    const estimatedDurationSeconds = nodeCount * 10;
    const memoryUsageMB = nodeCount * 12;
    const contextSizeTokens = nodeCount * 4000;

    return {
      memoryUsageMB,
      contextSizeTokens,
      tokenBudget,
      estimatedInputTokens,
      estimatedOutputTokens,
      estimatedCostUSD: parseFloat((tokenBudget * 0.000003).toFixed(6)),
      estimatedDurationSeconds,
      expectedProviderUsage: ['gemini', 'ollama'],
    };
  }
}

export const resourcePlanner = new ResourcePlanner();
