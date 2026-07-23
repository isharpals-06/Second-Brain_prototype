import React from 'react';

export function Button({ 
  children, 
  variant = 'secondary', // 'primary' | 'secondary' | 'ghost' | 'destructive'
  size = 'md',          // 'sm' | 'md' | 'lg'
  className = '', 
  disabled = false,
  onClick,
  ...props 
}) {
  const baseStyles = {
    fontFamily: 'var(--font-family-mono)',
    fontSize: size === 'sm' ? '11px' : size === 'lg' ? '14px' : '12px',
    fontWeight: '600',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    padding: size === 'sm' ? '4px 8px' : size === 'lg' ? '10px 18px' : '6px 12px',
    borderRadius: '0px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'var(--transition-fast)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    border: '1px solid transparent',
  };

  const variantStyles = {
    primary: {
      backgroundColor: 'var(--color-primary-blue)',
      color: '#FFFFFF',
      borderColor: 'var(--color-primary-blue)',
      boxShadow: '0 0 10px var(--color-primary-blue-glow)',
    },
    secondary: {
      backgroundColor: 'transparent',
      color: 'var(--color-on-surface)',
      borderColor: 'var(--color-outline)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--color-on-surface-variant)',
      borderColor: 'transparent',
    },
    destructive: {
      backgroundColor: 'rgba(255, 180, 171, 0.1)',
      color: 'var(--color-status-error)',
      borderColor: 'var(--color-status-error)',
    }
  };

  return (
    <button
      style={{ ...baseStyles, ...variantStyles[variant] }}
      className={`aegis-button ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
