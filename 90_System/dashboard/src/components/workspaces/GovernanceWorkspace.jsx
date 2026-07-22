import React, { useState, useEffect } from 'react';
import { ShieldAlert, Lock, CheckCircle, FileText } from 'lucide-react';

export default function GovernanceWorkspace() {
  const [policies, setPolicies] = useState([]);
  const [audit, setAudit] = useState([]);

  useEffect(() => {
    fetch('/api/governance/policies').then(r => r.json()).then(setPolicies).catch(() => {});
    fetch('/api/governance/audit').then(r => r.json()).then(setAudit).catch(() => {});
  }, []);

  return (
    <div style={{ padding: '24px', overflowY: 'auto', height: '100%', color: '#f8fafc' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldAlert size={22} style={{ color: '#ef4444' }} />
            GOVERNANCE & TRUST PLATFORM
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>
            Policy Engine, Security Audit Engine, Identity & Secret Governance
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '20px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Policy Rules</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(policies.length > 0 ? policies : [
              { id: 'pol_git_read', name: 'Allow Read-Only Git Telemetry', action: 'ALLOW' },
              { id: 'pol_vault_file', name: 'Allow Vault File Observations', action: 'ALLOW' }
            ]).map(p => (
              <div key={p.id} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 500 }}>{p.name}</span>
                <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>{p.action}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '20px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Audit Engine Entries</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(audit.length > 0 ? audit : [
              { id: 'aud_01', type: 'permission', tool: 'tool_git_status', verdict: 'allow' }
            ]).map(a => (
              <div key={a.id} style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', fontSize: '12px', color: '#cbd5e1' }}>
                [{a.type}] Tool: {a.tool} → <span style={{ color: '#10b981', fontWeight: 600 }}>{a.verdict}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
