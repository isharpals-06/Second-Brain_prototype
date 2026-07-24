export class DependencyResolver {
  resolveDependencies(taskGraph) {
    const nodes = taskGraph?.nodes || [];
    const edges = taskGraph?.edges || [];

    const nodeIds = new Set(nodes.map(n => n.id));
    const inDegree = new Map();
    const adj = new Map();

    nodes.forEach(n => {
      inDegree.set(n.id, 0);
      adj.set(n.id, []);
    });

    edges.forEach(edge => {
      if (adj.has(edge.source)) {
        adj.get(edge.source).push(edge.target);
      }
      if (inDegree.has(edge.target)) {
        inDegree.set(edge.target, inDegree.get(edge.target) + 1);
      }
    });

    const queue = [];
    inDegree.forEach((degree, id) => {
      if (degree === 0) queue.push(id);
    });

    const sequentialOrder = [];
    const parallelGroups = [];

    while (queue.length > 0) {
      const levelSize = queue.length;
      const currentLevelGroup = [];

      for (let i = 0; i < levelSize; i++) {
        const curr = queue.shift();
        currentLevelGroup.push(curr);
        sequentialOrder.push(curr);

        const neighbors = adj.get(curr) || [];
        neighbors.forEach(next => {
          inDegree.set(next, inDegree.get(next) - 1);
          if (inDegree.get(next) === 0) {
            queue.push(next);
          }
        });
      }
      parallelGroups.push(currentLevelGroup);
    }

    const isCircular = sequentialOrder.length !== nodes.length;

    return {
      isValid: !isCircular,
      sequentialOrder,
      parallelGroups,
      isCircular,
      blockedTasks: isCircular ? nodes.filter(n => !sequentialOrder.includes(n.id)).map(n => n.id) : [],
    };
  }
}

export const dependencyResolver = new DependencyResolver();
