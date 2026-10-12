import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Mail,
  ShieldCheck,
  GraduationCap,
  Users,
  CheckCircle2,
  Save,
  Edit3,
  MapPin,
  Upload,
  Trash2,
  Camera,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDepartment } from '../../context/DepartmentContext';
import { isSlotAssignedToUser } from '../../utils/facultyMatching';
import { Modal } from '../common/Modal';
import { storageService } from '../../services/storageService';
import { authService } from '../../services/authService';

export const UserProfileView: React.FC = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const { selectedBranch, timetable, addToast } = useDepartment();

  // Display State
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [qualification, setQualification] = useState(currentUser.qualification ?? 'M.A., M.Phil., Ph.D. in English Literature');
  const [designation, setDesignation] = useState(currentUser.designation);
  const [officeLocation, setOfficeLocation] = useState(currentUser.officeLocation ?? 'Faculty Block A, Cabin 204');
  const [bio, setBio] = useState(currentUser.bio ?? 'Specializing in Academic Curriculum Coordination, Literature, and Advanced Departmental Timetable Strategy.');
  const [avatar, setAvatar] = useState(currentUser.avatar || '');

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Password Modal Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  // Edit Modal Form State
  const [editName, setEditName] = useState(currentUser.name);
  const [editEmail, setEditEmail] = useState(currentUser.email);
  const [editQualification, setEditQualification] = useState(currentUser.qualification ?? 'M.A., M.Phil., Ph.D. in English Literature');
  const [editDesignation, setEditDesignation] = useState(currentUser.designation);
  const [editOfficeLocation, setEditOfficeLocation] = useState(currentUser.officeLocation ?? 'Faculty Block A, Cabin 204');
  const [editBio, setEditBio] = useState(currentUser.bio ?? 'Specializing in Academic Curriculum Coordination, Literature, and Advanced Departmental Timetable Strategy.');
  const [editAvatar, setEditAvatar] = useState(currentUser.avatar || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(currentUser.name);
    setEmail(currentUser.email);
    setQualification(currentUser.qualification ?? 'M.A., M.Phil., Ph.D. in English Literature');
    setDesignation(currentUser.designation);
    setOfficeLocation(currentUser.officeLocation ?? 'Faculty Block A, Cabin 204');
    setBio(currentUser.bio ?? 'Specializing in Academic Curriculum Coordination, Literature, and Advanced Departmental Timetable Strategy.');
    setAvatar(currentUser.avatar || '');
  }, [currentUser]);

  // Compute teaching workload for this specific user
  const userSlots = timetable.filter(slot => isSlotAssignedToUser(slot, currentUser));
  const uniqueSubjects = Array.from(new Set(userSlots.map(s => `${s.subjectCode} - ${s.subjectName}`)));
  const totalWeeklyClasses = userSlots.length;

  const handleOpenEditModal = () => {
    setEditName(currentUser.name);
    setEditEmail(currentUser.email);
    setEditQualification(currentUser.qualification ?? qualification ?? '');
    setEditDesignation(currentUser.designation ?? designation ?? '');
    setEditOfficeLocation(currentUser.officeLocation ?? officeLocation ?? 'Faculty Block A, Cabin 204');
    setEditBio(currentUser.bio ?? bio ?? 'Specializing in Academic Curriculum Coordination, Literature, and Advanced Departmental Timetable Strategy.');
    setEditAvatar(currentUser.avatar || avatar || '');
    setIsEditModalOpen(true);
  };

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Please select a valid image file (PNG, JPG, WEBP, etc.)', 'error');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      addToast('Image size exceeds 3MB. Please select a smaller photo.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setEditAvatar(result);
        addToast('Profile photo selected! Click Save to apply.', 'info');
      }
    };
    reader.onerror = () => {
      addToast('Failed to load image. Please try another file.', 'error');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfileModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      addToast('Full Name is a required field', 'error');
      return;
    }

    const updatedUser = {
      ...currentUser,
      name: editName.trim(),
      email: editEmail.trim(),
      qualification: editQualification.trim(),
      designation: editDesignation.trim(),
      officeLocation: editOfficeLocation.trim(),
      bio: editBio.trim(),
      avatar: editAvatar.trim()
    };

    // Immediately persist to storage and update context
    storageService.setCurrentUser(updatedUser);
    setCurrentUser(updatedUser);
    setName(updatedUser.name);
    setEmail(updatedUser.email);
    setQualification(updatedUser.qualification || '');
    setDesignation(updatedUser.designation);
    setOfficeLocation(updatedUser.officeLocation || '');
    setBio(updatedUser.bio || '');
    setAvatar(updatedUser.avatar);

    setIsEditModalOpen(false);
    addToast('Profile changes saved successfully!', 'success');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (!newPassword) {
      setPasswordError('Please enter a new password.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword === currentPassword) {
      setPasswordError('New password must differ from your current password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setIsPasswordLoading(true);
    await new Promise(r => setTimeout(r, 350));

    const result = authService.updatePassword(
      currentUser.email || currentUser.id,
      currentPassword,
      newPassword
    );

    if (result.success) {
      setPasswordSuccess('Password updated successfully!');
      addToast('Account password updated successfully!', 'success');
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordSuccess('');
      }, 700);
    } else {
      setPasswordError(result.error || 'Failed to update password.');
    }
    setIsPasswordLoading(false);
  };

  const getRoleBadge = (role: string) => {
    if (role === 'admin') {
      return (
        <span className="badge badge-rose" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <ShieldCheck size={14} /> Head of Department (HOD)
        </span>
      );
    }
    if (role === 'faculty') {
      return (
        <span className="badge badge-indigo" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <GraduationCap size={14} /> Faculty Instructor
        </span>
      );
    }
    return (
      <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
        <Users size={14} /> Student Coordinator
      </span>
    );
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>User Profile & Account</h1>
            <span className="badge badge-indigo">
              {currentUser.branchName || selectedBranch.code}
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Manage your personal instructor profile, contact details, and account credentials.
          </p>
        </div>

        <div className="no-print header-actions-row" style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleOpenEditModal}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            id="edit-profile-btn"
          >
            <Edit3 size={16} /> Edit Profile
          </button>
          <button
            onClick={() => {
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
              setPasswordError('');
              setPasswordSuccess('');
              setShowCurrentPass(false);
              setShowNewPass(false);
              setShowConfirmPass(false);
              setIsPasswordModalOpen(true);
            }}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            id="change-password-btn"
          >
            <KeyRound size={16} /> Change Password
          </button>
        </div>
      </div>

      {/* Hero Profile Card */}
      <div
        className="glass-panel"
        style={{
          padding: '1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 50%, rgba(236, 72, 153, 0.05) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.3)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <div
              id="hero-profile-avatar-container"
              style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.35) 100%)',
                border: '3px solid var(--accent-primary)',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-primary)',
                flexShrink: 0,
                overflow: 'hidden'
              }}
            >
              {(avatar || currentUser.avatar) ? (
                <img
                  id="hero-profile-avatar-img"
                  src={avatar || currentUser.avatar}
                  alt={name || currentUser.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <User size={42} />
              )}
            </div>
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: '#10b981',
                border: '2px solid var(--bg-surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Online Active Session"
            >
              <CheckCircle2 size={14} color="#fff" />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>{name}</h2>
              {getRoleBadge(currentUser.role)}
              {currentUser.isSuperAdmin && (
                <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>
                  Super Admin
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              {designation} • {currentUser.branchName || selectedBranch.name}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginTop: '0.5rem', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {email ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Mail size={13} color="var(--accent-indigo)" /> {email}
                </span>
              ) : null}
              {qualification && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <GraduationCap size={14} color="#10b981" /> {qualification}
                </span>
              )}
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <MapPin size={13} color="#f59e0b" /> {officeLocation}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats Badges */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div
            style={{
              background: 'var(--bg-input)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              textAlign: 'center',
              minWidth: '100px'
            }}
          >
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-indigo)' }}>
              {totalWeeklyClasses}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Weekly Classes</div>
          </div>

          <div
            style={{
              background: 'var(--bg-input)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              textAlign: 'center',
              minWidth: '100px'
            }}
          >
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>
              {uniqueSubjects.length}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Courses Taught</div>
          </div>

          <div
            style={{
              background: 'var(--bg-input)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              textAlign: 'center',
              minWidth: '100px'
            }}
          >
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f59e0b' }}>
              6
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Daily Periods</div>
          </div>
        </div>
      </div>



      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profile"
        subtitle="Update your instructor credentials, contact details, and departmental bio."
        icon={<Edit3 size={20} />}
        maxWidth="620px"
      >
        <form onSubmit={handleSaveProfileModal}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Profile Picture Upload & Preview */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                padding: '1rem',
                background: 'var(--bg-input)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                flexWrap: 'wrap'
              }}
            >
              <div style={{ position: 'relative' }}>
                <div
                  id="modal-avatar-preview-box"
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.35) 100%)',
                    border: '2.5px solid var(--accent-primary)',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    color: 'var(--accent-primary)',
                    flexShrink: 0
                  }}
                >
                  {editAvatar ? (
                    <img
                      id="modal-avatar-preview-img"
                      src={editAvatar}
                      alt="Profile Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <User size={40} />
                  )}
                </div>
                {editAvatar && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: '#10b981',
                      border: '2px solid var(--bg-surface)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Avatar loaded"
                  >
                    <CheckCircle2 size={13} color="#fff" />
                  </span>
                )}
              </div>

              <div style={{ flex: '1 1 220px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem', color: 'var(--text-primary)' }}>
                  Profile Picture
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: 1.4 }}>
                  Upload a photo to customize your avatar. Max file size: 3MB (PNG, JPG, or WEBP).
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="profile-picture-upload-input"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleAvatarFileUpload}
                  />
                  <button
                    type="button"
                    id="upload-avatar-btn"
                    className="btn btn-secondary"
                    style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera size={14} /> Choose Photo
                  </button>
                  {editAvatar && (
                    <button
                      type="button"
                      id="remove-avatar-btn"
                      className="btn"
                      style={{
                        fontSize: '0.82rem',
                        padding: '0.45rem 0.85rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: 'var(--accent-rose)',
                        border: '1px solid rgba(239, 68, 68, 0.25)'
                      }}
                      onClick={() => {
                        setEditAvatar('');
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                    >
                      <Trash2 size={14} /> Remove Photo
                    </button>
                  )}
                </div>

                {/* Preset Avatars for fast selection */}
                <div style={{ marginTop: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Or pick preset:</span>
                  {[
                    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
                  ].map((presetUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      id={`preset-avatar-${idx}`}
                      onClick={() => setEditAvatar(presetUrl)}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        padding: 0,
                        overflow: 'hidden',
                        border: editAvatar === presetUrl ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        background: 'transparent',
                        transition: 'transform 0.15s ease',
                        boxShadow: editAvatar === presetUrl ? '0 0 8px rgba(99, 102, 241, 0.5)' : 'none'
                      }}
                      title={`Select demo avatar ${idx + 1}`}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <img src={presetUrl} alt={`Preset ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-profile-name">Full Name *</label>
              <input
                id="edit-profile-name"
                type="text"
                required
                className="form-input"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                placeholder="e.g. Dr. P.Shahnaz"
              />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="edit-profile-email">Email Address</label>
                <input
                  id="edit-profile-email"
                  type="email"
                  className="form-input"
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  placeholder="name@sjdc.edu (Optional)"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-profile-qualification">Qualification Details</label>
                <input
                  id="edit-profile-qualification"
                  type="text"
                  className="form-input"
                  value={editQualification}
                  onChange={e => setEditQualification(e.target.value)}
                  placeholder="e.g. M.A., M.Phil., Ph.D. in English Literature"
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="edit-profile-designation">Academic Designation</label>
                <input
                  id="edit-profile-designation"
                  type="text"
                  className="form-input"
                  value={editDesignation}
                  onChange={e => setEditDesignation(e.target.value)}
                  placeholder="e.g. Head of Department & Professor"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-profile-office">Office / Cabin Location</label>
                <input
                  id="edit-profile-office"
                  type="text"
                  className="form-input"
                  value={editOfficeLocation}
                  onChange={e => setEditOfficeLocation(e.target.value)}
                  placeholder="Faculty Block A, Cabin 204"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-profile-bio">Bio & Specialization</label>
              <textarea
                id="edit-profile-bio"
                className="form-input"
                rows={3}
                value={editBio}
                onChange={e => setEditBio(e.target.value)}
                placeholder="Brief summary of research areas, teaching experience, and specializations..."
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              id="save-profile-btn"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Save size={16} /> Save Profile Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Change Account Password"
        subtitle={`Update security credentials for ${name} (${email || currentUser.id})`}
        icon={<KeyRound size={20} color="var(--accent-indigo)" />}
        maxWidth="500px"
      >
        <form onSubmit={handlePasswordSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            {passwordError && (
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
                  fontSize: '0.82rem'
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  color: 'var(--accent-emerald)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.82rem'
                }}
              >
                <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="current-profile-password">Current Password *</label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  color="var(--text-muted)"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                />
                <input
                  id="current-profile-password"
                  type={showCurrentPass ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingLeft: '38px', paddingRight: '40px' }}
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={e => { setCurrentPassword(e.target.value); setPasswordError(''); }}
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  tabIndex={-1}
                  aria-label={showCurrentPass ? 'Hide password' : 'Show password'}
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
                  {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="new-profile-password">New Password *</label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  color="var(--text-muted)"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                />
                <input
                  id="new-profile-password"
                  type={showNewPass ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingLeft: '38px', paddingRight: '40px' }}
                  placeholder="Min. 6 characters"
                  value={newPassword}
                  onChange={e => { setNewPassword(e.target.value); setPasswordError(''); }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  tabIndex={-1}
                  aria-label={showNewPass ? 'Hide password' : 'Show password'}
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
                  {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="confirm-profile-password">Confirm New Password *</label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  color="var(--text-muted)"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                />
                <input
                  id="confirm-profile-password"
                  type={showConfirmPass ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingLeft: '38px', paddingRight: '40px' }}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); setPasswordError(''); }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  tabIndex={-1}
                  aria-label={showConfirmPass ? 'Hide password' : 'Show password'}
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
                  {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div className="modal-footer" style={{ marginTop: '1.25rem' }}>
            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(false)}
              className="btn btn-secondary"
              disabled={isPasswordLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isPasswordLoading}
              id="submit-change-password-btn"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <KeyRound size={16} />
              {isPasswordLoading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
