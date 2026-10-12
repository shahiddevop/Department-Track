import React from 'react';

export interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  showText?: boolean;
  subtitle?: string;
  variant?: 'plain' | 'badge' | 'glass';
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const sizeMap: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', number> = {
  xs: 24,
  sm: 32,
  md: 42,
  lg: 54,
  xl: 72,
};

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = false,
  subtitle = 'Academic Departmental Track',
  variant = 'badge',
  className = '',
  style = {},
  onClick
}) => {
  const pixelSize = typeof size === 'number' ? size : sizeMap[size] || 42;

  const renderBadge = () => {
    if (variant === 'plain') {
      return (
        <img
          src="/adt-logo.png"
          alt="ADT Logo"
          width={pixelSize}
          height={Math.round(pixelSize * 0.8)}
          style={{
            objectFit: 'contain',
            filter: 'drop-shadow(0 2px 6px rgba(0, 31, 63, 0.18))',
            transition: 'transform 0.25s ease, filter 0.25s ease',
            display: 'block'
          }}
          className="adt-logo-img"
        />
      );
    }

    if (variant === 'glass') {
      return (
        <div
          className="adt-logo-badge adt-logo-glass"
          style={{
            width: `${pixelSize}px`,
            height: `${pixelSize}px`,
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(0, 31, 63, 0.15)',
            boxShadow: '0 4px 16px rgba(0, 31, 63, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px',
            flexShrink: 0,
            overflow: 'hidden',
            transition: 'all 0.25s ease'
          }}
        >
          <img
            src="/adt-logo.png"
            alt="ADT Logo"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 1px 3px rgba(0, 31, 63, 0.15))'
            }}
          />
        </div>
      );
    }

    // Default: 'badge' - crisp contrast card that looks stunning on dark, navy, and light backgrounds
    return (
      <div
        className="adt-logo-badge"
        style={{
          width: `${pixelSize}px`,
          height: `${pixelSize}px`,
          borderRadius: `${Math.max(8, Math.round(pixelSize * 0.22))}px`,
          background: 'linear-gradient(145deg, #ffffff 0%, #f0f7ff 100%)',
          border: '1.5px solid rgba(0, 119, 182, 0.25)',
          boxShadow: '0 4px 14px rgba(2, 62, 125, 0.15), 0 1px 3px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: `${Math.max(2, Math.round(pixelSize * 0.08))}px`,
          flexShrink: 0,
          overflow: 'hidden',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          cursor: onClick ? 'pointer' : 'default'
        }}
      >
        <img
          src="/adt-logo.png"
          alt="ADT Logo"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            transform: 'scale(1.08)',
            filter: 'drop-shadow(0 1px 2px rgba(0, 31, 63, 0.12))'
          }}
        />
      </div>
    );
  };

  if (!showText) {
    return (
      <div
        className={`adt-logo-container ${className}`}
        style={{ display: 'inline-flex', alignItems: 'center', ...style }}
        onClick={onClick}
      >
        {renderBadge()}
      </div>
    );
  }

  return (
    <div
      className={`adt-logo-brand ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.75rem',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        ...style
      }}
      onClick={onClick}
    >
      {renderBadge()}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span
            style={{
              fontSize: `${Math.max(1.1, pixelSize * 0.03)}rem`,
              fontWeight: 800,
              letterSpacing: '-0.025em',
              color: 'var(--text-primary, #001f3f)',
              lineHeight: 1.15
            }}
          >
            ADT
          </span>
        </div>
        {subtitle && (
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              color: 'var(--text-secondary, rgba(0, 31, 63, 0.72))',
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
              lineHeight: 1.2
            }}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};
