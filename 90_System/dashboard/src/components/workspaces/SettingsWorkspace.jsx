import React, { useState, useEffect } from 'react';
import { Settings, Cpu, Database, Server, RefreshCw } from 'lucide-react';

export default function SettingsWorkspace({ onTriggerBackup }) {
  const [models, setModels] = useState([]);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    fetch('/api/ollama/models').then(r => r.json()).then(setModels).catch(() => {});
    fetch('/api/config').then(r => r.json()).then(setConfig).catch(() => {});
  }, []);

  return (
    <div style={{ padding: '24px', overflowY: 'auto', height: '100%', color: '#f8fafc' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Settings size={22} style={{ color: '#94a3b8' }} />
            SYSTEM SETTINGS & CONFIGURATION
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>
            LLM Provider Bindings, Vault Storage Paths & Backup Trigger
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '20px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={18} style={{ color: '#a855f7' }} />
            Detected Ollama Models
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {models.map(m => (
              <div key={m.id} style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', fontSize: '13px', color: '#cbd5e1' }}>
                {m.name}
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '20px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={18} style={{ color: '#38bdf8' }} />
            Vault & Backup Operations
          </h2>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px' }}>
            Vault Directory: C:\Users\ishar\Projects\SecondBrain
          </div>
          <button
            onClick={onTriggerBackup}
            style={{
              padding: '10px 16px',
              background: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '6px',
              color: '#38bdf8',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Database size={15} /> Trigger Full Zip Backup
          </button>
        </div>
      </div>
    </div>
  );
}
