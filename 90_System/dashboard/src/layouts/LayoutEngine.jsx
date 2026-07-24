import React from 'react';
import HeaderTelemetryBar from '../components/shell/HeaderTelemetryBar';
import LivingContextRail from '../components/shell/LivingContextRail';
import AdaptiveWorkspaceViewport from '../components/shell/AdaptiveWorkspaceViewport';
import ContextInspector from '../components/shell/ContextInspector';
import CognitiveStreamConsole from '../components/shell/CognitiveStreamConsole';
import CommandPalette from '../components/shell/CommandPalette';

export function LayoutEngine() {
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
      {/* 1. Header Telemetry Bar (48px) */}
      <HeaderTelemetryBar />

      {/* 2. Middle Operational Viewport Row */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        <LivingContextRail />
        <AdaptiveWorkspaceViewport />
        <ContextInspector />
      </div>

      {/* 3. Bottom Cognitive Stream Console (240px) */}
      <CognitiveStreamConsole />

      {/* 4. Command Palette Overlay (Ctrl+K) */}
      <CommandPalette />
    </div>
  );
}

export default LayoutEngine;
