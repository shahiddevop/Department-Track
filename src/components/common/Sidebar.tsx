import React from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  BookOpenCheck,
  CalendarRange,
  DoorClosed,
  Settings,
  Sparkles,
  X,
  User,
  LogOut
} from 'lucide-react';
import { Logo } from './Logo';
import { useDepartment } from '../../context/DepartmentContext';
import { useAuth } from '../../context/AuthContext';
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
  const { logout, currentUser } = useAuth();

  const navItems: { id: TabType; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'timetable', label: 'Timetable & Schedule', icon: <CalendarDays size={20} /> },
    { id: 'teaching-plan', label: 'Daily Teaching Plans', icon: <BookOpenCheck size={20} /> },
    { id: 'events', label: 'Events & Programs', icon: <CalendarRange size={20} /> },
    { id: 'rooms', label: 'Rooms & Labs', icon: <DoorClosed size={20} /> },
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
        style={{
          background: '#dceeff',
          borderRight: '1px solid rgba(0, 31, 63, 0.12)',
          color: '#001f3f',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden'
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: '1.25rem 1.15rem 0.85rem 1.15rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <Logo size={42} variant="badge" />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#001f3f' }}>
                  ADT
                </span>
                <Sparkles size={16} color="#001f3f" strokeWidth={2.3} />
              </div>
              <div style={{ fontSize: '0.72rem', color: '#2d4a6f', fontWeight: 600, marginTop: '2px', lineHeight: 1.25 }}>
                Academic Departmental<br />Track
              </div>
            </div>
          </div>

          {/* Close / Collapse Button */}
          <button
            onClick={handleClose}
            className="sidebar-close-btn"
            aria-label="Close Sidebar"
            title="Close Sidebar"
          >
            <X size={18} color="#001f3f" strokeWidth={2.2} />
          </button>
        </div>

        {/* Scrollable Navigation List */}
        <nav
          className="sidebar-nav"
          style={{
            flex: 1,
            minHeight: 0,
            padding: '0.5rem 0.85rem 0.75rem 0.85rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
            overflowY: 'auto'
          }}
        >
          <div
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#476788',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              padding: '0.65rem 0.5rem 0.35rem 0.5rem'
            }}
          >
            MANAGEMENT MODULES
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
                  padding: '0.72rem 0.85rem',
                  borderRadius: '12px',
                  border: 'none',
                  background: isActive ? '#ffffff' : 'transparent',
                  color: '#001f3f',
                  fontWeight: isActive ? 700 : 600,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  position: 'relative',
                  transition: 'background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease',
                  width: '100%',
                  boxShadow: isActive ? '0 2px 8px rgba(0, 31, 63, 0.05)' : 'none'
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {/* Active Indicator Bar on left edge (matching reference image 2) */}
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: '16%',
                      bottom: '16%',
                      width: '5px',
                      borderRadius: '0 4px 4px 0',
                      background: '#001f3f'
                    }}
                  />
                )}

                <span style={{ color: '#001f3f', display: 'flex', flexShrink: 0 }}>
                  {item.icon}
                </span>
                <span
                  style={{
                    flex: 1,
                    color: '#001f3f',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {item.label}
                </span>
                {item.badge && (
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '0.1rem 0.45rem',
                      borderRadius: '9999px',
                      background: '#e2edfc',
                      color: '#001f3f',
                      border: '1px solid rgba(0, 31, 63, 0.12)'
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Pinned Bottom Controls: Fixed Sign Out above Active Department Card */}
        <div
          style={{
            flexShrink: 0,
            padding: '0.5rem 0.85rem 0.95rem 0.85rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem'
          }}
        >
          {/* Sign Out Button */}
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to sign out?')) logout();
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.72rem 1rem',
              background: '#fee2e2',
              border: '1px solid #fca5a5',
              borderRadius: '14px',
              color: '#ef4444',
              fontSize: '0.88rem',
              fontWeight: 600,
              fontFamily: 'inherit',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: '0 1px 3px rgba(239, 68, 68, 0.08)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#fecaca';
              e.currentTarget.style.borderColor = '#f87171';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#fee2e2';
              e.currentTarget.style.borderColor = '#fca5a5';
            }}
            title={`Sign out ${currentUser.name}`}
          >
            <LogOut size={18} color="#ef4444" strokeWidth={2.2} />
            <span>Sign Out</span>
          </button>

          {/* Active Department Card */}
          <div
            style={{
              padding: '0.9rem 1rem',
              background: '#ffffff',
              border: '1px solid rgba(0, 31, 63, 0.06)',
              borderRadius: '16px',
              boxShadow: '0 4px 16px rgba(0, 31, 63, 0.04)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#476788' }}>
                Active Department
              </span>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.55rem',
                  borderRadius: '9999px',
                  background: '#e2edfc',
                  color: '#001f3f',
                  border: '1px solid rgba(0, 31, 63, 0.08)'
                }}
              >
                {selectedBranch.code}
              </span>
            </div>
            <div
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: '#001f3f',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {selectedBranch.name}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#476788', marginTop: '0.25rem', fontWeight: 500 }}>
              Est. {selectedBranch.establishedYear} • {selectedBranch.totalStudents} Students
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
