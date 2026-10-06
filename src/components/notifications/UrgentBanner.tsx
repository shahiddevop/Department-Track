import React, { useState } from 'react';
import { AlertTriangle, X, ChevronRight, Bell } from 'lucide-react';
import { useDepartment } from '../../context/DepartmentContext';

interface UrgentBannerProps {
  onOpenNotifications: () => void;
}

export const UrgentBanner: React.FC<UrgentBannerProps> = ({ onOpenNotifications }) => {
  const { urgentNotifications } = useDepartment();
  const [dismissed, setDismissed] = useState(false);

  if (urgentNotifications.length === 0 || dismissed) return null;

  const topUrgent = urgentNotifications[0];

  return (
    <div className="urgent-ticker no-print">
      <div className="urgent-ticker-main">
        <div 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.35rem', 
            background: 'rgba(0, 0, 0, 0.25)', 
            padding: '0.15rem 0.6rem', 
            borderRadius: 'var(--radius-full)',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            flexShrink: 0
          }}
        >
          <AlertTriangle size={14} color="#fef08a" />
          <span>Urgent Notice</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', minWidth: 0 }}>
          <span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{topUrgent.title}:</span>
          <span style={{ opacity: 0.95, overflowWrap: 'break-word', wordBreak: 'break-word' }}>
            {topUrgent.message}
          </span>
        </div>
      </div>

      <div className="urgent-ticker-actions">
        <button
          onClick={onOpenNotifications}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            color: '#fff',
            padding: '0.25rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            fontSize: '0.75rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}
        >
          View All <ChevronRight size={14} />
        </button>
        <button
          onClick={() => setDismissed(true)}
          style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            opacity: 0.8,
            display: 'flex',
            padding: '0.25rem'
          }}
          title="Dismiss banner"
          aria-label="Dismiss banner"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
