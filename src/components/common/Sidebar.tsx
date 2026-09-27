import React from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  BookOpenCheck, 
  CalendarRange, 
  DoorClosed, 
  BarChart3, 
  Settings, 
  GraduationCap, 
  Sparkles,
  X,
  User
} from 'lucide-react';
import { useDepartment } from '../../context/DepartmentContext';
import { TabType } from '../../types';

interface SidebarProps {
  isOpen?: boolean;
  isCollapsed?: boolean;
  onClose?: () => void;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen = false, 
  isCollapsed = false,
  onClose,
  onToggleCollapse
}) => {
  const { activeTab, setActiveTab, selectedBranch } = useDepartment();

  const navItems: { id: TabType; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'timetable', label: 'Timetable & Schedule', icon: <CalendarDays size={20} /> },
    { id: 'teaching-plan', label: 'Daily Teaching Plans', icon: <BookOpenCheck size={20} /> },
    { id: 'events', label: 'Events & Programs', icon: <CalendarRange size={20} /> },
    { id: 'rooms', label: 'Rooms & Labs', icon: <DoorClosed size={20} /> },
    { id: 'reports', label: 'Reports & Analytics', icon: <BarChart3 size={20} /> },
    { id: 'settings', label: 'Department Config', icon: <Settings size={20} /> },
    { id: 'profile', label: 'User Profile', icon: <User size={20} /> },
  ];

  const handleNavClick = (tabId: TabType) => {
    setActiveTab(tabId);
    if (onClose) {
      onClose();
    }
  };

  const handleClose = () => {
    if (onClose) onClose();
    if (onToggleCollapse) onToggleCollapse();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={onClose} 
          aria-label="Close Sidebar Overlay"
        />
      )}

      <aside 
        className={`sidebar no-print ${isOpen ? 'sidebar-open' : ''} ${isCollapsed ? 'sidebar-collapsed' : ''}`}
      >
        {/* Brand Header */}
        <div 
          style={{
            padding: '1.5rem 1.25rem 1.25rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-subtle)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div 
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.45)',
                flexShrink: 0
              }}
            >
              <GraduationCap size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                  AcadPulse
                </span>
                <Sparkles size={14} color="#818cf8" />
              </div>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                Academic & Event Hub
              </span>
            </div>
          </div>

          {/* Close / Collapse Button */}
          <button
            onClick={handleClose}
            className="sidebar-close-btn"
            aria-label="Close Sidebar"
            title="Close Sidebar"
          >
            <X size={18} />
          </button>
        </div>

      {/* Navigation List */}
      <nav style={{ flex: 1, padding: '1.25rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', overflowY: 'auto' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 0.5rem 0.5rem 0.5rem' }}>
          Management Modules
        </div>

        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                color: isActive ? 'var(--accent-indigo)' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.9rem',
                cursor: 'pointer',
                textAlign: 'left',
                position: 'relative',
                transition: 'all var(--tr-fast)',
                width: '100%'
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--bg-card-hover)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              {/* Glowing active left indicator */}
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '15%',
                    bottom: '15%',
                    width: '4px',
                    borderRadius: '0 4px 4px 0',
                    background: 'var(--accent-primary)',
                    boxShadow: '0 0 10px var(--accent-primary)'
                  }}
                />
              )}

              <span style={{ color: isActive ? 'var(--accent-primary)' : 'inherit', display: 'flex' }}>
                {item.icon}
              </span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span className="badge badge-amber" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Department Summary Footer Card */}
      <div style={{ padding: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
        <div
          className="glass-panel"
          style={{
            padding: '0.9rem',
            background: 'var(--bg-input)',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              Active Department
            </span>
            <span className="badge badge-indigo" style={{ fontSize: '0.65rem' }}>
              {selectedBranch.code}
            </span>
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {selectedBranch.name}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Est. {selectedBranch.establishedYear} • {selectedBranch.totalStudents} Students
          </div>
        </div>
      </div>
    </aside>
  </>
);
};
