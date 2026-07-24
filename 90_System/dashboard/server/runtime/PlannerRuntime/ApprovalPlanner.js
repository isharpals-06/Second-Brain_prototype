export class ApprovalPlanner {
  planApprovals(nodes = [], intentText = '') {
    const checkpoints = [];
    const text = intentText.toLowerCase();

    nodes.forEach(node => {
      const label = (node.label || '').toLowerCase();

      if (label.includes('delete') || text.includes('delete')) {
        checkpoints.push({ taskId: node.id, action: 'Deleting files', risk: 'HIGH', requiresUserConfirmation: true });
      }
      if (label.includes('shell') || label.includes('command') || text.includes('exec')) {
        checkpoints.push({ taskId: node.id, action: 'Executing shell commands', risk: 'HIGH', requiresUserConfirmation: true });
      }
      if (label.includes('git') || text.includes('commit')) {
        checkpoints.push({ taskId: node.id, action: 'Git commits', risk: 'MEDIUM', requiresUserConfirmation: false });
      }
    });

    return {
      hasCheckpoints: checkpoints.length > 0,
      checkpoints,
    };
  }
}

export const approvalPlanner = new ApprovalPlanner();
