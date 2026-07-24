import { eventBus } from '../events/EventBus';

export class WorkspaceEngine {
  constructor() {
    this.activeSurface = 'mission'; // mission, conversation, knowledge, memory, platform
    this.activeMode = 'OBSERVE'; // OBSERVE, THINK, RESEARCH, BUILD, REVIEW, FOCUS
  }

  setSurface(surfaceId) {
    this.activeSurface = surfaceId;
    eventBus.emit('WorkspaceChanged', { surface: surfaceId, mode: this.activeMode });
    return this.activeSurface;
  }

  setMode(modeId) {
    this.activeMode = modeId;
    eventBus.emit('WorkspaceChanged', { surface: this.activeSurface, mode: modeId });
    return this.activeMode;
  }

  getWorkspaceState() {
    return {
      activeSurface: this.activeSurface,
      activeMode: this.activeMode,
    };
  }
}

export const workspaceEngine = new WorkspaceEngine();
