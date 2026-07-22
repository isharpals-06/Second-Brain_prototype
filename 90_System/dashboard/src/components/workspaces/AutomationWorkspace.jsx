import React, { useState, useEffect } from 'react';
import { Zap, ShieldCheck, RotateCcw, Sliders } from 'lucide-react';

export default function AutomationWorkspace() {
  const [levelData, setLevelData] = useState({ level: 'INTERACTIVE', name: 'Level 2: Human-in-the-loop' });

  useEffect(() => {
    fetch('/api/automation/level').then(r => r.json()).then(setLevelData).catch(() => {});
  }, []);

  return (
    <div style={{ padding: '24px', overflowY: 'auto', height: '100%', color: '#f8fafc' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Zap size={22} style={{ color: '#38bdf8' }} />
            AUTONOMOUS AUTOMATION PLATFORM
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>
            Trigger Engine, Autonomy Level Control, Policy Executor & Rollback Manager
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '20px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={18} style={{ color: '#38bdf8' }} />
            Current Autonomy Level
          </h2>
          <div style={{ padding: '16px', background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '8px' }}>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#38bdf8' }}>{levelData.level || 'INTERACTIVE'}</div>
            <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px' }}>{levelData.name || 'Level 2: Human-in-the-loop validation'}</div>
          </div>
        </div>

        <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '20px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RotateCcw size={18} style={{ color: '#f59e0b' }} />
            Rollback Manager Status
          </h2>
          <div style={{ fontSize: '13px', color: '#94a3b8' }}>
            System state snapshots ready for instant atomic rollback if required.
          </div>
        </div>
      </div>
    </div>
  );
}
