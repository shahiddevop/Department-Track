import React from 'react';
import {
  BarChart3,
  Printer,
  TrendingUp,
  CheckCircle2,
  Clock,
  Users,
  Award,
  BookOpen,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { useDepartment } from '../../context/DepartmentContext';
import { exportService } from '../../services/exportService';
import { StatCard } from '../common/StatCard';

export const AnalyticsDashboard: React.FC = () => {
  const {
    selectedBranch,
    timetable,
    topicLogs,
    events,
    rooms,
    subjectsProgress,
    selectedBranchId
  } = useDepartment();

  // Metrics calculations
  const branchSlots = timetable.filter(t => t.branchId === selectedBranchId);
  const branchLogs = topicLogs.filter(l => l.branchId === selectedBranchId);
  const branchEvents = events.filter(e => e.branchId === selectedBranchId);

  // Overall Syllabus Completion Average
  const overallSyllabusPct = subjectsProgress.length > 0
    ? Math.round(subjectsProgress.reduce((acc, curr) => acc + curr.progressPercentage, 0) / subjectsProgress.length)
    : 72;

  // Average Student Attendance
  const avgAttendance = branchLogs.length > 0
    ? Math.round(branchLogs.reduce((acc, curr) => acc + curr.attendancePercentage, 0) / branchLogs.length)
    : 89;

  // Room Utilization
  const occupiedRooms = rooms.filter(r => r.currentStatus === 'Occupied').length;
  const roomOccupancyRate = Math.round((occupiedRooms / rooms.length) * 100);

  // Total Event Attendees
  const totalAttendees = branchEvents.reduce((acc, curr) => acc + curr.registeredCount, 0);

  // Faculty Workload Map (Weekly Teaching Hours)
  const facultyHoursMap: { [key: string]: number } = {};
  branchSlots.forEach(s => {
    facultyHoursMap[s.facultyName] = (facultyHoursMap[s.facultyName] || 0) + 1;
  });

  const facultyWorkloadData = Object.entries(facultyHoursMap)
    .map(([name, hours]) => ({ name, hours }))
    .sort((a, b) => b.hours - a.hours);

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Reports & Academic Analytics</h1>
            <span className="badge badge-indigo">{selectedBranch.code}</span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Visual departmental metrics on syllabus milestone progress, faculty teaching workload, room occupancy, and student attendance.
          </p>
        </div>

        <div className="no-print header-actions-row">
          <button onClick={() => exportService.printCurrentView()} className="btn btn-secondary">
            <Printer size={16} /> Print Full Report
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="dashboard-stats-grid">
        <StatCard
          title="Overall Syllabus Coverage"
          value={`${overallSyllabusPct}%`}
          subtitle="Mid-Term Target: 60%"
          trend="+8% this week"
          trendPositive={overallSyllabusPct >= 60}
          icon={<BookOpen size={24} />}
          color="var(--accent-indigo)"
        />
        <StatCard
          title="Avg Student Attendance"
          value={`${avgAttendance}%`}
          subtitle="Across all lecture sections"
          trend="+2.4% vs last sem"
          trendPositive={true}
          icon={<Users size={24} />}
          color="var(--accent-emerald)"
        />
        <StatCard
          title="Live Room Occupancy"
          value={`${roomOccupancyRate}%`}
          subtitle={`${occupiedRooms} of ${rooms.length} facilities active`}
          trend="Peak Utilization"
          trendPositive={true}
          icon={<Clock size={24} />}
          color="var(--accent-cyan)"
        />
        <StatCard
          title="Event Registrations"
          value={totalAttendees}
          subtitle={`Across ${branchEvents.length} department programs`}
          trend="88% Fill Rate"
          trendPositive={true}
          icon={<Award size={24} />}
          color="var(--accent-amber)"
        />
      </div>

      {/* Analytics Visual Charts Row */}
      <div className="analytics-two-col">
        {/* Chart 1: Syllabus Progress by Subject */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Syllabus Completion by Subject</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Target progression vs completed curriculum units
              </p>
            </div>
            <span className="badge badge-indigo">Semester 5</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {subjectsProgress.map(sub => (
              <div key={sub.subjectCode}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 600 }}>
                    {sub.subjectCode} - {sub.subjectName}
                  </span>
                  <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-indigo)' }}>
                    {sub.progressPercentage}%
                  </span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: '10px',
                    background: 'var(--bg-input)',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      width: `${sub.progressPercentage}%`,
                      height: '100%',
                      background: 'var(--grad-primary)',
                      borderRadius: 'var(--radius-full)',
                      transition: 'width 0.8s ease'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  <span>Instructor: {sub.facultyName}</span>
                  <span>{sub.completedHours} / {sub.totalPlannedHours} Hours Taught</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Faculty Workload (Weekly Teaching Hours) */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Faculty Weekly Teaching Hours</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Contact hours scheduled per professor
              </p>
            </div>
            <span className="badge badge-emerald">Workload</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {facultyWorkloadData.map(fac => {
              const maxHours = 8;
              const barWidth = Math.min(100, Math.round((fac.hours / maxHours) * 100));

              return (
                <div key={fac.name}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 600 }}>{fac.name}</span>
                    <span style={{ fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)' }}>
                      {fac.hours} hrs/week
                    </span>
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: '10px',
                      background: 'var(--bg-input)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        width: `${barWidth}%`,
                        height: '100%',
                        background: 'var(--grad-emerald)',
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.8s ease'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
