export class TaskDecomposer {
  decompose(intentText, category) {
    const taskIdPrefix = `task_${Date.now()}`;
    
    const nodes = [
      { id: `${taskIdPrefix}_1`, label: 'Context Gathering & Input Parsing', type: 'ANALYSIS', status: 'PENDING' },
      { id: `${taskIdPrefix}_2`, label: `Primary ${category} Execution Step`, type: 'EXECUTION', status: 'PENDING' },
      { id: `${taskIdPrefix}_3`, label: 'Verification & Quality Check', type: 'VERIFICATION', status: 'PENDING' },
      { id: `${taskIdPrefix}_4`, label: 'Memory & Workspace Consolidation', type: 'CONSOLIDATION', status: 'PENDING' },
    ];

    const edges = [
      { source: `${taskIdPrefix}_1`, target: `${taskIdPrefix}_2` },
      { source: `${taskIdPrefix}_2`, target: `${taskIdPrefix}_3` },
      { source: `${taskIdPrefix}_3`, target: `${taskIdPrefix}_4` },
    ];

    return {
      nodes,
      edges,
      isDAG: true,
      nodeCount: nodes.length,
    };
  }
}

export const taskDecomposer = new TaskDecomposer();
