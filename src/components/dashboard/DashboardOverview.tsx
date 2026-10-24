import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  BookOpenCheck,
  CalendarRange,
  DoorClosed,
  Bell,
  Plus,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Award,
  Users,
  User,
  MapPin,
  UserCheck,
  UserX,
  ShieldCheck
} from 'lucide-react';
import { useDepartment } from '../../context/DepartmentContext';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../common/StatCard';
import { DayOfWeek, User as UserType } from '../../types';
import { isSlotAssignedToUser, isAccountSpecificUser } from '../../utils/facultyMatching';
import { authService } from '../../services/authService';

interface DashboardOverviewProps {
  onOpenNotifications: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onOpenNotifications }) => {
  const {
    selectedBranch,
    timetable,
    topicLogs,
    events,
    rooms,
    unreadNotificationCount,
    setActiveTab,
    selectedBranchId,
    subjectsProgress,
    addToast
  } = useDepartment();

  const { currentUser } = useAuth();
  const isAccountSpecific = isAccountSpecificUser(currentUser);

  // Pending faculty verifications for this department
  const [pendingFaculty, setPendingFaculty] = useState<UserType[]>(() =>
    authService.getPendingFaculty(currentUser.isSuperAdmin ? undefined : selectedBranchId)
  );

  useEffect(() => {
    const refresh = () => {
      setPendingFaculty(authService.getPendingFaculty(currentUser.isSuperAdmin ? undefined : selectedBranchId));
    };
    refresh();
    window.addEventListener('adt_faculty_updated', refresh);
    return () => window.removeEventListener('adt_faculty_updated', refresh);
  }, [selectedBranchId, currentUser]);

  const handleApproveFaculty = (faculty: UserType) => {
    const res = authService.approveFaculty(faculty.id, currentUser.name);
    if (res.success) {
      addToast(`Approved ${faculty.name}! They can now log in to ${faculty.branchName || 'the department'}.`, 'success');
      setPendingFaculty(authService.getPendingFaculty(currentUser.isSuperAdmin ? undefined : selectedBranchId));
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
      addToast(`Registration for ${faculty.name} has been rejected.`, 'info');
      setPendingFaculty(authService.getPendingFaculty(currentUser.isSuperAdmin ? undefined : selectedBranchId));
    } else {
      addToast(res.error || 'Failed to reject faculty.', 'error');
    }
  };

  // Get today's day name
  const todayDayIndex = new Date().getDay();
  const dayNames: DayOfWeek[] = ['Sunday' as any, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDayName = (todayDayIndex >= 1 && todayDayIndex <= 6) ? dayNames[todayDayIndex] : 'Monday';

  // Today's schedule slots (strictly account-specific for faculty & Dr. P.Shahnaz)
  const todaySlots = timetable
    .filter(s => {
      if (s.branchId !== selectedBranchId) return false;
      if (s.day !== currentDayName) return false;
      if (isAccountSpecific && !isSlotAssignedToUser(s, currentUser)) return false;
      return true;
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Upcoming Events (Live & Upcoming across the institution)
  const upcomingEvents = events
    .filter(e => e.status === 'Upcoming' || e.status === 'Live' || e.status === 'In Progress')
    .slice(0, 4);

  // Recent Topic Logs
  const recentLogs = topicLogs
    .filter(l => l.branchId === selectedBranchId)
    .slice(0, 3);

  // Active Occupied Rooms
  const occupiedRooms = rooms.filter(r => r.currentStatus === 'Occupied');

  return (
    <div className="page-container">
      {/* Welcome Banner */}
      <div
        className="glass-panel"
        style={{
          padding: 'clamp(1.15rem, 3vw, 2rem)',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
          border: '1px solid var(--border-glow)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
              <span className="badge badge-indigo">
                {selectedBranch.name} ({selectedBranch.code})
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                • Academic Year 2026-27
              </span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Welcome back, {currentUser.name}! 👋
            </h1>
            <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', marginTop: '0.35rem', maxWidth: '650px' }}>
              Here is your daily departmental briefing for <strong>{currentDayName}</strong>. You have <strong>{todaySlots.length} classes</strong> scheduled today and <strong>{occupiedRooms.length} labs</strong> currently active.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="no-print header-actions-row">
            <button onClick={() => setActiveTab('teaching-plan')} className="btn btn-primary">
              <BookOpenCheck size={16} /> Log Today's Lecture
            </button>
            <button onClick={() => setActiveTab('timetable')} className="btn btn-secondary">
              <Calendar size={16} /> Full Timetable
            </button>
          </div>
        </div>
      </div>

      {/* Pending Faculty Verifications Alert Card for Department HOD / Admin */}
      {(currentUser.role === 'admin' || currentUser.isSuperAdmin) && pendingFaculty.length > 0 && (
        <div
          className="glass-panel"
          style={{
            padding: '1.25rem 1.5rem',
            marginBottom: '1.75rem',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(217, 119, 6, 0.08) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            borderRadius: '16px',
            boxShadow: '0 8px 24px -6px rgba(245, 158, 11, 0.15)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(245, 158, 11, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#f59e0b'
                }}
              >
                <Users size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  Pending Faculty Verifications
                  <span
                    style={{
                      background: '#f59e0b',
                      color: '#000',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '999px'
                    }}
                  >
                    {pendingFaculty.length} {pendingFaculty.length === 1 ? 'Request' : 'Requests'}
                  </span>
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  The following faculty registered directly for <strong>{selectedBranch.name}</strong> and cannot log in until you approve their profile.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('settings')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem' }}
            >
              Manage in Department Settings <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pendingFaculty.map(fac => (
              <div
                key={fac.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  padding: '0.85rem 1.15rem',
                  background: 'rgba(15, 23, 42, 0.55)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  borderRadius: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      color: '#fff'
                    }}
                  >
                    {fac.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: '0.92rem' }}>{fac.name}</strong>
                      <span className="badge badge-amber" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                        PENDING_VERIFICATION
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '2px', flexWrap: 'wrap' }}>
                      <span>✉️ {fac.email}</span>
                      <span>• Dept: <strong>{fac.branchName}</strong></span>
                      {fac.registeredAt && (
                        <span>• Registered: {new Date(fac.registeredAt).toLocaleDateString()}</span>
                      )}
                    </div>
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
                    title="Approve profile so faculty can log in"
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
                    title="Reject registration request"
                  >
                    <UserX size={14} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="dashboard-stats-grid">
        <StatCard
          title="Today's Classes"
          value={todaySlots.length}
          subtitle={`Scheduled for ${currentDayName}`}
          icon={<Calendar size={22} />}
          color="var(--accent-indigo)"
          onClick={() => setActiveTab('timetable')}
        />
        <StatCard
          title="Active Laboratories"
          value={`${occupiedRooms.length} / ${rooms.length}`}
          subtitle="Infrastructure utilization"
          icon={<DoorClosed size={22} />}
          color="var(--accent-cyan)"
          onClick={() => setActiveTab('rooms')}
        />
        <StatCard
          title="Department Events"
          value={events.length}
          subtitle={`${upcomingEvents.length} upcoming programs`}
          icon={<CalendarRange size={22} />}
          color="var(--accent-amber)"
          onClick={() => setActiveTab('events')}
        />
        <StatCard
          title="Unread Notices"
          value={unreadNotificationCount}
          subtitle="Department bulletins"
          icon={<Bell size={22} />}
          color="var(--accent-rose)"
          onClick={onOpenNotifications}
        />
      </div>

      {/* Two Column Section: Today's Schedule + Upcoming Events & Logs */}
      <div className="dashboard-two-col">
        {/* Left: Today's Schedule Live Matrix */}
        <div className="glass-panel dashboard-schedule-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Today's Teaching Schedule</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {currentDayName} timeline for {selectedBranch.code}
              </p>
            </div>
            <button onClick={() => setActiveTab('timetable')} className="btn btn-secondary btn-sm no-print">
              View All <ChevronRight size={14} />
            </button>
          </div>

          {todaySlots.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
              {isAccountSpecific
                ? `No classes scheduled for ${currentUser.name} today (${currentDayName}).`
                : `No classes scheduled for today (${currentDayName}).`}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {todaySlots.map((slot) => (
                <div
                  key={slot.id}
                  className="dashboard-schedule-card"
                  style={{
                    borderLeft: `4px solid ${slot.color || 'var(--accent-primary)'}`
                  }}
                >
                  {/* Row 1: Time Slot on Left & Class Type Badge on Right */}
                  <div className="dashboard-schedule-top-row">
                    <div className="dashboard-schedule-time">
                      <Clock size={13} style={{ color: 'var(--accent-indigo)', flexShrink: 0 }} />
                      <span>{slot.startTime} - {slot.endTime}</span>
                    </div>
                    <span className={`badge ${slot.type === 'Lab' ? 'badge-cyan' : 'badge-indigo'} dashboard-schedule-type-badge`}>
                      {slot.type}
                    </span>
                  </div>

                  {/* Row 2: Branch Badge & Section Badge with Flexbox Gaps */}
                  <div className="dashboard-schedule-badges-row">
                    <span className="dashboard-branch-highlight">
                      {slot.subjectName}
                    </span>
                    {slot.section && (
                      <span className="dashboard-section-highlight">
                        Sec {slot.section}
                      </span>
                    )}
                  </div>

                  {/* Row 3: Faculty and Room Details with Clear Separation */}
                  <div className="dashboard-schedule-meta-row">
                    <div className="dashboard-schedule-faculty">
                      <User size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                      <span>{slot.facultyName}</span>
                    </div>
                    <span className="dashboard-schedule-dot">•</span>
                    <div className="dashboard-schedule-room">
                      <MapPin size={13} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
                      <span>Room <strong>{slot.roomName}</strong></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Upcoming Department Programs */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Flagship Events & Workshops</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Upcoming technical symposiums and assessments
              </p>
            </div>
            <button onClick={() => setActiveTab('events')} className="btn btn-secondary btn-sm no-print">
              Explore All <ChevronRight size={14} />
            </button>
          </div>

          {upcomingEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
              No upcoming events or workshops scheduled.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {upcomingEvents.map(event => (
                <div
                  key={event.id}
                  style={{
                    padding: '1rem',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span className="badge badge-rose" style={{ fontSize: '0.7rem' }}>
                      {event.category}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      📅 {event.startDate}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                    {event.title}
                  </h4>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                    <span>📍 {event.venue}</span>
                    <span style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>
                      {event.registeredCount} / {event.maxSeats} Registered
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Teaching Topic Logs Section */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Recently Logged Teaching Topics</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Latest classroom syllabus and pedagogy entries
            </p>
          </div>
          <button onClick={() => setActiveTab('teaching-plan')} className="btn btn-secondary btn-sm no-print">
            View All Logs <ChevronRight size={14} />
          </button>
        </div>

        <div className="cards-grid-auto">
          {recentLogs.map(log => (
            <div
              key={log.id}
              style={{
                padding: '1.15rem',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.8rem', color: 'var(--accent-indigo)' }}>
                  {log.subjectCode} • Unit {log.unitNumber}
                </span>
                <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                  {log.status}
                </span>
              </div>

              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                {log.topicTitle}
              </h4>

              <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.4rem' }}>
                <span>{log.facultyName}</span>
                <span>Attendance: <strong>{log.attendancePercentage}%</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
