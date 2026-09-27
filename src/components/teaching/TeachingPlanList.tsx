import React, { useState } from 'react';
import { 
  BookOpenCheck, 
  Plus, 
  Download, 
  Search, 
  Calendar, 
  Clock, 
  Users, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  FileSpreadsheet,
  Layers,
  Sparkles,
  Lock
} from 'lucide-react';
import { useDepartment } from '../../context/DepartmentContext';
import { useAuth } from '../../context/AuthContext';
import { exportService } from '../../services/exportService';
import { DailyTopicLog, TopicStatus, SubjectProgress } from '../../types';
import { TopicLogModal } from './TopicLogModal';
import { SyllabusProgress } from './SyllabusProgress';
import { SubjectModal } from './SubjectModal';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const getDayName = (dateStr?: string): string => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { weekday: 'long' });
  }
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', { weekday: 'long' });
};

export const TeachingPlanList: React.FC = () => {
  const { 
    topicLogs, 
    selectedBranch, 
    selectedBranchId, 
    deleteTopicLog,
    subjectsProgress,
    updateSubject,
    deleteSubject
  } = useDepartment();

  const { canEditBranchContent } = useAuth();
  const canLogTopics = canEditBranchContent(selectedBranchId);

  // Filters State
  const [selectedSemester, setSelectedSemester] = useState<number | 'ALL'>('ALL');
  const [facultyFilter, setFacultyFilter] = useState<string>('ALL');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedDay, setSelectedDay] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<DailyTopicLog | null>(null);

  // Subject Modal State
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectProgress | null>(null);

  const handleEditSubject = (sub: SubjectProgress) => {
    if (!canLogTopics) return;
    setEditingSubject(sub);
    setIsSubjectModalOpen(true);
  };

  const handleDeleteSubject = (subjectCode: string, subjectName: string) => {
    if (!canLogTopics) return;
    if (window.confirm(`Are you sure you want to delete subject "${subjectCode} - ${subjectName}"?\nThis will remove all associated timetable slots and topic logs for this department.`)) {
      deleteSubject(subjectCode);
    }
  };

  // Extract unique subjects and faculties
  const branchLogs = topicLogs.filter(l => l.branchId === selectedBranchId);
  const uniqueSubjects = Array.from(new Set(branchLogs.map(l => l.subjectCode))).filter(Boolean);
  const uniqueFaculties = Array.from(new Set(branchLogs.map(l => l.facultyName))).filter(Boolean);

  const filteredLogs = branchLogs.filter(log => {
    if (selectedSemester !== 'ALL' && log.semester !== selectedSemester) return false;
    if (facultyFilter !== 'ALL' && log.facultyName !== facultyFilter) return false;
    if (selectedSubject !== 'ALL' && log.subjectCode !== selectedSubject) return false;
    if (selectedStatus !== 'ALL' && log.status !== selectedStatus) return false;
    if (selectedDay !== 'ALL' && getDayName(log.presentDate || log.date || log.actualDate) !== selectedDay) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = log.topicTitle.toLowerCase().includes(q);
      const matchSummary = (log.topicsCoveredSummary || '').toLowerCase().includes(q);
      const matchSubject = log.subjectName.toLowerCase().includes(q) || log.subjectCode.toLowerCase().includes(q);
      const matchFaculty = log.facultyName.toLowerCase().includes(q);
      if (!matchTitle && !matchSummary && !matchSubject && !matchFaculty) return false;
    }

    return true;
  });

  const filteredSubjectsProgress = selectedSemester === 'ALL'
    ? subjectsProgress
    : subjectsProgress.filter(sub => sub.semester === selectedSemester);

  const handleExportCSV = () => {
    exportService.exportTopicLogsToCSV(filteredLogs, selectedBranch.name, selectedSemester);
  };

  const getStatusBadge = (status: TopicStatus) => {
    switch (status) {
      case 'Completed':
        return <span className="badge badge-emerald"><CheckCircle2 size={12} /> Completed</span>;
      case 'In-Progress':
        return <span className="badge badge-indigo">In-Progress</span>;
      case 'Scheduled':
        return <span className="badge badge-cyan">Scheduled</span>;
      case 'Delayed':
        return <span className="badge badge-rose"><AlertCircle size={12} /> Delayed</span>;
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Daily Teaching Plans & Topic Logs</h1>
            <span className="badge badge-indigo">
              {selectedBranch.code} • {selectedSemester === 'ALL' ? 'All Semesters' : `Sem ${selectedSemester}`}
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Maintain daily topic logs, track syllabus milestone coverage, log delivery pedagogy, and monitor class attendance.
          </p>
        </div>

        <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button onClick={handleExportCSV} className="btn btn-secondary">
            <Download size={16} /> Export Teaching Log (CSV)
          </button>
          {canLogTopics && (
            <button
              onClick={() => {
                setEditingLog(null);
                setIsModalOpen(true);
              }}
              className="btn btn-primary"
            >
              <Plus size={16} /> Record Topic Log
            </button>
          )}
        </div>
      </div>

      {!canLogTopics && (
        <div
          className="no-print"
          style={{
            padding: '0.75rem 1.15rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)'
          }}
        >
          <Lock size={16} color="var(--accent-indigo)" />
          <span>
            Viewing <strong>{selectedBranch.name}</strong> teaching plans in <strong>Read-Only</strong> mode. Curriculum progress logging and subject management are restricted to {selectedBranch.name} faculty and HOD ({selectedBranch.hodName}).
          </span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div 
        className="glass-panel no-print"
        style={{
          padding: '1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.85rem' }}>
          {/* Semester Selector */}
          <div>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Semester</label>
            <select
              className="form-select"
              value={selectedSemester}
              onChange={e => setSelectedSemester(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
            >
              <option value="ALL">All Semesters</option>
              {[1, 2, 3, 4, 5, 6].map(s => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>
          </div>

          {/* Faculty Filter */}
          <div>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Instructor / Faculty</label>
            <select
              className="form-select"
              value={facultyFilter}
              onChange={e => setFacultyFilter(e.target.value)}
            >
              <option value="ALL">All Faculty</option>
              {uniqueFaculties.map(fac => (
                <option key={fac} value={fac}>{fac}</option>
              ))}
            </select>
          </div>


          {/* Status Filter */}
          <div>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Status</label>
            <select
              className="form-select"
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="In-Progress">In-Progress</option>
            </select>
          </div>

          {/* Search Box */}
          <div style={{ minWidth: '200px' }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Search Topic</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search topic title, summary, faculty..."
                className="form-input"
                style={{ paddingLeft: '2.2rem' }}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>
        </div>

        {/* Day Filter Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto' }}>
            <button
              onClick={() => setSelectedDay('ALL')}
              className={`btn btn-sm ${selectedDay === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Full Weekly View
            </button>
            {DAYS_OF_WEEK.map(d => (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`btn btn-sm ${selectedDay === d ? 'btn-primary' : 'btn-secondary'}`}
              >
                {d}
              </button>
            ))}
          </div>

          <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            Showing <strong>{filteredLogs.length}</strong> recorded logs
          </div>
        </div>
      </div>

      {/* Syllabus Progress Overview Cards */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.85rem' }}>
          Subject Syllabus Coverage Overview
        </h3>
        <SyllabusProgress 
          subjects={filteredSubjectsProgress} 
          onSelectSubject={(code) => setSelectedSubject(code)}
          onEditSubject={canLogTopics ? handleEditSubject : undefined}
          onDeleteSubject={canLogTopics ? handleDeleteSubject : undefined}
        />
      </div>

      {/* Daily Logs Timeline / Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredLogs.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <BookOpenCheck size={40} style={{ margin: '0 auto 0.75rem auto', opacity: 0.4 }} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>No teaching logs found</h4>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
              No log entries match your selected filter criteria.
            </p>
          </div>
        ) : (
          filteredLogs.map(log => (
            <div
              key={log.id}
              className="glass-panel"
              style={{
                padding: '1.35rem',
                borderLeft: `4px solid ${log.status === 'Completed' ? 'var(--accent-emerald)' : log.status === 'Delayed' ? 'var(--accent-rose)' : 'var(--accent-indigo)'}`,
                maxWidth: '100%',
                overflow: 'hidden',
                overflowWrap: 'break-word',
                wordBreak: 'break-word'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ flex: '1 1 300px', minWidth: 0, maxWidth: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span 
                      style={{ 
                        fontFamily: 'var(--font-mono)', 
                        fontWeight: 700, 
                        fontSize: '0.85rem',
                        background: 'rgba(99, 102, 241, 0.15)',
                        color: 'var(--accent-indigo)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      {log.subjectCode}
                    </span>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-secondary)', overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                      {log.subjectName}
                    </span>
                    <span className="badge badge-indigo">
                      Unit {log.unitNumber}
                    </span>
                    {getStatusBadge(log.status)}
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '0.45rem', overflowWrap: 'break-word', wordBreak: 'break-word', maxWidth: '100%' }}>
                    {log.topicTitle}
                  </h3>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.825rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                      <Calendar size={14} style={{ color: 'var(--accent-indigo)' }} />
                      {log.day || getDayName(log.presentDate || log.date || log.actualDate)} • {log.presentDate || log.date || log.actualDate}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Sem {log.semester} ({log.section})
                    </span>
                  </div>

                  {canLogTopics && (
                    <div className="no-print" style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        onClick={() => {
                          setEditingLog(log);
                          setIsModalOpen(true);
                        }}
                        className="btn btn-secondary btn-sm"
                        title="Edit Log"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => deleteTopicLog(log.id)}
                        className="btn btn-danger btn-sm"
                        title="Delete Log"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Topics Covered Body */}
              {log.topicsCoveredSummary && (
                <div 
                  style={{
                    background: 'var(--bg-input)',
                    padding: '0.9rem 1.15rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                    marginBottom: '0.85rem',
                    overflowWrap: 'break-word',
                    wordBreak: 'break-word',
                    wordWrap: 'break-word',
                    whiteSpace: 'pre-wrap',
                    maxWidth: '100%',
                    overflow: 'hidden'
                  }}
                >
                  {log.topicsCoveredSummary}
                </div>
              )}

              {/* Metadata Pill Row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', maxWidth: '100%' }}>
                  <span>Instructor: <strong>{log.facultyName}</strong></span>
                  {log.classType && <span>Type: <strong>{log.classType}</strong></span>}
                  <span>Teaching Aids: <strong>{log.deliveryMode}</strong></span>
                  {log.hoursSpent ? <span>Duration: <strong>{log.hoursSpent} hr(s)</strong></span> : null}
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Users size={14} style={{ color: 'var(--accent-emerald)' }} />
                    Students Present: <strong style={{ color: 'var(--accent-emerald)' }}>{log.studentsPresent ?? log.attendancePercentage}</strong>
                  </span>
                </div>

                {log.remarks && (
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', fontStyle: 'italic', overflowWrap: 'break-word', wordBreak: 'break-word', maxWidth: '100%' }}>
                    Assignment: "{log.remarks}"
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Topic Log Modal */}
      <TopicLogModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingLog(null);
        }}
        initialLog={editingLog}
        defaultSubjectCode={selectedSubject !== 'ALL' ? selectedSubject : undefined}
      />

      {/* Edit Subject Modal */}
      <SubjectModal
        isOpen={isSubjectModalOpen}
        onClose={() => {
          setIsSubjectModalOpen(false);
          setEditingSubject(null);
        }}
        subject={editingSubject}
        onSave={(oldCode, updated) => {
          updateSubject(oldCode, updated);
        }}
      />
    </div>
  );
};
