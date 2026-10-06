import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  GraduationCap, 
  Users, 
  CheckCircle2, 
  Save, 
  Edit3, 
  MapPin
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDepartment } from '../../context/DepartmentContext';
import { isSlotAssignedToUser } from '../../utils/facultyMatching';
import { UserProfileModal } from '../settings/UserProfileModal';
import { Modal } from '../common/Modal';
import { storageService } from '../../services/storageService';

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

  // Modals
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Edit Modal Form State
  const [editName, setEditName] = useState(currentUser.name);
  const [editEmail, setEditEmail] = useState(currentUser.email);
  const [editQualification, setEditQualification] = useState(currentUser.qualification ?? 'M.A., M.Phil., Ph.D. in English Literature');
  const [editDesignation, setEditDesignation] = useState(currentUser.designation);
  const [editOfficeLocation, setEditOfficeLocation] = useState(currentUser.officeLocation ?? 'Faculty Block A, Cabin 204');
  const [editBio, setEditBio] = useState(currentUser.bio ?? 'Specializing in Academic Curriculum Coordination, Literature, and Advanced Departmental Timetable Strategy.');

  useEffect(() => {
    setName(currentUser.name);
    setEmail(currentUser.email);
    setQualification(currentUser.qualification ?? 'M.A., M.Phil., Ph.D. in English Literature');
    setDesignation(currentUser.designation);
    setOfficeLocation(currentUser.officeLocation ?? 'Faculty Block A, Cabin 204');
    setBio(currentUser.bio ?? 'Specializing in Academic Curriculum Coordination, Literature, and Advanced Departmental Timetable Strategy.');
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
    setIsEditModalOpen(true);
  };

  const handleSaveProfileModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editEmail.trim()) {
      addToast('Full Name and Email are required fields', 'error');
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
      avatar: ''
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

    setIsEditModalOpen(false);
    addToast('Profile changes saved successfully!', 'success');
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
            onClick={() => setIsPersonaModalOpen(true)}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Users size={16} /> Switch User Persona
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
                flexShrink: 0
              }}
            >
              <User size={42} />
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
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Mail size={13} color="var(--accent-indigo)" /> {email}
              </span>
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
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                <label className="form-label" htmlFor="edit-profile-email">Email Address *</label>
                <input
                  id="edit-profile-email"
                  type="email"
                  required
                  className="form-input"
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  placeholder="name@gmail.com"
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

      {/* Persona Switcher Modal */}
      <UserProfileModal
        isOpen={isPersonaModalOpen}
        onClose={() => setIsPersonaModalOpen(false)}
      />
    </div>
  );
};
