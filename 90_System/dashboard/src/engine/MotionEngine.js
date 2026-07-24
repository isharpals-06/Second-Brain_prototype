import { tokens } from '../tokens/tokenResolver';

export class MotionEngine {
  getMotionCurve(stateName) {
    switch (stateName) {
      case 'THINKING':
      case 'REASONING':
        return { transition: tokens.motion.smooth, glowColor: tokens.colors.reasoning };
      case 'PLANNING':
        return { transition: tokens.motion.smooth, glowColor: tokens.colors.planning };
      case 'EXECUTING':
        return { transition: tokens.motion.snappy, glowColor: tokens.colors.execution };
      case 'REFLECTING':
        return { transition: tokens.motion.smooth, glowColor: tokens.colors.memory };
      default:
        return { transition: tokens.motion.snappy, glowColor: tokens.colors.passive };
    }
  }
}

export const motionEngine = new MotionEngine();
