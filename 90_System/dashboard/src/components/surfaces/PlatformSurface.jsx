import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

export function PlatformSurface() {
  const [diagnostics, setDiagnostics] = useState(null);

  useEffect(() => {
    async function fetchDiagnostics() {
      try {
        const res = await fetch('/api/platform/diagnostics');
        if (res.ok) {
          const data = await res.json();
          setDiagnostics(data);
        }
      } catch (err) {
        console.error('Failed to fetch platform diagnostics:', err);
      }
    }
    fetchDiagnostics();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-family-ui)', fontSize: '18px', color: '#FFFFFF', margin: 0 }}>
            PLATFORM KERNEL, PROVIDERS & MCP RUNTIME
          </h2>
          <p style={{ fontFamily: 'var(--font-family-mono)', fontSize: '11px', color: 'var(--color-on-surface-variant)', margin: '2px 0 0 0' }}>
            Kernel Version: {diagnostics?.kernelVersion || 'AEGISOS-Platform-v1.0.0'}
          </p>
        </div>
        <Badge status={diagnostics?.status === 'healthy' ? 'nominal' : 'warning'}>
          {diagnostics?.status?.toUpperCase() || 'HEALTHY'}
        </Badge>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', flex: 1, minHeight: 0 }}>
        {/* Universal Model Providers */}
        <Card title="MODEL PROVIDERS (MPAL v1.2.0)" subtitle="Hot-Swappable Compute Backends">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { id: 'gemini', name: 'Google Gemini API', status: 'ONLINE', latency: '292ms' },
              { id: 'ollama', name: 'Local Ollama Engine', status: 'OFFLINE', latency: 'N/A' },
              { id: 'openrouter', name: 'OpenRouter Multi-Vendor', status: 'OFFLINE', latency: 'N/A' },
              { id: 'huggingface', name: 'Hugging Face Hub', status: 'OFFLINE', latency: 'N/A' },
            ].map((prov, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', border: '1px solid var(--color-outline-subtle)', backgroundColor: 'var(--color-surface-base)' }}>
                <div>
                  <h4 style={{ fontSize: '12px', margin: 0, color: '#FFFFFF' }}>{prov.name}</h4>
                  <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '10px', color: 'var(--color-on-surface-variant)' }}>
                    Latency: {prov.latency}
                  </span>
                </div>
                <Badge status={prov.status === 'ONLINE' ? 'nominal' : 'info'}>{prov.status}</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* MCP Server Ecosystem */}
        <Card title="MCP TOOL RUNTIME ECOSYSTEM" subtitle="Discoverable Capability Servers">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {diagnostics?.mcpServers && diagnostics.mcpServers.length > 0 ? (
              diagnostics.mcpServers.map((mcp, i) => (
                <div key={i} style={{ padding: '8px', border: '1px solid var(--color-outline-subtle)', backgroundColor: 'var(--color-surface-base)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '12px', margin: 0, color: '#FFFFFF' }}>{mcp.label}</h4>
                    <Badge status="nominal">{mcp.status.toUpperCase()}</Badge>
                  </div>
                  <p style={{ fontFamily: 'var(--font-family-mono)', fontSize: '10px', color: 'var(--color-on-surface-variant)', marginTop: '2px' }}>
                    Tools: {mcp.toolsCount} | Path: {mcp.path}
                  </p>
                </div>
              ))
            ) : (
              <p style={{ fontFamily: 'var(--font-family-mono)', fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>
                Loading registered MCP servers...
              </p>
            )}
          </div>
        </Card>

        {/* Active Plugins */}
        <Card title="ACTIVE PLATFORM PLUGINS" subtitle="Modular Extension Capabilities">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {diagnostics?.plugins && diagnostics.plugins.length > 0 ? (
              diagnostics.plugins.map((plug, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', border: '1px solid var(--color-outline-subtle)', backgroundColor: 'var(--color-surface-base)' }}>
                  <div>
                    <h4 style={{ fontSize: '12px', margin: 0, color: '#FFFFFF' }}>{plug.name} (v{plug.version})</h4>
                    <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '10px', color: 'var(--color-on-surface-variant)' }}>
                      ID: {plug.id}
                    </span>
                  </div>
                  <Badge status="nominal">ACTIVE</Badge>
                </div>
              ))
            ) : (
              <p style={{ fontFamily: 'var(--font-family-mono)', fontSize: '12px', color: 'var(--color-on-surface-variant)' }}>
                Loading active plugins...
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default PlatformSurface;
