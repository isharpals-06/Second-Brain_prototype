export class CostEstimator {
  estimate(taskGraph, category) {
    const nodeCount = taskGraph?.nodeCount || 1;
    
    const estimatedInputTokens = nodeCount * 1200;
    const estimatedOutputTokens = nodeCount * 800;
    const estimatedTimeSeconds = nodeCount * 12;
    const estimatedCostUSD = (estimatedInputTokens * 0.0000015) + (estimatedOutputTokens * 0.000006);

    return {
      estimatedInputTokens,
      estimatedOutputTokens,
      totalTokens: estimatedInputTokens + estimatedOutputTokens,
      estimatedTimeSeconds,
      estimatedCostUSD: parseFloat(estimatedCostUSD.toFixed(6)),
    };
  }
}

export const costEstimator = new CostEstimator();
