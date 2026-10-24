import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Sun, Moon, Clock } from 'lucide-react';
import { User } from '../../types';
import { authService, FacultyRegistration } from '../../services/authService';
import { storageService } from '../../services/storageService';
import { INITIAL_USERS, INITIAL_BRANCHES } from '../../services/mockData';
import { Logo } from '../common/Logo';
import './LoginPage.css';

// ─── Types ──────────────────────────────────────────────────────
type RoleTab = 'admin' | 'faculty';
type FormTab = 'signin' | 'register';

interface LoginPageProps {
  onLoginSuccess: (user: User, mustChangePassword: boolean) => void;
}

// ─── Icons ──────────────────────────────────────────────────────
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

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

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);



const BuildingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <path d="M9 22v-4h6v4" />
    <path d="M8 6h.01" /><path d="M16 6h.01" />
    <path d="M12 6h.01" /><path d="M12 10h.01" />
    <path d="M12 14h.01" /><path d="M16 10h.01" />
    <path d="M16 14h.01" /><path d="M8 10h.01" />
    <path d="M8 14h.01" />
  </svg>
);

const InfoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const GraduationIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);

// ─── Helper: get initials ───────────────────────────────────────
const getInitials = (name: string): string => {
  const parts = name.split(' ').filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// ─── Component ──────────────────────────────────────────────────
export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => storageService.getTheme());

  useEffect(() => {
    storageService.setTheme(theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // State
  const [roleTab, setRoleTab] = useState<RoleTab>('admin');
  const [formTab, setFormTab] = useState<FormTab>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Registration fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regQualification, setRegQualification] = useState('');
  const [regBranchId, setRegBranchId] = useState('');
  const [registrationNotice, setRegistrationNotice] = useState<{
    name: string;
    email: string;
    departmentName: string;
  } | null>(null);

  // Verified provisioned accounts for the Quick Select list
  const [provisionedHods, setProvisionedHods] = useState<User[]>([]);

  useEffect(() => {
    let active = true;
    authService.getProvisionedAccounts().then(accounts => {
      if (active && accounts.length > 0) {
        setProvisionedHods(accounts);
      }
    });
    return () => { active = false; };
  }, []);

  // HOD/Admin accounts for the preview list fallback
  const hodAdmins = useMemo(() =>
    INITIAL_USERS.filter(u => u.role === 'admin'),
    []
  );

  // Reset form on tab switch
  const switchRoleTab = useCallback((tab: RoleTab) => {
    setRoleTab(tab);
    setFormTab('signin');
    setEmail('');
    setPassword('');
    setError('');
    setSuccess('');
    setRegistrationNotice(null);
  }, []);

  const switchFormTab = useCallback((tab: FormTab) => {
    setFormTab(tab);
    setError('');
    setSuccess('');
    setRegistrationNotice(null);
  }, []);

  // Fill email from HOD list click (never fills password or bypasses authentication)
  const handleHodClick = useCallback((hodEmail: string) => {
    setEmail(hodEmail);
    setPassword('');
    setError('');
  }, []);

  // ─── Login Handler ───────────────────────────────────
  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) { setError('Please enter your email address.'); return; }
    if (!password.trim()) { setError('Please enter your password.'); return; }

    setIsLoading(true);

    // Small artificial delay for UX
    await new Promise(r => setTimeout(r, 600));

    const result = await authService.login(email, password, roleTab);

    if (result.success && result.user) {
      setSuccess('Login successful! Redirecting...');
      setTimeout(() => {
        onLoginSuccess(result.user!, false);
      }, 500);
    } else {
      setError(result.error || 'Login failed. Please try again.');
    }

    setIsLoading(false);
  }, [email, password, roleTab, onLoginSuccess]);

  // ─── Registration Handler ────────────────────────────
  const handleRegister = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setRegistrationNotice(null);

    const trimmedName = regName.trim();
    const trimmedEmail = regEmail.trim();

    if (!trimmedName) { setError('Please enter your full name.'); return; }
    if (!trimmedEmail) { setError('Please enter your institutional email address.'); return; }
    
    // Strict institutional domain validation (@sjdc.edu only)
    if (!trimmedEmail.toLowerCase().endsWith('@sjdc.edu')) {
      setError('Only institutional email addresses ending with @sjdc.edu are permitted for faculty registration.');
      return;
    }

    if (!regBranchId) { setError('Please select your department from the dropdown.'); return; }
    if (!regPassword.trim()) { setError('Please create a password.'); return; }
    if (regPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (regPassword !== regConfirmPassword) { setError('Passwords do not match.'); return; }

    setIsLoading(true);

    await new Promise(r => setTimeout(r, 600));

    const registration: FacultyRegistration = {
      name: trimmedName,
      email: trimmedEmail,
      password: regPassword,
      phone: regPhone,
      designation: 'Assistant Professor',
      qualification: regQualification,
      branchId: regBranchId,
    };

    const result = await authService.registerFaculty(registration);

    if (result.success && result.user) {
      const selectedDept = INITIAL_BRANCHES.find(b => b.id === regBranchId)?.name || 'Department';
      setRegistrationNotice({
        name: trimmedName,
        email: trimmedEmail,
        departmentName: selectedDept,
      });
      // Reset form inputs
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setRegConfirmPassword('');
      setRegBranchId('');
      setRegPhone('');
      setRegQualification('');
    } else {
      setError(result.error || 'Registration failed. Please try again.');
    }

    setIsLoading(false);
  }, [regName, regEmail, regPassword, regConfirmPassword, regPhone, regQualification, regBranchId]);


  // ─── Render ──────────────────────────────────────────
  return (
    <div className="login-page">
      {/* Theme Toggle Button */}
      <button
        type="button"
        className="login-theme-toggle"
        onClick={toggleTheme}
        title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        aria-label="Toggle Theme"
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        <span className="login-theme-toggle-text">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
      </button>

      {/* Floating particles */}
      <div className="login-particles">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="login-particle" />
        ))}
      </div>

      <div className="login-card">
        {/* ── Branding ────────────────────────────────── */}
        <div className="login-branding">
          <div className="login-logo-wrapper">
            <Logo size={62} variant="badge" />
          </div>
          <h1 className="login-title">ADT</h1>
          <p className="login-subtitle">Academic Department Tracker</p>
        </div>

        {/* ── Role Switcher ───────────────────────────── */}
        <div className="login-role-switcher">
          <button
            className={`login-role-tab ${roleTab === 'admin' ? 'active' : ''}`}
            onClick={() => switchRoleTab('admin')}
            type="button"
          >
            <ShieldIcon /> HOD / Admin
          </button>
          <button
            className={`login-role-tab ${roleTab === 'faculty' ? 'active' : ''}`}
            onClick={() => switchRoleTab('faculty')}
            type="button"
          >
            <UsersIcon /> Faculty
          </button>
        </div>

        {/* ── Admin Tab Content ───────────────────────── */}
        {roleTab === 'admin' && (
          <div className="login-fade-enter" key="admin-form">
            <div className="login-info-badge">
              <InfoIcon />
              Testing Password: <strong style={{ marginLeft: 4 }}>Admin@123</strong>
            </div>

            <form className="login-form" onSubmit={handleLogin}>
              {error && (
                <div className="login-error">
                  <span className="login-error-icon"><AlertIcon /></span>
                  <span className="login-error-text">{error}</span>
                </div>
              )}
              {success && (
                <div className="login-success">
                  <span className="login-success-icon"><CheckIcon /></span>
                  <span className="login-success-text">{success}</span>
                </div>
              )}

              <div className="login-field">
                <label className="login-field-label">Email Address</label>
                <div className="login-field-input-wrapper">
                  <span className="login-field-icon"><MailIcon /></span>
                  <input
                    type="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    autoComplete="email"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="login-field">
                <label className="login-field-label">Password</label>
                <div className="login-field-input-wrapper">
                  <span className="login-field-icon"><LockIcon /></span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    autoComplete="current-password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="login-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="login-submit-btn"
                disabled={isLoading}
              >
                <span>
                  {isLoading ? <div className="login-spinner" /> : null}
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </span>
              </button>
            </form>

            {/* HOD Quick Select */}
            <div className="login-hod-preview" style={{ marginTop: 20 }}>
              <div className="login-hod-preview-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ShieldIcon />
                  Quick Select — Configured Accounts
                </span>
                <span style={{
                  fontSize: '0.72rem',
                  color: '#10b981',
                  fontWeight: 600,
                  background: 'rgba(16, 185, 129, 0.1)',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <CheckIcon /> Verified Firebase Identities
                </span>
              </div>
              <p style={{ fontSize: '0.73rem', color: 'var(--text-secondary, #94a3b8)', margin: '4px 0 10px 0' }}>
                Select an account to pre-fill email. Password entry is mandatory for authentication.
              </p>
              <div className="login-hod-list">
                {(provisionedHods.length > 0 ? provisionedHods : hodAdmins).map(hod => (
                  <div
                    key={hod.uid || hod.id}
                    className="login-hod-item"
                    onClick={() => handleHodClick(hod.email)}
                    title={`${hod.name} (${hod.branchName || 'Department'})\nClick to pre-fill email (Password required)`}
                  >
                    <div className="login-hod-avatar">{getInitials(hod.name)}</div>
                    <span className="login-hod-name">{hod.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Faculty Tab Content ─────────────────────── */}
        {roleTab === 'faculty' && (
          <div className="login-fade-enter" key="faculty-form">
            {/* Sign In / Register sub-tabs */}
            <div className="login-form-tabs">
              <button
                className={`login-form-tab ${formTab === 'signin' ? 'active' : ''}`}
                onClick={() => switchFormTab('signin')}
                type="button"
              >
                Sign In
              </button>
              <button
                className={`login-form-tab ${formTab === 'register' ? 'active' : ''}`}
                onClick={() => switchFormTab('register')}
                type="button"
              >
                Register
              </button>
            </div>

            {/* Faculty Sign In */}
            {formTab === 'signin' && (
              <form className="login-form login-fade-enter" key="faculty-signin" onSubmit={handleLogin}>
                {error && (
                  <div
                    className="login-error"
                    style={error.includes('pending verification') ? {
                      borderColor: 'rgba(245, 158, 11, 0.4)',
                      background: 'rgba(245, 158, 11, 0.12)'
                    } : undefined}
                  >
                    <span
                      className="login-error-icon"
                      style={error.includes('pending verification') ? { color: '#f59e0b' } : undefined}
                    >
                      {error.includes('pending verification') ? <Clock size={16} /> : <AlertIcon />}
                    </span>
                    <span
                      className="login-error-text"
                      style={error.includes('pending verification') ? { color: '#fbbf24' } : undefined}
                    >
                      {error}
                    </span>
                  </div>
                )}
                {success && (
                  <div className="login-success">
                    <span className="login-success-icon"><CheckIcon /></span>
                    <span className="login-success-text">{success}</span>
                  </div>
                )}

                <div className="login-field">
                  <label className="login-field-label">Email Address</label>
                  <div className="login-field-input-wrapper">
                    <span className="login-field-icon"><MailIcon /></span>
                    <input
                      type="email"
                      placeholder="Enter your faculty email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError(''); }}
                      autoComplete="email"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="login-field">
                  <label className="login-field-label">Password</label>
                  <div className="login-field-input-wrapper">
                    <span className="login-field-icon"><LockIcon /></span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError(''); }}
                      autoComplete="current-password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="login-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="login-submit-btn"
                  disabled={isLoading}
                >
                  <span>
                    {isLoading ? <div className="login-spinner" /> : null}
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </span>
                </button>
              </form>
            )}

            {/* Faculty Registration Pending Notice */}
            {formTab === 'register' && registrationNotice && (
              <div className="login-pending-card login-fade-enter" key="registration-pending-notice">
                <div className="login-pending-icon-wrapper">
                  <Clock size={32} />
                </div>
                <h3 className="login-pending-title">Account Created</h3>
                <p className="login-pending-desc">
                  Your profile has been created with status: <br />
                  <strong style={{ color: '#f59e0b', fontSize: '0.95rem' }}>STATUS: PENDING_VERIFICATION</strong>
                </p>

                <div className="login-pending-details">
                  <div><span>Faculty Name:</span> <strong>{registrationNotice.name}</strong></div>
                  <div><span>Institutional Email:</span> <strong>{registrationNotice.email}</strong></div>
                  <div><span>Department:</span> <strong>{registrationNotice.departmentName}</strong></div>
                  <div><span>Verification State:</span> <span className="login-badge-amber">Awaiting HOD Approval</span></div>
                </div>

                <p className="login-pending-instruction">
                  You cannot log in until the Department Admin / HOD for <strong>{registrationNotice.departmentName}</strong> approves your profile from their dashboard.
                </p>

                <button
                  type="button"
                  className="login-submit-btn"
                  onClick={() => {
                    setEmail(registrationNotice.email);
                    setRegistrationNotice(null);
                    setFormTab('signin');
                  }}
                >
                  <span>Go to Sign In</span>
                </button>
              </div>
            )}

            {/* Faculty Registration Form */}
            {formTab === 'register' && !registrationNotice && (
              <form className="login-form login-fade-enter" key="faculty-register" onSubmit={handleRegister}>
                {error && (
                  <div className="login-error">
                    <span className="login-error-icon"><AlertIcon /></span>
                    <span className="login-error-text">{error}</span>
                  </div>
                )}
                {success && (
                  <div className="login-success">
                    <span className="login-success-icon"><CheckIcon /></span>
                    <span className="login-success-text">{success}</span>
                  </div>
                )}

                <div className="login-field">
                  <label className="login-field-label">Full Name</label>
                  <div className="login-field-input-wrapper">
                    <span className="login-field-icon"><UserIcon /></span>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Rajesh Kumar"
                      value={regName}
                      onChange={e => { setRegName(e.target.value); setError(''); }}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="login-field">
                  <label className="login-field-label">Institutional Email (@sjdc.edu)</label>
                  <div className="login-field-input-wrapper">
                    <span className="login-field-icon"><MailIcon /></span>
                    <input
                      type="email"
                      placeholder="username@sjdc.edu"
                      value={regEmail}
                      onChange={e => { setRegEmail(e.target.value); setError(''); }}
                      disabled={isLoading}
                    />
                  </div>
                  <span style={{ fontSize: '0.73rem', color: 'var(--text-secondary, #94a3b8)', marginTop: '0.3rem', display: 'block' }}>
                    * Institutional validation required: must end with <strong>@sjdc.edu</strong>
                  </span>
                </div>

                <div className="login-field">
                  <label className="login-field-label">Department</label>
                  <div className="login-field-input-wrapper">
                    <span className="login-field-icon"><BuildingIcon /></span>
                    <select
                      value={regBranchId}
                      onChange={e => { setRegBranchId(e.target.value); setError(''); }}
                      disabled={isLoading}
                    >
                      <option value="">Select Department</option>
                      {INITIAL_BRANCHES.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  <span style={{ fontSize: '0.73rem', color: 'var(--text-secondary, #94a3b8)', marginTop: '0.3rem', display: 'block' }}>
                    * Approval request will be routed to this Department's HOD
                  </span>
                </div>

                <div className="login-field">
                  <label className="login-field-label">Password</label>
                  <div className="login-field-input-wrapper">
                    <span className="login-field-icon"><LockIcon /></span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password (min. 6 chars)"
                      value={regPassword}
                      onChange={e => { setRegPassword(e.target.value); setError(''); }}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="login-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                <div className="login-field">
                  <label className="login-field-label">Confirm Password</label>
                  <div className="login-field-input-wrapper">
                    <span className="login-field-icon"><LockIcon /></span>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Re-enter your password"
                      value={regConfirmPassword}
                      onChange={e => { setRegConfirmPassword(e.target.value); setError(''); }}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="login-password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="login-submit-btn"
                  disabled={isLoading}
                >
                  <span>
                    {isLoading ? <div className="login-spinner" /> : null}
                    {isLoading ? 'Submitting Registration...' : 'Register for HOD Approval'}
                  </span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* ── Footer ──────────────────────────────────── */}
        <div className="login-footer">
          <p className="login-footer-text">
            Academic Department Tracker • Secure Portal
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
