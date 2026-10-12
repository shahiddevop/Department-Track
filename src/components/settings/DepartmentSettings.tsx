import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  ShieldCheck, 
  Edit3,
  CheckCircle2,
  Lock,
  Users,
  UserCheck,
  UserX,
  Clock
} from 'lucide-react';
import { useDepartment } from '../../context/DepartmentContext';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { Branch, User as UserType } from '../../types';
import { authService } from '../../services/authService';

export const DepartmentSettings: React.FC = () => {
  const { 
    branches, 
    addBranch, 
    updateBranch, 
    selectedBranchId, 
    addToast 
  } = useDepartment();

  const { 
    currentUser, 
    canEditBranchDetails, 
    canAddBranch, 
    isSuperAdmin 
  } = useAuth();

  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  // Faculty management state (scoped to HOD's department, or all if Super Admin)
  const targetBranchId = isSuperAdmin ? undefined : selectedBranchId;
  const [pendingFaculty, setPendingFaculty] = useState<UserType[]>(() =>
    authService.getPendingFaculty(targetBranchId)
  );
  const [approvedFaculty, setApprovedFaculty] = useState<UserType[]>(() =>
    authService.getApprovedFaculty(targetBranchId)
  );

  useEffect(() => {
    const refresh = () => {
      setPendingFaculty(authService.getPendingFaculty(targetBranchId));
      setApprovedFaculty(authService.getApprovedFaculty(targetBranchId));
    };
    refresh();
    window.addEventListener('adt_faculty_updated', refresh);
    return () => window.removeEventListener('adt_faculty_updated', refresh);
  }, [targetBranchId]);

  const handleApproveFaculty = (faculty: UserType) => {
    const res = authService.approveFaculty(faculty.id, currentUser.name);
    if (res.success) {
      addToast(`Approved ${faculty.name}! They can now log in to the system.`, 'success');
      setPendingFaculty(authService.getPendingFaculty(targetBranchId));
      setApprovedFaculty(authService.getApprovedFaculty(targetBranchId));
    } else {
      addToast(res.error || 'Failed to approve faculty.', 'error');
    }
  };

  const handleRejectFaculty = (faculty: UserType) => {
    if (!window.confirm(`Are you sure you want to reject registration for ${faculty.name}?`)) {
      return;
    }
    const res = authService.rejectFaculty(faculty.id, currentUser.name);
    if (res.success) {
      addToast(`Registration request for ${faculty.name} has been rejected.`, 'info');
      setPendingFaculty(authService.getPendingFaculty(targetBranchId));
      setApprovedFaculty(authService.getApprovedFaculty(targetBranchId));
    } else {
      addToast(res.error || 'Failed to reject faculty.', 'error');
    }
  };

  // Form states for branch
  const [branchCode, setBranchCode] = useState('');
  const [branchName, setBranchName] = useState('');
  const [hodName, setHodName] = useState('');
  const [hodEmail, setHodEmail] = useState('');
  const [establishedYear, setEstablishedYear] = useState(2024);
  const [totalStudents, setTotalStudents] = useState(240);
  const [totalFaculty, setTotalFaculty] = useState(16);
  const [color, setColor] = useState('#6366f1');
  const [description, setDescription] = useState('');

  const handleOpenAddBranch = () => {
    setEditingBranch(null);
    setBranchCode('');
    setBranchName('');
    setHodName('');
    setHodEmail('');
    setEstablishedYear(2024);
    setTotalStudents(240);
    setTotalFaculty(16);
    setColor('#6366f1');
    setDescription('');
    setIsBranchModalOpen(true);
  };

  const handleOpenEditBranch = (b: Branch) => {
    if (!canEditBranchDetails(b.id, b)) {
      addToast(`Access Restricted: You are assigned to ${currentUser.branchName || 'your department'}. Only ${b.hodName} can edit ${b.name} details.`, 'error');
      return;
    }
    setEditingBranch(b);
    setBranchCode(b.code);
    setBranchName(b.name);
    setHodName(b.hodName);
    setHodEmail(b.hodEmail);
    setEstablishedYear(b.establishedYear);
    setTotalStudents(b.totalStudents);
    setTotalFaculty(b.totalFaculty);
    setColor(b.color);
    setDescription(b.description || '');
    setIsBranchModalOpen(true);
  };

  const handleBranchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchCode.trim() || !branchName.trim() || !hodName.trim()) return;

    const payload = {
      code: branchCode.toUpperCase(),
      name: branchName,
      hodName,
      hodEmail,
      establishedYear: Number(establishedYear),
      totalStudents: Number(totalStudents),
      totalFaculty: Number(totalFaculty),
      color,
      description
    };

    if (editingBranch) {
      if (!canEditBranchDetails(editingBranch.id, editingBranch)) {
        addToast('Access Denied: You do not have permission to modify this department.', 'error');
        return;
      }
      updateBranch(editingBranch.id, payload);
    } else {
      if (!canAddBranch) {
        addToast('Access Denied: Adding new academic departments is restricted to College Administrators.', 'error');
        return;
      }
      addBranch(payload);
    }
    setIsBranchModalOpen(false);
  };


  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Department Configuration & System Settings</h1>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Manage academic departments, configure branch credentials, and customize leadership attributes.
          </p>
        </div>

        <div>
          {isSuperAdmin ? (
            <button onClick={handleOpenAddBranch} className="btn btn-primary">
              <Plus size={16} /> Add New Branch
            </button>
          ) : (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.5rem 0.95rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(99, 102, 241, 0.12)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem'
              }}
            >
              <ShieldCheck size={16} color="var(--accent-indigo)" />
              <span>
                HOD Scope: <strong style={{ color: 'var(--accent-indigo)' }}>{currentUser.branchName || 'Assigned Department'}</strong>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Branch Management Section */}
      <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Active Academic Branches & Departments</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Configure departmental metadata, HOD designations, and student strengths
            </p>
          </div>
          <span className="badge badge-indigo">{branches.length} Branches Registered</span>
        </div>

        {/* Department Security & Access Scope Banner */}
        <div
          style={{
            padding: '0.9rem 1.15rem',
            borderRadius: 'var(--radius-md)',
            background: isSuperAdmin 
              ? 'rgba(16, 185, 129, 0.08)' 
              : 'rgba(99, 102, 241, 0.08)',
            border: `1px solid ${isSuperAdmin ? 'rgba(16, 185, 129, 0.25)' : 'rgba(99, 102, 241, 0.25)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem',
            fontSize: '0.85rem'
          }}
        >
          <ShieldCheck size={20} color={isSuperAdmin ? 'var(--accent-emerald)' : 'var(--accent-indigo)'} />
          <div style={{ flex: 1, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {isSuperAdmin ? (
              <>
                <strong style={{ color: 'var(--text-primary)' }}>Institution Administrator Mode:</strong> You have full configuration, editing, and branch creation privileges across all academic departments.
              </>
            ) : currentUser.role === 'admin' ? (
              <>
                <strong style={{ color: 'var(--text-primary)' }}>Department-Level Access Control Active:</strong> Logged in as <strong>{currentUser.name}</strong> (HOD - {currentUser.branchName}). You can edit only your own department's details (<strong>{currentUser.branchName}</strong>). Other departments are in View-Only mode.
              </>
            ) : (
              <>
                <strong style={{ color: 'var(--text-primary)' }}>Academic View Mode:</strong> Department configuration and metadata can only be modified by the designated Head of Department (HOD).
              </>
            )}
          </div>
        </div>

        <div className="cards-grid-auto">
          {branches.map(branch => {
            const isCurrent = branch.id === selectedBranchId;
            const canEditThis = canEditBranchDetails(branch.id, branch);

            return (
              <div
                key={branch.id}
                style={{
                  padding: '1.25rem',
                  background: canEditThis 
                    ? (isCurrent ? 'rgba(99, 102, 241, 0.12)' : 'rgba(99, 102, 241, 0.04)') 
                    : (isCurrent ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-input)'),
                  border: `1px solid ${canEditThis ? (isCurrent ? 'var(--accent-primary)' : 'rgba(99, 102, 241, 0.4)') : (isCurrent ? 'var(--accent-primary)' : 'var(--border-subtle)')}`,
                  borderRadius: 'var(--radius-md)',
                  position: 'relative',
                  boxShadow: canEditThis ? '0 0 16px rgba(99, 102, 241, 0.08)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: branch.color }} />
                    <span style={{ fontWeight: 800, fontSize: '1rem', fontFamily: 'var(--font-mono)', color: branch.color }}>
                      {branch.code}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    {isCurrent && (
                      <span className="badge badge-indigo" style={{ fontSize: '0.7rem' }}>
                        Active
                      </span>
                    )}
                    {canEditThis ? (
                      <span className="badge badge-emerald" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <CheckCircle2 size={11} /> Your Department
                      </span>
                    ) : (
                      <span className="badge" style={{ fontSize: '0.7rem', background: 'rgba(255, 255, 255, 0.06)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Lock size={10} /> View Only
                      </span>
                    )}
                  </div>
                </div>

                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  {branch.name}
                </h4>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
                  {branch.description}
                </p>

                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1rem' }}>
                  <div>Head of Dept: <strong>{branch.hodName}</strong> ({branch.hodEmail})</div>
                  <div>Established: <strong>{branch.establishedYear}</strong> • Students: <strong>{branch.totalStudents}</strong> • Faculty: <strong>{branch.totalFaculty}</strong></div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                  {canEditThis ? (
                    <button
                      onClick={() => handleOpenEditBranch(branch)}
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                    >
                      <Edit3 size={13} /> Edit Details
                    </button>
                  ) : (
                    <button
                      disabled
                      className="btn btn-secondary btn-sm"
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                        opacity: 0.5,
                        cursor: 'not-allowed',
                        background: 'transparent',
                        borderStyle: 'dashed'
                      }}
                      title={`Editing restricted: Only ${branch.hodName} can edit ${branch.name} details.`}
                    >
                      <Lock size={12} /> Restricted
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Faculty Verification & Roster Management Section */}
      <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={20} color="var(--accent-indigo)" />
              Faculty Members & Account Verifications
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Approve self-registered faculty profiles and manage departmental teaching personnel
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-amber">{pendingFaculty.length} Pending Approval</span>
            <span className="badge badge-emerald">{approvedFaculty.length} Approved Active</span>
          </div>
        </div>

        {/* Pending Verification Requests Sub-section */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f59e0b' }}>
            <Clock size={16} /> Pending Verification Requests ({pendingFaculty.length})
          </h4>

          {pendingFaculty.length === 0 ? (
            <div style={{ padding: '1.25rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No pending faculty verification requests for this department. All self-registered profiles are processed.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {pendingFaculty.map(fac => (
                <div
                  key={fac.id}
                  style={{
                    padding: '1rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(245, 158, 11, 0.06)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: '0.95rem' }}>{fac.name}</strong>
                      <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>
                        PENDING_VERIFICATION
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <span>✉️ {fac.email}</span>
                      <span>🏛️ Dept: <strong>{fac.branchName}</strong></span>
                      {fac.registeredAt && (
                        <span>📅 Registered: {new Date(fac.registeredAt).toLocaleString()}</span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleApproveFaculty(fac)}
                      className="btn btn-sm"
                      style={{
                        background: '#10b981',
                        color: '#fff',
                        border: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        padding: '0.4rem 0.85rem'
                      }}
                    >
                      <UserCheck size={14} /> Approve Profile
                    </button>
                    <button
                      onClick={() => handleRejectFaculty(fac)}
                      className="btn btn-secondary btn-sm"
                      style={{
                        color: '#ef4444',
                        borderColor: 'rgba(239, 68, 68, 0.3)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.8rem',
                        padding: '0.4rem 0.75rem'
                      }}
                    >
                      <UserX size={14} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Approved Registered Faculty Members Roster */}
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981' }}>
            <CheckCircle2 size={16} /> Approved Registered Faculty Roster ({approvedFaculty.length})
          </h4>

          {approvedFaculty.length === 0 ? (
            <div style={{ padding: '1.25rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No newly registered faculty profiles in this department yet.
            </div>
          ) : (
            <div className="cards-grid-auto">
              {approvedFaculty.map(fac => (
                <div
                  key={fac.id}
                  style={{
                    padding: '1rem',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <strong style={{ fontSize: '0.9rem' }}>{fac.name}</strong>
                    <span className="badge badge-emerald" style={{ fontSize: '0.68rem' }}>
                      APPROVED
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    <div>✉️ {fac.email}</div>
                    <div>💼 {fac.designation || 'Assistant Professor'}</div>
                    {fac.approvedBy && (
                      <div style={{ marginTop: '0.25rem', color: 'var(--text-muted)', fontSize: '0.74rem' }}>
                        Approved by: <strong>{fac.approvedBy}</strong>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Branch Modal */}
      <Modal
        isOpen={isBranchModalOpen}
        onClose={() => setIsBranchModalOpen(false)}
        title={editingBranch ? 'Edit Department Branch' : 'Add New Department / Branch'}
        subtitle="Configure department credentials, code, and leadership"
        icon={<Building2 size={20} />}
        maxWidth="600px"
      >
        <form onSubmit={handleBranchSubmit}>
          <div className="modal-body">
            <div className="form-grid-1-2">
              <div className="form-group">
                <label className="form-label">Branch Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MECH or AIDS"
                  className="form-input"
                  value={branchCode}
                  onChange={e => setBranchCode(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mechanical Engineering"
                  className="form-input"
                  value={branchName}
                  onChange={e => setBranchName(e.target.value)}
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Head of Department (HOD) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. K. Sharma"
                  className="form-input"
                  value={hodName}
                  onChange={e => setHodName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">HOD Email Address</label>
                <input
                  type="email"
                  placeholder="hod.dept@sjdc.edu"
                  className="form-input"
                  value={hodEmail}
                  onChange={e => setHodEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label">Est. Year</label>
                <input
                  type="number"
                  className="form-input"
                  value={establishedYear}
                  onChange={e => setEstablishedYear(Number(e.target.value))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Students</label>
                <input
                  type="number"
                  className="form-input"
                  value={totalStudents}
                  onChange={e => setTotalStudents(Number(e.target.value))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Faculty Count</label>
                <input
                  type="number"
                  className="form-input"
                  value={totalFaculty}
                  onChange={e => setTotalFaculty(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Department Description</label>
              <textarea
                className="form-textarea"
                placeholder="Brief department mission, specialized labs, and focal areas..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={() => setIsBranchModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingBranch ? 'Save Branch Details' : 'Create Branch'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
