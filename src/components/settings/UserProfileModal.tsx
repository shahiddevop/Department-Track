import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useDepartment } from '../../context/DepartmentContext';
import { User, UserRole } from '../../types';
import { authService, UserCredential } from '../../services/authService';
import { HODReauthModal } from '../auth/HODReauthModal';
import {
  ShieldCheck,
  GraduationCap,
  Users,
  Mail,
  User as UserIcon,
  Lock,
  KeyRound
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, allUsers, switchUserById } = useAuth();
  const { setSelectedBranchId, branches, setActiveTab, addToast } = useDepartment();

  const [reauthTarget, setReauthTarget] = useState<User | null>(null);
  const [isReauthOpen, setIsReauthOpen] = useState(false);

  // Filter to strictly HODs and Dean (all role === 'admin' or isSuperAdmin)
  const hodUsers = allUsers.filter(user => user.role === 'admin' || user.isSuperAdmin);

  const handleInitiateSwitch = (user: User) => {
    if (user.id === currentUser.id) {
      addToast('This account is already your active profile session.', 'info');
      return;
    }
    // Prevent seamless one-click switching: trigger secure re-authentication
    setReauthTarget(user);
    setIsReauthOpen(true);
  };

  const handleReauthSuccess = (authenticatedUser: User, _credential: UserCredential) => {
    switchUserById(authenticatedUser.id);
    authService.saveSession(authenticatedUser);

    if (authenticatedUser.branchId && authenticatedUser.branchId !== 'ALL') {
      const targetBranchId =
        authenticatedUser.branchId === 'branch-aids' ? 'branch-cs' :
          authenticatedUser.branchId === 'branch-ece' ? 'branch-ep' :
            authenticatedUser.branchId === 'branch-it' ? 'branch-mb' :
              authenticatedUser.branchId;
      const branchExists = branches.some(b => b.id === targetBranchId);
      if (branchExists) {
        setSelectedBranchId(targetBranchId);
      }
    }
    addToast(`Authentication verified! Switched active profile to ${authenticatedUser.name} (${authenticatedUser.branchName || 'Department HOD'})`, 'success');
    setIsReauthOpen(false);
    setReauthTarget(null);
    onClose();
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <ShieldCheck size={16} color="#f43f5e" />;
      case 'faculty':
        return <GraduationCap size={16} color="#818cf8" />;
      case 'student':
        return <Users size={16} color="#10b981" />;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Department HOD Accounts"
      subtitle="Strict Role-Based Access Control • Seamless one-click switching disabled. Re-authentication required."
      icon={<ShieldCheck size={20} />}
      maxWidth="620px"
    >
      <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
        {/* Active Profile Session Card */}
        <div
          className="glass-panel"
          style={{
            padding: '1rem',
            background: 'var(--bg-input)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            borderRadius: 'var(--radius-md)',
            flexWrap: 'wrap',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'rgba(99, 102, 241, 0.15)',
              border: '2px solid var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)',
              flexShrink: 0,
              overflow: 'hidden'
            }}
          >
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <UserIcon size={26} />
            )}
          </div>
          <div style={{ flex: '1 1 200px', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{currentUser.name}</h4>
              <span className={`badge ${currentUser.isSuperAdmin ? 'badge-amber' : 'badge-rose'}`}>
                {getRoleIcon(currentUser.role)}
                {currentUser.isSuperAdmin ? 'SUPER ADMIN' : 'HOD'}
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              {currentUser.designation} ({currentUser.branchName || (currentUser.branchId === 'branch-cse' ? 'English' : 'Academic Department')})
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
              {currentUser.email ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Mail size={12} /> {currentUser.email}
                </span>
              ) : null}
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                ● Active Session
              </span>
            </div>
          </div>
        </div>

        {/* HOD Profiles List */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <h5 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Department Head (HOD) Accounts:
              </h5>
              <span className="badge badge-amber" style={{ fontSize: '0.68rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <KeyRound size={11} /> RBAC Protected
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Password required to switch
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.55rem',
              maxHeight: '360px',
              overflowY: 'auto',
              paddingRight: '4px'
            }}
          >
            {hodUsers.map(user => {
              const isSelected = user.id === currentUser.id;
              const displayBranchName = user.branchName || (user.branchId === 'branch-cse' ? 'English' : '');

              return (
                <button
                  key={user.id}
                  onClick={() => handleInitiateSwitch(user)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 0.95rem',
                    background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-input)',
                    border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    color: 'var(--text-primary)',
                    textAlign: 'left',
                    transition: 'all var(--tr-fast)',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) e.currentTarget.style.borderColor = 'var(--accent-indigo)';
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: '1 1 180px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: 'rgba(99, 102, 241, 0.12)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent-primary)',
                        flexShrink: 0,
                        overflow: 'hidden'
                      }}
                    >
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <UserIcon size={20} />
                      )}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', overflowWrap: 'break-word' }}>
                        {user.designation} ({displayBranchName})
                      </div>
                      {user.qualification && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                          {user.qualification}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                    <span className={`badge ${user.isSuperAdmin ? 'badge-amber' : 'badge-rose'}`}>
                      {getRoleIcon(user.role)}
                      {user.isSuperAdmin ? 'SUPER ADMIN' : 'HOD'}
                    </span>
                    {isSelected ? (
                      <span className="badge badge-indigo" style={{ fontSize: '0.7rem' }}>
                        Active
                      </span>
                    ) : (
                      <span className="badge badge-rose" style={{ fontSize: '0.68rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Lock size={10} /> Authenticate
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <button
          onClick={() => {
            setActiveTab('profile');
            onClose();
          }}
          className="btn btn-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <UserIcon size={15} /> View Full Profile
        </button>
        <button onClick={onClose} className="btn btn-secondary">
          Close
        </button>
      </div>

      {/* Re-Authentication Modal for Protected HOD Profile Switching */}
      <HODReauthModal
        isOpen={isReauthOpen}
        onClose={() => {
          setIsReauthOpen(false);
          setReauthTarget(null);
        }}
        targetUser={reauthTarget}
        onAuthenticated={handleReauthSuccess}
      />
    </Modal>
  );
};
