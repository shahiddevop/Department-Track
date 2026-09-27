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
    <div 
      className="urgent-ticker no-print"
      style={{
        background: 'linear-gradient(90deg, #b91c1c 0%, #dc2626 50%, #991b1b 100%)',
        color: '#ffffff',
        padding: '0.6rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.85rem',
        fontWeight: 600,
        boxShadow: '0 2px 10px rgba(220, 38, 38, 0.3)',
        animation: 'fadeIn 0.3s ease-in-out'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, overflow: 'hidden' }}>
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.35rem', 
            background: 'rgba(0, 0, 0, 0.25)', 
            padding: '0.15rem 0.6rem', 
            borderRadius: 'var(--radius-full)',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
        >
          <AlertTriangle size={14} color="#fef08a" />
          <span>Urgent Notice</span>
        </div>
        <span style={{ fontWeight: 700 }}>{topUrgent.title}:</span>
        <span style={{ opacity: 0.95, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {topUrgent.message}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem' }}>
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
            display: 'flex'
          }}
          title="Dismiss banner"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
