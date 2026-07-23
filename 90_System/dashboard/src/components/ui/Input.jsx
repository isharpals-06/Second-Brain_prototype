import React from 'react';

export function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  className = '',
  mono = true,
  disabled = false,
  ...props
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      style={{
        fontFamily: mono ? 'var(--font-family-mono)' : 'var(--font-family-ui)',
        fontSize: '13px',
        color: 'var(--color-on-surface)',
        backgroundColor: 'var(--color-surface-container)',
        border: '1px solid var(--color-outline)',
        borderRadius: '0px',
        padding: '8px 12px',
        width: '100%',
        boxSizing: 'border-box',
        outline: 'none',
        transition: 'var(--transition-fast)',
      }}
      className={`aegis-input ${className}`}
      {...props}
    />
  );
}

export default Input;
