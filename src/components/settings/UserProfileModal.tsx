import React from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useDepartment } from '../../context/DepartmentContext';
import { User, UserRole } from '../../types';
import { UserCheck, ShieldCheck, GraduationCap, Users, Mail, Phone, Building, User as UserIcon } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, allUsers, switchUserById } = useAuth();
  const { setSelectedBranchId, branches, setActiveTab } = useDepartment();

  const handleSelectUser = (user: User) => {
    switchUserById(user.id);
    if (user.branchId && user.branchId !== 'ALL') {
      const targetBranchId = 
        user.branchId === 'branch-aids' ? 'branch-cs' :
        user.branchId === 'branch-ece' ? 'branch-ep' :
        user.branchId === 'branch-it' ? 'branch-mb' :
        user.branchId;
      const branchExists = branches.some(b => b.id === targetBranchId);
      if (branchExists) {
        setSelectedBranchId(targetBranchId);
      }
    }
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

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'Department Head (Admin)';
      case 'faculty':
        return 'Faculty Member / Professor';
      case 'student':
        return 'Student Coordinator / CR';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="User Profile & Quick Role Switcher"
      subtitle="Select a demo user persona to test role-based access control and editing permissions"
      icon={<UserCheck size={20} />}
      maxWidth="620px"
    >
      <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Active Profile Banner */}
        <div 
          className="glass-panel"
          style={{
            padding: '1rem',
            background: 'var(--bg-input)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            borderRadius: 'var(--radius-md)',
            flexWrap: 'wrap'
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(99, 102, 241, 0.15)',
              border: '3px solid var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)',
              flexShrink: 0
            }}
          >
            <UserIcon size={28} />
          </div>
          <div style={{ flex: '1 1 200px', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h4 style={{ fontSize: '1.1rem' }}>{currentUser.name}</h4>
              <span className={`badge ${currentUser.role === 'admin' ? 'badge-rose' : currentUser.role === 'faculty' ? 'badge-indigo' : 'badge-emerald'}`}>
                {getRoleIcon(currentUser.role)}
                {getRoleLabel(currentUser.role)}
              </span>
            </div>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              {currentUser.designation} ({currentUser.branchName || (currentUser.branchId === 'branch-cse' ? 'English' : 'Academic Department')})
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Mail size={13} /> {currentUser.email}
              </span>
              {currentUser.qualification && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-primary)' }}>
                  <GraduationCap size={13} /> {currentUser.qualification}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Persona Switcher List */}
        <div>
          <h5 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontWeight: 600 }}>
            Switch Role / User Persona:
          </h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {allUsers.filter(user => user.role !== 'student' && user.id !== 'user-5').map(user => {
              const isSelected = user.id === currentUser.id;
              const displayBranchName = user.branchName || (user.branchId === 'branch-cse' ? 'English' : '');

              return (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
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
                        flexShrink: 0
                      }}
                    >
                      <UserIcon size={20} />
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
                    <span className={`badge ${user.role === 'admin' ? (user.isSuperAdmin ? 'badge-amber' : 'badge-rose') : user.role === 'faculty' ? 'badge-indigo' : 'badge-emerald'}`}>
                      {getRoleIcon(user.role)}
                      {user.isSuperAdmin ? 'SUPER ADMIN' : user.role === 'admin' ? 'HOD' : user.role.toUpperCase()}
                    </span>
                    {isSelected && (
                      <span className="badge badge-indigo" style={{ fontSize: '0.7rem' }}>
                        Active
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
        <button onClick={onClose} className="btn btn-primary">
          Done
        </button>
      </div>
    </Modal>
  );
};
