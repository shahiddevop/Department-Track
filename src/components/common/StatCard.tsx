import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  trendPositive?: boolean;
  color?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendPositive = true,
  color = '#6366f1',
  onClick
}) => {
  return (
    <div 
      className="glass-panel"
      onClick={onClick}
      style={{
        padding: '1.4rem',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Subtle top accent gradient bar */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: color
        }}
      />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {title}
          </span>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, marginTop: '0.35rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {value}
          </div>
          {subtitle && (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {subtitle}
            </div>
          )}
          {trend && (
            <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span className={`badge ${trendPositive ? 'badge-emerald' : 'badge-rose'}`} style={{ fontSize: '0.725rem' }}>
                {trend}
              </span>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>vs previous week</span>
            </div>
          )}
        </div>

        <div 
          style={{
            width: '46px',
            height: '46px',
            borderRadius: 'var(--radius-md)',
            background: `${color}20`,
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 12px ${color}30`
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};
