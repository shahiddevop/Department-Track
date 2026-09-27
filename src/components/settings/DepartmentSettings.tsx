import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  DownloadCloud, 
  UploadCloud, 
  RotateCcw, 
  ShieldCheck, 
  BookOpen, 
  Code, 
  Layers, 
  Sparkles,
  Edit3,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { useDepartment } from '../../context/DepartmentContext';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { Modal } from '../common/Modal';
import { Branch } from '../../types';

export const DepartmentSettings: React.FC = () => {
  const { 
    branches, 
    addBranch, 
    updateBranch, 
    selectedBranchId, 
    setSelectedBranchId, 
    resetData, 
    restoreData,
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

  // Full Department JSON Backup Download
  const handleDownloadBackup = () => {
    const jsonStr = storageService.exportFullBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AcadPulse_Full_Department_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('Department backup JSON exported successfully', 'success');
  };

  // File Upload Restore
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        restoreData(content);
      }
    };
    reader.readAsText(file);
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
            Manage academic engineering branches, backup & restore departmental database, and customize system attributes.
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
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
                  {!isCurrent && (
                    <button
                      onClick={() => setSelectedBranchId(branch.id)}
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1 }}
                    >
                      Switch to Branch
                    </button>
                  )}
                  {canEditThis ? (
                    <button
                      onClick={() => handleOpenEditBranch(branch)}
                      className="btn btn-primary btn-sm"
                    >
                      <Edit3 size={13} /> Edit Details
                    </button>
                  ) : (
                    <button
                      disabled
                      className="btn btn-secondary btn-sm"
                      style={{ opacity: 0.45, cursor: 'not-allowed', background: 'transparent', borderStyle: 'dashed' }}
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

      {/* Database Backup & Factory Reset */}
      <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.4rem' }}>
          Data Backup, Restore & Maintenance
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Export full JSON department archives, upload and restore system backups, or reset to original realistic demo data.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {/* Backup Download */}
          <div style={{ padding: '1.25rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <DownloadCloud size={18} color="var(--accent-indigo)" />
              JSON Full Backup
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem', marginBottom: '0.85rem' }}>
              Download a complete JSON database including timetables, lesson logs, events, rooms, and notifications.
            </p>
            <button onClick={handleDownloadBackup} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
              Download Backup File
            </button>
          </div>

          {/* Restore JSON */}
          <div style={{ padding: '1.25rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UploadCloud size={18} color="var(--accent-cyan)" />
              Restore from Backup
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem', marginBottom: '0.85rem' }}>
              Upload a previously exported JSON backup file to overwrite or restore department state.
            </p>
            <label className="btn btn-secondary btn-sm" style={{ width: '100%', cursor: 'pointer', textAlign: 'center' }}>
              Upload JSON File
              <input type="file" accept=".json" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>
          </div>

          {/* Factory Reset */}
          <div style={{ padding: '1.25rem', background: 'rgba(244, 63, 94, 0.06)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RotateCcw size={18} />
              Reset Demo Data
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem', marginBottom: '0.85rem' }}>
              Reset all local modifications and restore the default realistic demo dataset across all branches.
            </p>
            <button onClick={resetData} className="btn btn-danger btn-sm" style={{ width: '100%' }}>
              Reset to Factory Demo Data
            </button>
          </div>
        </div>
      </div>

      {/* Extensibility & Developer Guide */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
          <Code size={22} color="var(--accent-indigo)" />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Developer & Architecture Guide: Modifying & Extending</h3>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
          This web application is built with a modular component architecture and type-safe data pipelines. Follow these simple steps to extend features or add new pages:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', fontSize: '0.825rem' }}>
          <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <h5 style={{ fontWeight: 700, color: 'var(--accent-indigo)', marginBottom: '0.35rem' }}>1. Adding a New Page / Tab</h5>
            <p style={{ color: 'var(--text-secondary)' }}>
              Add a new tab key to <code>TabType</code> in <code>src/types/index.ts</code>, register its icon & label in <code>Sidebar.tsx</code>, and render its view component inside <code>App.tsx</code>.
            </p>
          </div>

          <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <h5 style={{ fontWeight: 700, color: 'var(--accent-emerald)', marginBottom: '0.35rem' }}>2. Adding New Fields or Models</h5>
            <p style={{ color: 'var(--text-secondary)' }}>
              Extend the TypeScript interfaces in <code>src/types/index.ts</code>, then update <code>DepartmentContext.tsx</code> for state handlers and <code>storageService.ts</code> for local caching.
            </p>
          </div>

          <div style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <h5 style={{ fontWeight: 700, color: 'var(--accent-amber)', marginBottom: '0.35rem' }}>3. Connecting Backend / Cloud API</h5>
            <p style={{ color: 'var(--text-secondary)' }}>
              Replace <code>localStorage</code> calls inside <code>src/services/storageService.ts</code> with <code>fetch()</code> or <code>axios</code> REST / GraphQL API endpoints to sync with Node.js/PostgreSQL/Supabase.
            </p>
          </div>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '1rem' }}>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr', gap: '1rem' }}>
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
                  placeholder="hod.dept@college.edu"
                  className="form-input"
                  value={hodEmail}
                  onChange={e => setHodEmail(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
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
