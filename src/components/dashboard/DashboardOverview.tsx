import React from 'react';
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
  MapPin
} from 'lucide-react';
import { useDepartment } from '../../context/DepartmentContext';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../common/StatCard';
import { DayOfWeek } from '../../types';
import { isSlotAssignedToUser, isAccountSpecificUser } from '../../utils/facultyMatching';

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
    subjectsProgress 
  } = useDepartment();

  const { currentUser } = useAuth();
  const isAccountSpecific = isAccountSpecificUser(currentUser);

  // Get today's day name
  const todayDayIndex = new Date().getDay();
  const dayNames: DayOfWeek[] = ['Sunday' as any, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDayName = (todayDayIndex >= 1 && todayDayIndex <= 6) ? dayNames[todayDayIndex] : 'Monday';

  // Today's schedule slots (strictly account-specific for faculty & Raisa Tahseen)
  const todaySlots = timetable
    .filter(s => {
      if (s.branchId !== selectedBranchId) return false;
      if (s.day !== currentDayName) return false;
      if (isAccountSpecific && !isSlotAssignedToUser(s, currentUser)) return false;
      return true;
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Upcoming Events (Live & Upcoming)
  const upcomingEvents = events
    .filter(e => e.branchId === selectedBranchId && (e.status === 'Upcoming' || e.status === 'Live'))
    .slice(0, 3);

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
          padding: '2rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
          border: '1px solid var(--border-glow)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className="badge badge-indigo">
                {selectedBranch.name} ({selectedBranch.code})
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                • Academic Year 2026-27
              </span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Welcome back, {currentUser.name}! 👋
            </h1>
            <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', marginTop: '0.35rem', maxWidth: '650px' }}>
              Here is your daily departmental briefing for <strong>{currentDayName}</strong>. You have <strong>{todaySlots.length} classes</strong> scheduled today and <strong>{occupiedRooms.length} labs</strong> currently active.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="no-print" style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            <button onClick={() => setActiveTab('teaching-plan')} className="btn btn-primary">
              <BookOpenCheck size={16} /> Log Today's Lecture
            </button>
            <button onClick={() => setActiveTab('timetable')} className="btn btn-secondary">
              <Calendar size={16} /> Full Timetable
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Left: Today's Schedule Live Matrix */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
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
              {todaySlots.map((slot, index) => (
                <div
                  key={slot.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.9rem 1.15rem',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderLeft: `4px solid ${slot.color || 'var(--accent-primary)'}`,
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700, minWidth: '95px' }}>
                      {slot.startTime} - {slot.endTime}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: slot.color }}>
                          {slot.subjectCode}
                        </span>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                          {slot.subjectName}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                        {slot.facultyName} • Sec {slot.section} • <strong>{slot.roomName}</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    <span className="badge badge-indigo" style={{ fontSize: '0.7rem' }}>
                      Sec {slot.section}
                    </span>
                    <span className={`badge ${slot.type === 'Lab' ? 'badge-cyan' : 'badge-indigo'}`} style={{ fontSize: '0.7rem' }}>
                      {slot.type}
                    </span>
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
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
