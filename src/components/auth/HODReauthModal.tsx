import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { User } from '../../types';
import { authService, UserCredential } from '../../services/authService';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound
} from 'lucide-react';

interface HODReauthModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: User | null;
  targetDepartmentName?: string;
  onAuthenticated: (authenticatedUser: User, credential: UserCredential) => void;
}

export const HODReauthModal: React.FC<HODReauthModalProps> = ({
  isOpen,
  onClose,
  targetUser,
  targetDepartmentName,
  onAuthenticated,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when target user changes or modal opens
  useEffect(() => {
    if (isOpen && targetUser) {
      setIdentifier('');
      setPassword('');
      setShowPassword(false);
      setError('');
    }
  }, [isOpen, targetUser]);

  if (!targetUser) return null;

  const departmentLabel =
    targetDepartmentName ||
    targetUser.branchName ||
    (targetUser.branchId === 'branch-cse' ? 'English' : 'Academic Department');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim()) {
      setError('Please enter the HOD User ID or Email address.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter the HOD password.');
      return;
    }

    setIsLoading(true);

    try {
      const result = authService.verifyHODCredentials(targetUser, identifier, password);

      if (!result.success) {
        setError(result.error || 'Authentication failed. Access denied.');
        setIsLoading(false);
        return;
      }

      if (result.credential) {
        onAuthenticated(targetUser, result.credential);
        onClose();
      }
    } catch {
      setError('An error occurred during verification. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Secure HOD Authentication"
      subtitle="Strict Role-Based Access Control • Re-authentication required to switch department workspaces"
      icon={<ShieldAlert size={20} color="#f43f5e" />}
      maxWidth="540px"
    >
      <form onSubmit={handleSubmit}>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          {/* RBAC Notice Banner */}
          <div
            style={{
              padding: '0.75rem 0.95rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(244, 63, 94, 0.08)',
              border: '1px solid rgba(244, 63, 94, 0.25)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.65rem',
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.45
            }}
          >
            <KeyRound size={17} color="#f43f5e" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <span style={{ fontWeight: 700, color: '#f43f5e' }}>Protected Switch Attempt:</span>{' '}
              One-click switching is disabled to prevent unauthorized cross-department changes. Please provide credentials for this specific HOD to proceed.
            </div>
          </div>

          {/* Target HOD Profile Summary Card */}
          <div
            className="glass-panel"
            style={{
              padding: '0.9rem 1rem',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem'
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
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
              {targetUser.avatar ? (
                <img
                  src={targetUser.avatar}
                  alt={targetUser.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <UserIcon size={22} />
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  {targetUser.name}
                </span>
                <span className="badge badge-rose" style={{ fontSize: '0.68rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <ShieldCheck size={11} /> Target HOD
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                {departmentLabel} • {targetUser.designation}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                ID / Email: <span style={{ color: 'var(--accent-indigo)' }}>{targetUser.email || targetUser.id}</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: 'var(--accent-rose)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.82rem',
                lineHeight: 1.35
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* User ID / Email Input */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="reauth-hod-identifier" style={{ fontSize: '0.82rem' }}>
              Target HOD User ID or Email *
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              />
              <input
                id="reauth-hod-identifier"
                type="text"
                className="form-input"
                style={{ paddingLeft: '38px', fontSize: '0.88rem' }}
                placeholder={`Enter ${targetUser.email || targetUser.name + "'s email"}`}
                value={identifier}
                onChange={e => {
                  setIdentifier(e.target.value);
                  if (error) setError('');
                }}
                autoFocus
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="reauth-hod-password" style={{ fontSize: '0.82rem' }}>
              Target HOD Password *
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              />
              <input
                id="reauth-hod-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                style={{ paddingLeft: '38px', paddingRight: '40px', fontSize: '0.88rem' }}
                placeholder="Enter password (e.g. Admin@123)"
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
            id="reauth-verify-btn"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <ShieldCheck size={16} />
            {isLoading ? 'Verifying...' : 'Authorize & Switch'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
