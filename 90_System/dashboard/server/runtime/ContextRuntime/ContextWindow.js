export class ContextWindow {
  constructor(maxTokens = 128000) {
    this.maxTokens = maxTokens;
  }

  fitToWindow(contextBlocks = []) {
    let currentTokens = 0;
    const fittedBlocks = [];
    const overflowBlocks = [];

    // Sort by priority ascending (1 = highest)
    const sorted = [...contextBlocks].sort((a, b) => (a.priority || 5) - (b.priority || 5));

    for (const block of sorted) {
      const blockTokens = block.tokenEstimate || 500;
      if (currentTokens + blockTokens <= this.maxTokens) {
        currentTokens += blockTokens;
        fittedBlocks.push(block);
      } else {
        overflowBlocks.push(block);
      }
    }

    return {
      maxTokens: this.maxTokens,
      tokenUsage: currentTokens,
      occupancyPercentage: parseFloat(((currentTokens / this.maxTokens) * 100).toFixed(2)),
      fittedBlocks,
      hasOverflow: overflowBlocks.length > 0,
      overflowBlocks,
    };
  }
}

export const contextWindow = new ContextWindow();
