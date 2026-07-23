import React from 'react';
import { AppStateProvider } from '../../core/StateStore';
import HeaderTelemetryBar from './HeaderTelemetryBar';
import LivingContextRail from './LivingContextRail';
import AdaptiveWorkspaceViewport from './AdaptiveWorkspaceViewport';
import ContextInspector from './ContextInspector';
import CognitiveStreamConsole from './CognitiveStreamConsole';
import CommandPalette from './CommandPalette';

function CockpitLayout() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100vw',
        height: '100vh',
        backgroundColor: 'var(--color-surface-base)',
        color: 'var(--color-on-surface)',
        overflow: 'hidden',
      }}
    >
      {/* 1. Global Header Bar (48px) */}
      <HeaderTelemetryBar />

      {/* 2. Middle Row: Living Context Rail + Adaptive Workspace + Context Inspector */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        <LivingContextRail />
        <AdaptiveWorkspaceViewport />
        <ContextInspector />
      </div>

      {/* 3. Bottom Docked Cognitive Stream Console (240px) */}
      <CognitiveStreamConsole />

      {/* 4. Global Command Palette Overlay (Ctrl+K) */}
      <CommandPalette />
    </div>
  );
}

export function CockpitShell() {
  return (
    <AppStateProvider>
      <CockpitLayout />
    </AppStateProvider>
  );
}

export default CockpitShell;
