import React from 'react';
import { useAppState } from '../../core/StateStore';
import MissionSurface from '../surfaces/MissionSurface';
import ConversationSurface from '../surfaces/ConversationSurface';
import KnowledgeSurface from '../surfaces/KnowledgeSurface';
import MemorySurface from '../surfaces/MemorySurface';
import PlatformSurface from '../surfaces/PlatformSurface';

export function AdaptiveWorkspaceViewport() {
  const { state } = useAppState();
  const { workspace } = state;

  // Map workspace active mode or active subsystem to the 5 Adaptive Surfaces
  function renderActiveSurface() {
    const mode = workspace.activeMode;
    const subsystem = workspace.activeSubsystem;

    if (subsystem === 'conversation' || mode === 'THINK') {
      return <ConversationSurface />;
    }
    if (subsystem === 'knowledge' || mode === 'RESEARCH') {
      return <KnowledgeSurface />;
    }
    if (subsystem === 'memory' || mode === 'REVIEW') {
      return <MemorySurface />;
    }
    if (subsystem === 'platform') {
      return <PlatformSurface />;
    }

    // Default: Mission Surface (OBSERVE, BUILD, FOCUS, or Default)
    return <MissionSurface />;
  }

  return (
    <main
      style={{
        flex: 1,
        backgroundColor: 'var(--color-surface-panel)',
        padding: '20px',
        overflowY: 'auto',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {renderActiveSurface()}
    </main>
  );
}

export default AdaptiveWorkspaceViewport;
