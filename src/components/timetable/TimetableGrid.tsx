import React, { useState } from 'react';
import {
  CalendarDays,
  Plus,
  Download,
  Printer,
  Search,
  Filter,
  Clock,
  MapPin,
  User,
  Edit3,
  Trash2,
  AlertCircle,
  Layers,
  Lock,
  Globe,
  Coffee,
  LayoutGrid,
  ListFilter,
  MoveHorizontal
} from 'lucide-react';
import { useDepartment } from '../../context/DepartmentContext';
import { useAuth } from '../../context/AuthContext';
import { exportService } from '../../services/exportService';
import { TimetableSlot, DayOfWeek } from '../../types';
import { TimetableSlotModal } from './TimetableSlotModal';
import { isSlotAssignedToUser, isAccountSpecificUser } from '../../utils/facultyMatching';
import { TIMETABLE_PERIODS, getSlotPeriod, TimetablePeriod } from '../../utils/timetablePeriods';

const DAYS_OF_WEEK: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const TimetableGrid: React.FC = () => {
  const {
    timetable,
    selectedBranch,
    selectedBranchId,
    deleteTimetableSlot,
    rooms
  } = useDepartment();

  const { currentUser, canEditBranchContent } = useAuth();
  const canEditTimetable = canEditBranchContent(selectedBranchId);
  const isAccountSpecific = isAccountSpecificUser(currentUser);

  // Filters State
  const [selectedSemester, setSelectedSemester] = useState<number | 'ALL'>('ALL');
  const [selectedSection, setSelectedSection] = useState<string>('ALL');
  const [selectedDay, setSelectedDay] = useState<string>('ALL');
  const [facultyFilter, setFacultyFilter] = useState<string>('ALL');
  const [roomFilter, setRoomFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAllDepartments, setShowAllDepartments] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'matrix' | 'agenda'>('matrix');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);
  const [modalDefaultDay, setModalDefaultDay] = useState<DayOfWeek>('Monday');
  const [modalDefaultPeriod, setModalDefaultPeriod] = useState<number>(1);
  const [modalDefaultStartTime, setModalDefaultStartTime] = useState<string>('08:25');
  const [modalDefaultEndTime, setModalDefaultEndTime] = useState<string>('09:15');
  const [modalDefaultSection, setModalDefaultSection] = useState<string>('A');

  // Can user add slot to timetable
  const canAddSlot = canEditTimetable || isAccountSpecific;

  // Can user manage/edit a specific slot
  const canUserManageSlot = (slot: TimetableSlot) => {
    if (canEditTimetable) return true;
    return isSlotAssignedToUser(slot, currentUser);
  };

  // Extract unique faculties for filter (for Super Admin / Student view)
  const uniqueFaculties = Array.from(new Set(timetable.map(s => s.facultyName))).filter(Boolean);
  // Extract unique sections
  const uniqueSections = Array.from(new Set(timetable.map(s => s.section).filter(Boolean))).sort();

  // Filtered timetable slots
  const filteredSlots = timetable.filter(slot => {
    // 1. Account-specific enforcement: strictly only slots assigned to the logged-in user!
    if (isAccountSpecific && !isSlotAssignedToUser(slot, currentUser)) {
      return false;
    }

    // Branch filter: if not viewing all departments, restrict to selected branch
    if (!showAllDepartments && slot.branchId !== selectedBranchId) return false;

    // Semester filter
    if (selectedSemester !== 'ALL' && slot.semester !== selectedSemester) return false;

    // Section filter
    if (selectedSection !== 'ALL' && slot.section !== selectedSection) return false;

    // Day filter
    if (selectedDay !== 'ALL' && slot.day !== selectedDay) return false;

    // Faculty filter (only for non-account-specific users like Super Admin / Student)
    if (!isAccountSpecific && facultyFilter !== 'ALL' && slot.facultyName !== facultyFilter) return false;

    // Room filter
    if (roomFilter !== 'ALL' && slot.roomId !== roomFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSub = slot.subjectName.toLowerCase().includes(q) || slot.subjectCode.toLowerCase().includes(q);
      const matchFac = slot.facultyName.toLowerCase().includes(q);
      const matchRoom = slot.roomName.toLowerCase().includes(q);
      if (!matchSub && !matchFac && !matchRoom) return false;
    }

    return true;
  });

  const handleExportCSV = () => {
    exportService.exportTimetableToCSV(filteredSlots, selectedBranch.name, selectedSemester);
  };

  const handlePrint = () => {
    exportService.printCurrentView();
  };

  const handleEditSlot = (slot: TimetableSlot) => {
    setEditingSlot(slot);
    setModalDefaultDay(slot.day);
    setModalDefaultPeriod(slot.period || getSlotPeriod(slot));
    setModalDefaultStartTime(slot.startTime);
    setModalDefaultEndTime(slot.endTime);
    setModalDefaultSection(slot.section || 'A');
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingSlot(null);
    setModalDefaultDay(selectedDay !== 'ALL' ? (selectedDay as DayOfWeek) : 'Monday');
    setModalDefaultPeriod(1);
    setModalDefaultStartTime('08:25');
    setModalDefaultEndTime('09:15');
    setModalDefaultSection(selectedSection !== 'ALL' ? selectedSection : 'A');
    setIsModalOpen(true);
  };

  const handleAddSlotToDay = (day: DayOfWeek) => {
    setEditingSlot(null);
    setModalDefaultDay(day);
    setModalDefaultPeriod(1);
    setModalDefaultStartTime('08:25');
    setModalDefaultEndTime('09:15');
    setModalDefaultSection(selectedSection !== 'ALL' ? selectedSection : 'A');
    setIsModalOpen(true);
  };

  const handleAddSlotToPeriod = (day: DayOfWeek, period: TimetablePeriod) => {
    setEditingSlot(null);
    setModalDefaultDay(day);
    setModalDefaultPeriod(period.periodNumber || 1);
    setModalDefaultStartTime(period.defaultStartTime);
    setModalDefaultEndTime(period.defaultEndTime);
    setModalDefaultSection(selectedSection !== 'ALL' ? selectedSection : 'A');
    setIsModalOpen(true);
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Academic Timetable & Schedules</h1>
            <span className="badge badge-indigo">
              {showAllDepartments ? 'All Departments' : selectedBranch.code} • {selectedSemester === 'ALL' ? 'All Semesters' : `Sem ${selectedSemester}`} {selectedSection !== 'ALL' ? `• Sec ${selectedSection}` : ''}
            </span>
            {isAccountSpecific && (
              <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <User size={13} /> Account: <strong>{currentUser.name}</strong>
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {isAccountSpecific
              ? `Personal schedule strictly filtered for ${currentUser.name}. Only your allocated lectures, labs, and tutorials are shown.`
              : 'Maintain daily class schedules, allocate rooms/labs, assign faculty instructors, and prevent clashes.'}
          </p>
        </div>

        <div className="no-print header-actions-row">
          <button onClick={handleExportCSV} className="btn btn-secondary">
            <Download size={16} /> Export CSV
          </button>
          <button onClick={handlePrint} className="btn btn-secondary">
            <Printer size={16} /> Print Timetable
          </button>
        </div>
      </div>

      {isAccountSpecific ? (
        <div
          className="no-print"
          style={{
            padding: '0.75rem 1.15rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.65rem',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <User size={16} color="var(--accent-emerald)" />
            <span>
              Strictly account-specific timetable for <strong>{currentUser.name}</strong>. Only your assigned classes and laboratory sessions are displayed.
            </span>
          </div>
          <span className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>
            Verified Account Schedule
          </span>
        </div>
      ) : (
        !canEditTimetable && (
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
              Viewing <strong>{selectedBranch.name}</strong> timetable in <strong>Read-Only</strong> mode. Class scheduling and slot modifications are restricted to {selectedBranch.name} faculty and HOD ({selectedBranch.hodName}).
            </span>
          </div>
        )
      )}

      {/* Filter Toolbar */}
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

          {/* Section Selector */}
          <div>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Section</label>
            <select
              className="form-select"
              value={selectedSection}
              onChange={e => setSelectedSection(e.target.value)}
            >
              <option value="ALL">All Sections</option>
              {Array.from(new Set(['A', 'B', 'C', 'D', ...uniqueSections])).sort().map(sec => (
                <option key={sec} value={sec}>Section {sec}</option>
              ))}
            </select>
          </div>

          {/* Faculty Filter */}
          <div>
            <label className="form-label" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              {isAccountSpecific ? <Lock size={12} style={{ color: 'var(--accent-indigo)' }} /> : null} Instructor / Faculty
            </label>
            {isAccountSpecific ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.45rem 0.75rem',
                  background: 'var(--bg-input)',
                  border: '1px solid rgba(99, 102, 241, 0.35)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  height: '38px'
                }}
                title="Your timetable is strictly account-specific to your login"
              >
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: 'rgba(99, 102, 241, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-primary)',
                    flexShrink: 0
                  }}
                >
                  <User size={13} />
                </div>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  {currentUser.name}
                </span>
                <span className="badge badge-indigo" style={{ fontSize: '0.65rem' }}>Personal</span>
              </div>
            ) : (
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
            )}
          </div>

          {/* Department Scope for Account-Specific Users */}
          {isAccountSpecific && (
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Department Scope</label>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAllDepartments(false)}
                  className={`btn btn-sm ${!showAllDepartments ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.75rem', height: '38px', flex: 1 }}
                >
                  {selectedBranch.code} Only
                </button>
                <button
                  type="button"
                  onClick={() => setShowAllDepartments(true)}
                  className={`btn btn-sm ${showAllDepartments ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.75rem', height: '38px', flex: 1 }}
                >
                  All Depts
                </button>
              </div>
            </div>
          )}

          {/* Room Filter */}
          <div>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Room / Lab</label>
            <select
              className="form-select"
              value={roomFilter}
              onChange={e => setRoomFilter(e.target.value)}
            >
              <option value="ALL">All Rooms & Labs</option>
              {rooms.map(r => (
                <option key={r.id} value={r.id}>{r.number} ({r.type})</option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div style={{ minWidth: '200px' }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Search Subject / Code</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search database, OS..."
                className="form-input"
                style={{ paddingLeft: '2.2rem' }}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>
        </div>

        {/* Day Tabs & View Mode Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
          {/* Day Tabs with Smooth Touch Scrolling */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', overflowX: 'auto', flex: '1 1 300px', paddingBottom: '2px', scrollbarWidth: 'none' }}>
            <button
              onClick={() => setSelectedDay('ALL')}
              className={`btn btn-sm ${selectedDay === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ whiteSpace: 'nowrap' }}
            >
              Full Weekly View
            </button>
            {DAYS_OF_WEEK.map(d => (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`btn btn-sm ${selectedDay === d ? 'btn-primary' : 'btn-secondary'}`}
                style={{ whiteSpace: 'nowrap' }}
              >
                {d}
              </button>
            ))}
          </div>

          {/* View Mode Toggle Switcher */}
          <div className="no-print" style={{ display: 'inline-flex', background: 'var(--bg-input)', padding: '0.2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => setViewMode('matrix')}
              className={`btn btn-sm ${viewMode === 'matrix' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.75rem', height: '30px', padding: '0.25rem 0.65rem', border: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              title="Matrix Table Grid View"
            >
              <LayoutGrid size={13} />
              <span>Matrix</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('agenda')}
              className={`btn btn-sm ${viewMode === 'agenda' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.75rem', height: '30px', padding: '0.25rem 0.65rem', border: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              title="Vertical Mobile Agenda View"
            >
              <ListFilter size={13} />
              <span>Timeline</span>
            </button>
          </div>
        </div>
      </div>

      {/* Schedule Display */}
      {(() => {
        const renderPeriodGrid = (dayName: DayOfWeek, daySlots: TimetableSlot[]) => {
          return (
            <div>
              {/* Mobile/Tablet Swipe Hint */}
              <div className="timetable-scroll-hint no-print">
                <MoveHorizontal size={14} />
                <span>Swipe / Scroll horizontally to explore all 6 periods and recess</span>
              </div>

              <div className="timetable-scroll-outer">
                <div className="timetable-matrix-grid">
                  {TIMETABLE_PERIODS.map(period => {
                    if (period.isBreak) {
                      return (
                        <div
                          key={period.id}
                          style={{
                            background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.08) 0%, rgba(245, 158, 11, 0.02) 100%)',
                            border: '1px dashed rgba(245, 158, 11, 0.35)',
                            borderRadius: 'var(--radius-md)',
                            padding: '0.5rem 0.35rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                            minHeight: '190px',
                            minWidth: 0,
                            transition: 'all var(--tr-fast)'
                          }}
                        >
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: 'rgba(245, 158, 11, 0.15)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginBottom: '0.4rem'
                            }}
                          >
                            <Coffee size={16} color="var(--accent-amber, #f59e0b)" />
                          </div>
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: '0.78rem',
                              color: 'var(--accent-amber, #f59e0b)',
                              marginBottom: '0.15rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '100%'
                            }}
                          >
                            Break Interval
                          </span>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.65rem',
                              color: 'var(--text-muted)',
                              marginBottom: '0.4rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '100%'
                            }}
                          >
                            {period.timing}
                          </span>
                          <span
                            className="badge badge-amber"
                            style={{
                              fontSize: '0.62rem',
                              padding: '0.15rem 0.35rem',
                              background: 'rgba(245, 158, 11, 0.15)',
                              color: '#f59e0b',
                              border: '1px solid rgba(245, 158, 11, 0.3)'
                            }}
                          >
                            Recess
                          </span>
                        </div>
                      );
                    }

                    // Class Period (1, 2, 3, 4, 5, 6)
                    const periodSlots = daySlots.filter(s => getSlotPeriod(s) === period.periodNumber);

                    return (
                      <div
                        key={period.id}
                        style={{
                          background: 'rgba(15, 23, 42, 0.5)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          padding: '0.5rem 0.4rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.45rem',
                          minHeight: '190px',
                          minWidth: 0
                        }}
                      >
                        {/* Period Column Header */}
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingBottom: '0.35rem',
                            borderBottom: '1px solid var(--border-subtle)',
                            textAlign: 'center',
                            width: '100%'
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: '0.78rem',
                              color: 'var(--text-primary)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '100%'
                            }}
                          >
                            {period.name}
                          </span>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.65rem',
                              color: 'var(--text-muted)',
                              marginTop: '0.05rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '100%'
                            }}
                          >
                            {period.timing}
                          </span>
                        </div>

                        {/* Slots in this period */}
                        {periodSlots.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', flex: 1, minWidth: 0 }}>
                            {periodSlots.map(slot => (
                              <div
                                key={slot.id}
                                style={{
                                  background: 'var(--bg-input)',
                                  border: '1px solid var(--border-subtle)',
                                  borderRadius: 'var(--radius-sm)',
                                  padding: '0.5rem 0.4rem',
                                  position: 'relative',
                                  borderLeft: `3px solid ${slot.color || 'var(--accent-primary)'}`,
                                  minWidth: 0,
                                  transition: 'transform var(--tr-fast), box-shadow var(--tr-fast)'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem', gap: '0.25rem' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
                                    {slot.section && (
                                      <span
                                        className="badge badge-purple"
                                        style={{ fontSize: '0.62rem', padding: '0.06rem 0.35rem', fontWeight: 700 }}
                                        title={`Section ${slot.section}`}
                                      >
                                        Sec {slot.section}
                                      </span>
                                    )}
                                  </div>
                                  <span
                                    className={`badge ${slot.type === 'Lab' ? 'badge-cyan' : slot.type === 'Tutorial' ? 'badge-amber' : slot.type === 'Seminar' ? 'badge-rose' : 'badge-indigo'}`}
                                    style={{ fontSize: '0.62rem', padding: '0.06rem 0.32rem' }}
                                  >
                                    {slot.type === 'Lecture' ? 'Lec' : slot.type}
                                  </span>
                                </div>

                                <h4
                                  style={{
                                    fontSize: '0.78rem',
                                    fontWeight: 700,
                                    lineHeight: 1.25,
                                    marginBottom: '0.35rem',
                                    color: 'var(--text-primary)',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}
                                  title={slot.subjectName}
                                >
                                  {slot.subjectName}
                                </h4>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Clock size={11} style={{ color: 'var(--accent-indigo)', flexShrink: 0 }} />
                                    <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}>
                                      {slot.startTime} - {slot.endTime}
                                    </span>
                                  </div>

                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <User size={11} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {slot.facultyName}
                                    </span>
                                  </div>

                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <MapPin size={11} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
                                    <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {slot.roomName}
                                    </span>
                                  </div>

                                  {slot.section && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                      <Layers size={11} style={{ color: 'var(--accent-violet, #a855f7)', flexShrink: 0 }} />
                                      <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>
                                        Section {slot.section}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {canUserManageSlot(slot) && (
                                  <div
                                    className="no-print"
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'flex-end',
                                      gap: '0.25rem',
                                      marginTop: '0.45rem',
                                      borderTop: '1px solid var(--border-subtle)',
                                      paddingTop: '0.35rem'
                                    }}
                                  >
                                    <button
                                      onClick={() => handleEditSlot(slot)}
                                      className="btn btn-secondary btn-sm"
                                      style={{ padding: '0.15rem 0.35rem', fontSize: '0.65rem', height: '22px' }}
                                      title="Edit Slot"
                                    >
                                      <Edit3 size={10} /> Edit
                                    </button>
                                    <button
                                      onClick={() => deleteTimetableSlot(slot.id)}
                                      className="btn btn-danger btn-sm"
                                      style={{ padding: '0.15rem 0.35rem', fontSize: '0.65rem', height: '22px' }}
                                      title="Delete Slot"
                                    >
                                      <Trash2 size={10} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}

                            {/* Button to add another slot in this period */}
                            {canAddSlot && (
                              <button
                                onClick={() => handleAddSlotToPeriod(dayName, period)}
                                className="btn btn-secondary btn-sm no-print"
                                style={{
                                  width: '100%',
                                  fontSize: '0.68rem',
                                  padding: '0.2rem 0.35rem',
                                  borderStyle: 'dashed',
                                  marginTop: 'auto',
                                  height: '24px'
                                }}
                              >
                                <Plus size={10} /> Add
                              </button>
                            )}
                          </div>
                        ) : (
                          /* Empty Period Slot */
                          <div
                            style={{
                              flex: 1,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minHeight: '120px',
                              minWidth: 0
                            }}
                          >
                            {canAddSlot ? (
                              <button
                                onClick={() => handleAddSlotToPeriod(dayName, period)}
                                className="no-print"
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  minHeight: '110px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '0.35rem',
                                  background: 'rgba(255, 255, 255, 0.02)',
                                  border: '1px dashed rgba(99, 102, 241, 0.35)',
                                  borderRadius: 'var(--radius-sm)',
                                  color: 'var(--text-muted)',
                                  cursor: 'pointer',
                                  padding: '0.5rem 0.25rem',
                                  transition: 'all var(--tr-fast)',
                                  minWidth: 0
                                }}
                                onMouseEnter={e => {
                                  e.currentTarget.style.background = 'rgba(99, 102, 241, 0.08)';
                                  e.currentTarget.style.borderColor = 'var(--accent-indigo)';
                                  e.currentTarget.style.color = 'var(--accent-indigo)';
                                }}
                                onMouseLeave={e => {
                                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                                  e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.35)';
                                  e.currentTarget.style.color = 'var(--text-muted)';
                                }}
                                title={`Click to schedule a class in ${period.name} (${period.timing})`}
                              >
                                <div
                                  style={{
                                    width: '26px',
                                    height: '26px',
                                    borderRadius: '50%',
                                    background: 'rgba(99, 102, 241, 0.12)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  <Plus size={14} />
                                </div>
                                <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>+ Add Class</span>
                                <span style={{ fontSize: '0.62rem', opacity: 0.75 }}>{period.timing}</span>
                              </button>
                            ) : (
                              <div
                                style={{
                                  textAlign: 'center',
                                  padding: '0.5rem',
                                  color: 'var(--text-muted)',
                                  fontSize: '0.7rem',
                                  opacity: 0.6
                                }}
                              >
                                <span>Free Period</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        };

        const renderAgendaView = (dayName: DayOfWeek, daySlots: TimetableSlot[]) => {
          return (
            <div className="timetable-agenda-list">
              {TIMETABLE_PERIODS.map(period => {
                if (period.isBreak) {
                  return (
                    <div
                      key={period.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.85rem',
                        padding: '0.85rem 1.15rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.12) 0%, rgba(245, 158, 11, 0.03) 100%)',
                        border: '1px dashed rgba(245, 158, 11, 0.35)'
                      }}
                    >
                      <div
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          background: 'rgba(245, 158, 11, 0.18)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <Coffee size={18} color="var(--accent-amber, #f59e0b)" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--accent-amber, #f59e0b)' }}>
                          Recess / Refreshment Pause
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                          {period.timing} • Break Interval
                        </div>
                      </div>
                      <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>Recess</span>
                    </div>
                  );
                }

                const periodSlots = daySlots.filter(s => getSlotPeriod(s) === period.periodNumber);

                return (
                  <div key={period.id} className="agenda-period-block">
                    <div className="agenda-period-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span className="badge badge-indigo" style={{ fontWeight: 700 }}>
                          {period.name}
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          {period.timing}
                        </span>
                      </div>
                      {canAddSlot && (
                        <button
                          onClick={() => handleAddSlotToPeriod(dayName, period)}
                          className="btn btn-secondary btn-sm no-print"
                          style={{ height: '26px', fontSize: '0.72rem', padding: '0.2rem 0.6rem' }}
                        >
                          <Plus size={12} /> Add Class
                        </button>
                      )}
                    </div>

                    {periodSlots.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', padding: '0.75rem' }}>
                        {periodSlots.map(slot => (
                          <div
                            key={slot.id}
                            className="glass-panel"
                            style={{
                              padding: '0.95rem 1.15rem',
                              borderLeft: `4px solid ${slot.color || 'var(--accent-primary)'}`,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.5rem'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <span className="dashboard-branch-highlight" style={{ fontSize: '0.9rem', padding: '0.2rem 0.65rem' }}>
                                  {slot.subjectName}
                                </span>
                                {slot.section && (
                                  <span className="dashboard-section-highlight" style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}>
                                    Section {slot.section}
                                  </span>
                                )}
                                <span className={`badge ${slot.type === 'Lab' ? 'badge-cyan' : slot.type === 'Tutorial' ? 'badge-amber' : slot.type === 'Seminar' ? 'badge-rose' : 'badge-indigo'}`} style={{ fontSize: '0.68rem' }}>
                                  {slot.type}
                                </span>
                              </div>
                              {canUserManageSlot(slot) && (
                                <div className="no-print" style={{ display: 'flex', gap: '0.35rem' }}>
                                  <button
                                    onClick={() => handleEditSlot(slot)}
                                    className="btn btn-secondary btn-sm"
                                    style={{ height: '24px', padding: '0.15rem 0.5rem', fontSize: '0.7rem' }}
                                  >
                                    <Edit3 size={11} /> Edit
                                  </button>
                                  <button
                                    onClick={() => deleteTimetableSlot(slot.id)}
                                    className="btn btn-danger btn-sm"
                                    style={{ height: '24px', padding: '0.15rem 0.4rem', fontSize: '0.7rem' }}
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                </div>
                              )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <Clock size={13} style={{ color: 'var(--accent-indigo)' }} />
                                <span style={{ fontFamily: 'var(--font-mono)' }}>{slot.startTime} - {slot.endTime}</span>
                              </div>
                              {slot.section && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                  <Layers size={13} style={{ color: 'var(--accent-violet, #a855f7)' }} />
                                  <span style={{ fontWeight: 600 }}>Section {slot.section}</span>
                                </div>
                              )}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <User size={13} style={{ color: 'var(--text-muted)' }} />
                                <span>{slot.facultyName}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <MapPin size={13} style={{ color: 'var(--accent-emerald)' }} />
                                <span style={{ fontWeight: 600 }}>{slot.roomName}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ padding: '0.85rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                        Free Period • No scheduled session
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        };

        if (selectedDay === 'ALL') {
          return (
            /* Weekly Schedule Display */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {DAYS_OF_WEEK.map(dayName => {
                const daySlots = filteredSlots
                  .filter(s => s.day === dayName)
                  .sort((a, b) => a.startTime.localeCompare(b.startTime));

                return (
                  <div
                    key={dayName}
                    className="glass-panel"
                    style={{ padding: '1.25rem' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.65rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{dayName}</h3>
                        <span className="badge badge-indigo" style={{ fontSize: '0.75rem' }}>
                          {daySlots.length} Classes Scheduled
                        </span>
                      </div>
                      {canAddSlot && (
                        <button
                          onClick={() => handleAddSlotToDay(dayName)}
                          className="btn btn-secondary btn-sm no-print"
                        >
                          <Plus size={14} /> Add Slot to {dayName}
                        </button>
                      )}
                    </div>

                    {viewMode === 'matrix'
                      ? renderPeriodGrid(dayName, daySlots)
                      : renderAgendaView(dayName, daySlots)
                    }
                  </div>
                );
              })}
            </div>
          );
        } else {
          return (
            /* Single Day View with Period Grid or Agenda */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                      {selectedDay} Schedule ({selectedSemester === 'ALL' ? 'All Semesters' : `Semester ${selectedSemester}`})
                    </h3>
                    <span className="badge badge-indigo">
                      {filteredSlots.length} Classes Scheduled
                    </span>
                  </div>
                  {canAddSlot && (
                    <button
                      onClick={() => handleAddSlotToDay(selectedDay as DayOfWeek)}
                      className="btn btn-primary btn-sm no-print"
                    >
                      <Plus size={14} /> Add Slot to {selectedDay}
                    </button>
                  )}
                </div>

                {viewMode === 'matrix'
                  ? renderPeriodGrid(selectedDay as DayOfWeek, filteredSlots)
                  : renderAgendaView(selectedDay as DayOfWeek, filteredSlots)
                }
              </div>
            </div>
          );
        }
      })()}

      {/* Add / Edit Timetable Slot Modal */}
      <TimetableSlotModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSlot(null);
        }}
        initialSlot={editingSlot}
        defaultSemester={selectedSemester === 'ALL' ? 5 : selectedSemester}
        defaultSection={modalDefaultSection}
        defaultDay={modalDefaultDay}
        defaultPeriod={modalDefaultPeriod}
        defaultStartTime={modalDefaultStartTime}
        defaultEndTime={modalDefaultEndTime}
      />
    </div>
  );
};
