import React, { useState, useEffect, useRef } from 'react';
import {
  Sun,
  Moon,
  Bell,
  ChevronDown,
  User as UserIcon,
  Menu,
  Lock
} from 'lucide-react';
import { Logo } from './Logo';
import { useDepartment } from '../../context/DepartmentContext';
import { useAuth } from '../../context/AuthContext';
import { UserProfileModal } from '../settings/UserProfileModal';
import { HODReauthModal } from '../auth/HODReauthModal';
import { Branch, User } from '../../types';
import { authService } from '../../services/authService';
import './Navbar.css';

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
    unreadNotificationCount,
    addToast
  } = useDepartment();

  const { currentUser, allUsers, switchUserById } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const [reauthTarget, setReauthTarget] = useState<User | null>(null);
  const [reauthBranch, setReauthBranch] = useState<Branch | null>(null);
  const [isReauthOpen, setIsReauthOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSelectBranch = (branch: Branch) => {
    setIsBranchDropdownOpen(false);
    if (branch.id === selectedBranchId) {
      return;
    }

    // Look up target HOD for this department
    const targetHOD = allUsers.find(
      u =>
        (u.branchId === branch.id && (u.role === 'admin' || u.isSuperAdmin)) ||
        (branch.hodEmail && u.email?.toLowerCase() === branch.hodEmail.toLowerCase()) ||
        (branch.hodName && u.name.toLowerCase() === branch.hodName.toLowerCase())
    );

    // If target HOD exists and does not match current active user, require secure re-authentication
    if (targetHOD && targetHOD.id !== currentUser.id) {
      setReauthTarget(targetHOD);
      setReauthBranch(branch);
      setIsReauthOpen(true);
      return;
    }

    // Direct switch if already the same HOD account
    setSelectedBranchId(branch.id);
  };

  const handleReauthSuccess = (authenticatedUser: User) => {
    switchUserById(authenticatedUser.id);
    authService.saveSession(authenticatedUser);
    if (reauthBranch) {
      setSelectedBranchId(reauthBranch.id);
      addToast(`Access granted! Switched to ${reauthBranch.name} workspace (${authenticatedUser.name})`, 'success');
    }
    setIsReauthOpen(false);
    setReauthTarget(null);
    setReauthBranch(null);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsBranchDropdownOpen(false);
      }
    };
    if (isBranchDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isBranchDropdownOpen]);

  return (
    <>
      <header className="navbar no-print">
        {/* Far Left: Menu Toggle & 'ADT' Branding */}
        <div className="navbar-left">
          {onToggleMobileSidebar && (
            <button
              onClick={onToggleMobileSidebar}
              className="mobile-menu-btn no-print"
              aria-label="Toggle Navigation Menu"
              title="Menu"
            >
              <Menu size={20} color="#001f3f" />
            </button>
          )}

          <div className="navbar-brand">
            <div className="navbar-logo-wrap">
              <Logo size={36} variant="badge" />
            </div>
            <div className="navbar-brand-text">
              <span className="navbar-brand-title">
                ADT
              </span>
              <span className="navbar-brand-subtitle hide-mobile">
                Academic Departmental Track
              </span>
            </div>
          </div>
        </div>

        {/* Far Right: Department Selector, Theme Toggle, Notification Bell, Profile Dropdown */}
        <div className="navbar-right">
          {/* Language / Department Selector */}
          <div ref={dropdownRef} className="navbar-dropdown-wrapper">
            <button
              onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
              className="navbar-branch-btn"
              title="Select Department / Language"
              aria-label="Department and Language Selector"
            >
              <span
                className="navbar-branch-dot"
                style={{
                  background: selectedBranch.color || '#6366f1'
                }}
              />
              <span className="navbar-branch-code">
                {selectedBranch.code}
              </span>
              <ChevronDown
                className={`navbar-chevron ${isBranchDropdownOpen ? 'open' : ''}`}
                color="#001f3f"
              />
            </button>

            {/* Dropdown Menu */}
            {isBranchDropdownOpen && (
              <div
                className="glass-panel"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '320px',
                  maxWidth: 'calc(100vw - 2rem)',
                  padding: '0.5rem',
                  zIndex: 200,
                  boxShadow: 'var(--shadow-lg)'
                }}
              >
                <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Switch Department / Language
                </div>
                {branches.map(branch => (
                  <button
                    key={branch.id}
                    onClick={() => handleSelectBranch(branch)}
                    title={branch.id === selectedBranchId ? 'Currently active department' : `Switch to ${branch.name} (HOD Re-authentication required)`}
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {branch.id !== selectedBranchId && (
                        <span title="Password required to switch" style={{ display: 'inline-flex', alignItems: 'center' }}>
                          <Lock size={12} color="#f43f5e" />
                        </span>
                      )}
                      <span className="badge badge-indigo" style={{ fontSize: '0.7rem' }}>{branch.code}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="navbar-icon-btn navbar-theme-btn"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun color="#b45309" /> : <Moon color="#001f3f" />}
          </button>

          {/* Notifications Trigger */}
          <button
            onClick={onOpenNotifications}
            className="navbar-icon-btn navbar-notif-btn"
            title="Notifications & Announcements"
            aria-label="Notifications"
          >
            <Bell color="#001f3f" />
            {unreadNotificationCount > 0 && (
              <span className="navbar-notif-badge">
                {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
              </span>
            )}
          </button>

          {/* Profile Dropdown */}
          <div
            onClick={() => setIsProfileModalOpen(true)}
            className="navbar-user-pill"
            title={`User: ${currentUser.name} (HOD) • Click to view profile or switch HOD`}
            aria-label="User Profile Dropdown"
          >
            <div className="navbar-user-avatar">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                />
              ) : (
                <UserIcon size={14} />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* User Switcher / Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Re-Authentication Modal for Department Workspace Switching */}
      <HODReauthModal
        isOpen={isReauthOpen}
        onClose={() => {
          setIsReauthOpen(false);
          setReauthTarget(null);
          setReauthBranch(null);
        }}
        targetUser={reauthTarget}
        targetDepartmentName={reauthBranch?.name}
        onAuthenticated={handleReauthSuccess}
      />
    </>
  );
};
