export class CapabilityResolver {
  assignCapabilities(nodes = [], category = 'General') {
    const assignments = new Map();

    nodes.forEach(node => {
      const label = (node.label || '').toLowerCase();
      let capability = 'Reasoning';

      if (label.includes('research') || label.includes('search') || label.includes('find')) {
        capability = 'Research';
      } else if (label.includes('code') || label.includes('build') || label.includes('fix') || label.includes('implement')) {
        capability = 'Coding';
      } else if (label.includes('plan') || label.includes('design') || label.includes('architecture')) {
        capability = 'Planning';
      } else if (label.includes('memory') || label.includes('recall')) {
        capability = 'Memory';
      } else if (label.includes('graph') || label.includes('knowledge')) {
        capability = 'Knowledge';
      } else if (label.includes('tool') || label.includes('execute')) {
        capability = 'Tool Usage';
      } else if (label.includes('summarize') || label.includes('summary')) {
        capability = 'Summarization';
      }

      assignments.set(node.id, capability);
    });

    return {
      assignments: Object.fromEntries(assignments),
      requiredCapabilities: Array.from(new Set(assignments.values())),
    };
  }
}

export const capabilityResolver = new CapabilityResolver();
