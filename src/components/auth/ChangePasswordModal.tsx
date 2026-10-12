import React, { useState, useCallback } from 'react';
import { authService } from '../../services/authService';
import './LoginPage.css';

interface ChangePasswordModalProps {
  email: string;
  onPasswordChanged: () => void;
  onSkip?: () => void;
}

const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const AlertIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  email,
  onPasswordChanged,
  onSkip,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword) { setError('Please enter your current password.'); return; }
    if (!newPassword) { setError('Please enter a new password.'); return; }
    if (newPassword.length < 6) { setError('New password must be at least 6 characters.'); return; }
    if (newPassword === currentPassword) { setError('New password must differ from the current one.'); return; }
    if (newPassword !== confirmPassword) { setError('New passwords do not match.'); return; }

    setIsLoading(true);
    await new Promise(r => setTimeout(r, 500));

    const result = authService.updatePassword(email, currentPassword, newPassword);

    if (result.success) {
      setSuccess('Password updated successfully!');
      setTimeout(() => onPasswordChanged(), 800);
    } else {
      setError(result.error || 'Failed to update password.');
    }

    setIsLoading(false);
  }, [currentPassword, newPassword, confirmPassword, email, onPasswordChanged]);

  return (
    <div className="login-password-modal-overlay">
      <div className="login-password-modal">
        <h3>🔐 Update Your Password</h3>
        <p>
          You're signed in with a temporary password. Please set a new secure password to continue.
        </p>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="login-error" style={{ marginBottom: 16 }}>
              <span className="login-error-icon"><AlertIcon /></span>
              <span className="login-error-text">{error}</span>
            </div>
          )}
          {success && (
            <div className="login-success" style={{ marginBottom: 16 }}>
              <span className="login-success-icon"><CheckIcon /></span>
              <span className="login-success-text">{success}</span>
            </div>
          )}

          <div className="login-field">
            <label className="login-field-label">Current Password</label>
            <div className="login-field-input-wrapper">
              <span className="login-field-icon"><LockIcon /></span>
              <input
                type={showCurrent ? 'text' : 'password'}
                placeholder="Enter current password"
                value={currentPassword}
                onChange={e => { setCurrentPassword(e.target.value); setError(''); }}
                disabled={isLoading}
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowCurrent(!showCurrent)}
                tabIndex={-1}
              >
                {showCurrent ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <div className="login-field">
            <label className="login-field-label">New Password</label>
            <div className="login-field-input-wrapper">
              <span className="login-field-icon"><LockIcon /></span>
              <input
                type={showNew ? 'text' : 'password'}
                placeholder="Create new password (min. 6 chars)"
                value={newPassword}
                onChange={e => { setNewPassword(e.target.value); setError(''); }}
                disabled={isLoading}
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowNew(!showNew)}
                tabIndex={-1}
              >
                {showNew ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <div className="login-field">
            <label className="login-field-label">Confirm New Password</label>
            <div className="login-field-input-wrapper">
              <span className="login-field-icon"><LockIcon /></span>
              <input
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="login-submit-btn"
            disabled={isLoading}
            style={{ marginTop: 8 }}
          >
            <span>
              {isLoading ? <div className="login-spinner" /> : null}
              {isLoading ? 'Updating...' : 'Update Password'}
            </span>
          </button>

          {onSkip && (
            <button
              type="button"
              className="login-skip-btn"
              onClick={onSkip}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="13 17 18 12 13 7" />
                <polyline points="6 17 11 12 6 7" />
              </svg>
              Skip for now
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
