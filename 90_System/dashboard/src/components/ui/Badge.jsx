import React from 'react';

export function Badge({ 
  children, 
  status = 'info', // 'nominal' | 'active' | 'warning' | 'error' | 'info'
  size = 'md',    // 'sm' | 'md'
  className = '' 
}) {
  const statusColors = {
    nominal: { color: 'var(--color-status-success)', border: 'rgba(0, 230, 118, 0.4)', bg: 'rgba(0, 230, 118, 0.1)' },
    active: { color: 'var(--color-primary-blue)', border: 'rgba(37, 99, 235, 0.4)', bg: 'rgba(37, 99, 235, 0.1)' },
    warning: { color: 'var(--color-status-warning)', border: 'rgba(255, 181, 150, 0.4)', bg: 'rgba(255, 181, 150, 0.1)' },
    error: { color: 'var(--color-status-error)', border: 'rgba(255, 180, 171, 0.4)', bg: 'rgba(255, 180, 171, 0.1)' },
    info: { color: 'var(--color-on-surface-variant)', border: 'var(--color-outline)', bg: 'rgba(255, 255, 255, 0.04)' },
  };

  const style = statusColors[status] || statusColors.info;

  return (
    <span
      style={{
        fontFamily: 'var(--font-family-mono)',
        fontSize: size === 'sm' ? '10px' : '11px',
        fontWeight: '700',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        padding: size === 'sm' ? '2px 6px' : '4px 8px',
        borderRadius: '0px',
        color: style.color,
        backgroundColor: style.bg,
        border: `1px solid ${style.border}`,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
      }}
      className={`aegis-badge ${className}`}
    >
      <span style={{ width: '5px', height: '5px', backgroundColor: style.color, borderRadius: '50%' }} />
      {children}
    </span>
  );
}

export default Badge;
