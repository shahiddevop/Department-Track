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
        background: 'var(--bg-card)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
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
              <Menu size={20} />
            </button>
          )}

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
              className="btn btn-secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-input)'
              }}
            >
              <div 
                style={{ 
                  width: '10px', 
                  height: '10px', 
                  borderRadius: '50%', 
                  background: selectedBranch.color || '#6366f1' 
                }} 
              />
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                {selectedBranch.code}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                | {selectedBranch.name}
              </span>
              <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="btn btn-secondary btn-icon"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#6366f1" />}
          </button>

          {/* Notifications Trigger */}
          <button
            onClick={onOpenNotifications}
            className="btn btn-secondary btn-icon"
            style={{ position: 'relative' }}
            title="Notifications & Announcements"
          >
            <Bell size={18} />
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
                  border: '2px solid var(--bg-card)'
                }}
              >
                {unreadNotificationCount}
              </span>
            )}
          </button>

          {/* User Profile Pill */}
          <div
            onClick={() => setIsProfileModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.35rem 0.85rem 0.35rem 0.45rem',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer',
              transition: 'border-color var(--tr-base)'
            }}
            title="Click to switch role or view profile"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid var(--accent-primary)'
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {currentUser.name}
                </span>
                {getRoleBadge()}
              </div>
            </div>
            <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
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
