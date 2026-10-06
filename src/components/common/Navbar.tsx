import React, { useState } from 'react';
import { 
  Building2, 
  Sun, 
  Moon, 
  Bell, 
  ChevronDown, 
  User as UserIcon, 
  ShieldCheck, 
  GraduationCap, 
  Sparkles,
  Layers,
  Menu
} from 'lucide-react';
import { useDepartment } from '../../context/DepartmentContext';
import { useAuth } from '../../context/AuthContext';
import { UserProfileModal } from '../settings/UserProfileModal';

interface NavbarProps {
  onOpenNotifications: () => void;
  onToggleMobileSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenNotifications, onToggleMobileSidebar }) => {
  const { 
    theme, 
    toggleTheme, 
    branches, 
    selectedBranchId, 
    setSelectedBranchId, 
    selectedBranch,
    unreadNotificationCount 
  } = useDepartment();

  const { currentUser } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);

  const getRoleBadge = () => {
    if (currentUser.role === 'admin') {
      return <span className="badge badge-rose"><ShieldCheck size={12} /> HOD / Admin</span>;
    }
    if (currentUser.role === 'faculty') {
      return <span className="badge badge-indigo"><GraduationCap size={12} /> Faculty</span>;
    }
    return <span className="badge badge-emerald"><UserIcon size={12} /> Student CR</span>;
  };

  return (
    <>
      <header className="navbar no-print" style={{
        height: '70px',
        padding: '0 2rem',
        background: '#ADD8E6',
        color: '#001f3f',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(0, 31, 63, 0.15)',
        boxShadow: '0 2px 10px rgba(0, 31, 63, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        {/* Left: Mobile Menu Trigger & Branch Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {onToggleMobileSidebar && (
            <button
              onClick={onToggleMobileSidebar}
              className="mobile-menu-btn no-print"
              aria-label="Open Navigation Menu"
              title="Menu"
            >
              <Menu size={20} color="#001f3f" />
            </button>
          )}

          {/* Application Title in Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginRight: '0.25rem' }}>
            <span style={{ fontWeight: 800, fontSize: '1.15rem', color: '#001f3f', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
              ADT
            </span>
            <span className="navbar-brand-subtitle" style={{ fontSize: '0.85rem', color: '#001f3f', opacity: 0.85, fontWeight: 600, whiteSpace: 'nowrap' }}>
              | Academic Departmental Track
            </span>
          </div>

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
              className="btn btn-secondary navbar-branch-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <div 
                style={{ 
                  width: '10px', 
                  height: '10px', 
                  borderRadius: '50%', 
                  background: selectedBranch.color || '#001f3f' 
                }} 
              />
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#001f3f' }}>
                {selectedBranch.code}
              </span>
              <span className="navbar-branch-text" style={{ color: '#001f3f', opacity: 0.8, fontSize: '0.85rem' }}>
                | {selectedBranch.name}
              </span>
              <ChevronDown size={16} color="#001f3f" />
            </button>

            {/* Dropdown Menu */}
            {isBranchDropdownOpen && (
              <div 
                className="glass-panel"
                style={{
                  position: 'absolute',
                  top: '120%',
                  left: 0,
                  width: '320px',
                  maxWidth: 'calc(100vw - 2rem)',
                  padding: '0.5rem',
                  zIndex: 200,
                  boxShadow: 'var(--shadow-lg)'
                }}
              >
                <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Switch Department / Branch
                </div>
                {branches.map(branch => (
                  <button
                    key={branch.id}
                    onClick={() => {
                      setSelectedBranchId(branch.id);
                      setIsBranchDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.65rem 0.75rem',
                      background: branch.id === selectedBranchId ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      color: 'var(--text-primary)',
                      transition: 'background var(--tr-fast)'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = branch.id === selectedBranchId ? 'rgba(99, 102, 241, 0.15)' : 'transparent'}
                  >
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: branch.color }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{branch.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>HOD: {branch.hodName}</div>
                    </div>
                    <span className="badge badge-indigo" style={{ fontSize: '0.7rem' }}>{branch.code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Theme Toggle, Notifications, User Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="btn btn-secondary btn-icon navbar-icon-btn"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={18} color="#b45309" /> : <Moon size={18} color="#001f3f" />}
          </button>

          {/* Notifications Trigger */}
          <button
            onClick={onOpenNotifications}
            className="btn btn-secondary btn-icon navbar-icon-btn"
            style={{ position: 'relative' }}
            title="Notifications & Announcements"
          >
            <Bell size={18} color="#001f3f" />
            {unreadNotificationCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: 'var(--accent-rose)',
                  color: '#fff',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #ADD8E6'
                }}
              >
                {unreadNotificationCount}
              </span>
            )}
          </button>

          {/* User Profile Pill */}
          <div
            onClick={() => setIsProfileModalOpen(true)}
            className="navbar-user-pill"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.65rem 0.35rem 0.45rem',
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer'
            }}
            title="Click to switch role or view profile"
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(0, 31, 63, 0.12)',
                border: '2px solid #001f3f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#001f3f',
                flexShrink: 0
              }}
            >
              <UserIcon size={18} />
            </div>
            <div className="navbar-user-text" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#001f3f', whiteSpace: 'nowrap' }}>
                  {currentUser.name}
                </span>
                {getRoleBadge()}
              </div>
            </div>
            <ChevronDown size={14} color="#001f3f" />
          </div>
        </div>
      </header>

      {/* User Switcher / Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
};
