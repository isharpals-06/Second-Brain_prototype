import React from 'react';

export function Card({
  title,
  subtitle,
  children,
  action,
  className = '',
  style = {}
}) {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface-panel)',
        border: '1px solid var(--color-outline)',
        borderRadius: '0px',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        overflow: 'hidden',
        ...style
      }}
      className={`aegis-card-primitive ${className}`}
    >
      {(title || action) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            borderBottom: '1px solid var(--color-outline-subtle)',
            backgroundColor: 'var(--color-surface-base)',
          }}
        >
          <div>
            {title && <h4 className="label-caps" style={{ color: 'var(--color-on-surface)' }}>{title}</h4>}
            {subtitle && <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '11px', color: 'var(--color-on-surface-variant)' }}>{subtitle}</span>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div style={{ padding: '16px', flex: 1, overflow: 'auto' }}>
        {children}
      </div>
    </div>
  );
}

export default Card;
