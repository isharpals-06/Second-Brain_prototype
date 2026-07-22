import React, { useState, useEffect } from 'react';
import { Wrench, Terminal, Shield, Play } from 'lucide-react';

export default function ToolRuntimeWorkspace() {
  const [tools, setTools] = useState([]);

  useEffect(() => {
    fetch('/api/tools').then(r => r.json()).then(setTools).catch(() => {});
  }, []);

  return (
    <div style={{ padding: '24px', overflowY: 'auto', height: '100%', color: '#f8fafc' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Wrench size={22} style={{ color: '#a855f7' }} />
            TOOL RUNTIME & HAL PLATFORM
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>
            Hardware Abstraction Layer (HAL), Permission Gateway & Tool Execution Sandbox
          </p>
        </div>
      </div>

      <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '20px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Registered HAL Tools</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {(tools.length > 0 ? tools : [
            { id: 'tool_git_status', name: 'Git Repository Status Tool', category: 'Version Control', risk: 'Low' },
            { id: 'tool_file_read', name: 'Filesystem Safe Read Tool', category: 'Storage', risk: 'Low' },
            { id: 'tool_file_write', name: 'Filesystem Sandbox Write Tool', category: 'Storage', risk: 'Medium' },
            { id: 'tool_vault_search', name: 'Vault Semantic Search Tool', category: 'Knowledge', risk: 'Low' }
          ]).map(t => (
            <div key={t.id} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: '14px', color: '#f1f5f9' }}>{t.name}</span>
                <span style={{ fontSize: '11px', fontFamily: 'monospace', padding: '2px 8px', borderRadius: '4px', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
                  Risk: {t.risk || 'Low'}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>ID: {t.id} • Category: {t.category}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
