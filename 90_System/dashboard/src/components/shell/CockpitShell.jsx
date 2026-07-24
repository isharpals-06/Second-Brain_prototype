import React from 'react';
import { AppStateProvider } from '../../core/StateStore';
import LayoutEngine from '../../layouts/LayoutEngine';

export function CockpitShell() {
  return (
    <AppStateProvider>
      <LayoutEngine />
    </AppStateProvider>
  );
}

export default CockpitShell;
