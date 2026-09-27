import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  ShieldCheck, 
  GraduationCap, 
  Users, 
  CheckCircle2, 
  CalendarDays, 
  BookOpen, 
  Clock, 
  Sparkles, 
  Save, 
  Image, 
  MapPin, 
  Key,
  Layers,
  Award
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDepartment } from '../../context/DepartmentContext';
import { isSlotAssignedToUser } from '../../utils/facultyMatching';
import { UserProfileModal } from '../settings/UserProfileModal';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
];

export const UserProfileView: React.FC = () => {
  const { currentUser, setCurrentUser, allUsers, switchUserById } = useAuth();
  const { selectedBranch, timetable, addToast } = useDepartment();

  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone || '+91 98765 43210');
  const [designation, setDesignation] = useState(currentUser.designation);
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [officeLocation, setOfficeLocation] = useState('Faculty Block A, Cabin 204');
  const [bio, setBio] = useState('Specializing in Academic Curriculum Coordination, Literature, and Advanced Departmental Timetable Strategy.');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setName(currentUser.name);
    setEmail(currentUser.email);
    setPhone(currentUser.phone || '+91 98765 43210');
    setDesignation(currentUser.designation);
    setAvatar(currentUser.avatar);
  }, [currentUser]);

  // Compute teaching workload for this specific user
  const userSlots = timetable.filter(slot => isSlotAssignedToUser(slot, currentUser));
  const uniqueSubjects = Array.from(new Set(userSlots.map(s => `${s.subjectCode} - ${s.subjectName}`)));
  const totalWeeklyClasses = userSlots.length;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      addToast('Name and Email are required fields', 'error');
      return;
    }

    setCurrentUser({
      ...currentUser,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      designation: designation.trim(),
      avatar
    });

    addToast('Profile details updated successfully!', 'success');
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
            Manage your personal instructor profile, contact details, account credentials, and view departmental permissions.
          </p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn btn-secondary no-print"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Users size={16} /> Switch User Persona
        </button>
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
            <img
              src={avatar}
              alt={name}
              style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid var(--accent-primary)',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)'
              }}
            />
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
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Phone size={13} color="#10b981" /> {phone}
              </span>
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

      {/* Main Two-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        
        {/* Left Column: Personal Information Form */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
            <User size={18} color="var(--accent-indigo)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Personal & Contact Information</h3>
          </div>

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                required
                className="form-input"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Raisa Tahseen"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@college.edu"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Academic Designation</label>
                <input
                  type="text"
                  className="form-input"
                  value={designation}
                  onChange={e => setDesignation(e.target.value)}
                  placeholder="e.g. Head of Department"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Office / Cabin Location</label>
                <input
                  type="text"
                  className="form-input"
                  value={officeLocation}
                  onChange={e => setOfficeLocation(e.target.value)}
                  placeholder="Block B, Room 204"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Profile Avatar</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.65rem' }}>
                {PRESET_AVATARS.map((pUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatar(pUrl)}
                    style={{
                      padding: 0,
                      border: avatar === pUrl ? '2px solid var(--accent-primary)' : '2px solid transparent',
                      borderRadius: '50%',
                      background: 'none',
                      cursor: 'pointer',
                      transition: 'transform 0.15s ease'
                    }}
                  >
                    <img 
                      src={pUrl} 
                      alt={`Avatar option ${idx + 1}`} 
                      style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} 
                    />
                  </button>
                ))}
              </div>
              <input
                type="url"
                className="form-input"
                value={avatar}
                onChange={e => setAvatar(e.target.value)}
                placeholder="Or paste an image URL..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bio & Specialization</label>
              <textarea
                className="form-input"
                rows={3}
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Brief summary of research areas and teaching background..."
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <Save size={16} /> Save Profile Changes
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Roles, Permissions & Teaching Overview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Role Permissions Matrix */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <ShieldCheck size={18} color="var(--accent-indigo)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Role & Permissions Overview</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.75rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <CalendarDays size={15} color="var(--accent-indigo)" />
                  <span>Timetable & Schedule Management</span>
                </div>
                <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>Full Access</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.75rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <BookOpen size={15} color="#8b5cf6" />
                  <span>Daily Teaching Plans & Log Completion</span>
                </div>
                <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>Full Access</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.75rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <Building size={15} color="#06b6d4" />
                  <span>Room & Smart Lab Bookings</span>
                </div>
                <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>Authorized</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.75rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <Layers size={15} color="#f59e0b" />
                  <span>Department Configuration & Semesters</span>
                </div>
                <span className={`badge ${currentUser.role === 'admin' ? 'badge-emerald' : 'badge-indigo'}`} style={{ fontSize: '0.7rem' }}>
                  {currentUser.role === 'admin' ? 'HOD Manager' : 'Restricted'}
                </span>
              </div>
            </div>
          </div>

          {/* Current Teaching Allocation */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={18} color="#10b981" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Allocated Teaching Workload</h3>
              </div>
              <span className="badge badge-indigo">
                {userSlots.length} Classes
              </span>
            </div>

            {userSlots.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                No active timetable slots allocated to this account profile. Use the Timetable module to schedule classes.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {userSlots.slice(0, 4).map(slot => (
                  <div
                    key={slot.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      background: 'var(--bg-input)',
                      borderRadius: 'var(--radius-sm)',
                      borderLeft: `3px solid ${slot.color || 'var(--accent-indigo)'}`
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                        {slot.subjectCode} • {slot.subjectName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {slot.day} • {slot.startTime} - {slot.endTime} • Sem {slot.semester} ({slot.section})
                      </div>
                    </div>
                    <span className="badge badge-indigo" style={{ fontSize: '0.68rem' }}>
                      {slot.roomName}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Persona Switcher */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Demo Faculty Personas
              </span>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
              >
                All Users
              </button>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {allUsers.filter(u => u.role !== 'student' && u.id !== 'user-5').slice(0, 3).map(u => (
                <button
                  key={u.id}
                  onClick={() => switchUserById(u.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.35rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${u.id === currentUser.id ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                    background: u.id === currentUser.id ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: '0.78rem'
                  }}
                >
                  <img src={u.avatar} alt={u.name} style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }} />
                  <span>{u.name}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Persona Switcher Modal */}
      <UserProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
