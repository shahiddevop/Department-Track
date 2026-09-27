import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useDepartment } from '../../context/DepartmentContext';

export const Toast: React.FC = () => {
  const { toasts, removeToast } = useDepartment();

  if (toasts.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} />;
      case 'error':
        return <AlertCircle size={18} />;
      case 'warning':
        return <AlertTriangle size={18} />;
      default:
        return <Info size={18} />;
    }
  };

  return (
    <div className="toast-container no-print">
      {toasts.map(t => (
        <div key={t.id} className={`toast-item toast-${t.type}`}>
          {getIcon(t.type)}
          <span style={{ flex: 1 }}>{t.message}</span>
          <button
            onClick={() => removeToast(t.id)}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              display: 'flex',
              opacity: 0.8
            }}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};
