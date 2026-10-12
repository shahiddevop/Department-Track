import React, { useState } from 'react';
import {
  CalendarRange,
  Plus,
  Download,
  Search,
  Sparkles,
  Award,
  CheckCircle,
  Filter,
  AlertCircle
} from 'lucide-react';
import { useDepartment } from '../../context/DepartmentContext';
import { useAuth } from '../../context/AuthContext';
import { exportService } from '../../services/exportService';
import { DepartmentEvent, EventCategory, EventStatus } from '../../types';
import { EventCard } from './EventCard';
import { EventModal } from './EventModal';
import { calculateEventStatus, getEventDateTimes } from '../../utils/eventStatus';

export const EventList: React.FC = () => {
  const { events, branches, selectedBranch, selectedBranchId, deleteEvent, isEventCreator, addToast } = useDepartment();
  const { canCreateEvents } = useAuth();

  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<DepartmentEvent | null>(null);

  const categories = [
    'ALL',
    'Competitions',
    'Guest Lecture',
    'Awareness Session',
    'Seminar',
    'Workshop',
    'Field Trip'
  ];

  // Institution-wide query logic: fetch and display all created events across the entire institution
  const filteredEvents = events.filter(ev => {
    // Optional department filter (defaults to ALL to show all institution events)
    if (selectedBranchFilter !== 'ALL' && ev.branchId !== selectedBranchFilter) return false;

    if (selectedCategory !== 'ALL') {
      const matchExact = ev.category === selectedCategory;
      const matchLegacy =
        (selectedCategory === 'Competitions' && (ev.category === 'Technical Fest' || ev.category === 'Hackathon')) ||
        (selectedCategory === 'Workshop' && ev.category === 'Hands-on Workshop') ||
        (selectedCategory === 'Seminar' && ev.category === 'National Seminar') ||
        (selectedCategory === 'Awareness Session' && ev.category === 'Exam & Assessment') ||
        (selectedCategory === 'Field Trip' && ev.category === 'Industry Visit');
      if (!matchExact && !matchLegacy) return false;
    }
    if (selectedStatus !== 'ALL') {
      const effStatus = calculateEventStatus(ev);
      if (selectedStatus === 'In Progress') {
        if (effStatus !== 'In Progress' && effStatus !== 'Live') return false;
      } else if (effStatus !== selectedStatus) {
        return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = ev.title.toLowerCase().includes(q);
      const matchDesc = ev.description.toLowerCase().includes(q);
      const matchVenue = ev.venue.toLowerCase().includes(q);
      const matchCoord = ev.facultyCoordinator.toLowerCase().includes(q);
      const matchBody = ev.organizingBody?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchVenue && !matchCoord && !matchBody) return false;
    }

    return true;
  });

  // Partition into Upcoming on Top (soonest first) and Completed on Bottom (most recent first)
  const upcomingEvents = filteredEvents
    .filter(ev => {
      const status = calculateEventStatus(ev);
      return status === 'Upcoming' || status === 'In Progress' || status === 'Live';
    })
    .sort((a, b) => {
      const timeA = getEventDateTimes(a).start?.getTime() || 0;
      const timeB = getEventDateTimes(b).start?.getTime() || 0;
      return timeA - timeB;
    });

  const completedEvents = filteredEvents
    .filter(ev => {
      const status = calculateEventStatus(ev);
      return status === 'Completed';
    })
    .sort((a, b) => {
      const timeA = getEventDateTimes(a).end?.getTime() || 0;
      const timeB = getEventDateTimes(b).end?.getTime() || 0;
      return timeB - timeA;
    });

  const otherEvents = filteredEvents
    .filter(ev => {
      const status = calculateEventStatus(ev);
      return status !== 'Upcoming' && status !== 'In Progress' && status !== 'Live' && status !== 'Completed';
    })
    .sort((a, b) => {
      const timeA = getEventDateTimes(a).start?.getTime() || 0;
      const timeB = getEventDateTimes(b).start?.getTime() || 0;
      return timeB - timeA;
    });

  const handleExportCSV = () => {
    const sortedForExport = [...upcomingEvents, ...completedEvents, ...otherEvents];
    exportService.exportEventsToCSV(sortedForExport, 'All Institution Departments');
  };

  const handleEditEvent = (event: DepartmentEvent) => {
    if (!isEventCreator(event)) {
      addToast(`Access Denied: Only the creator of "${event.title}" can edit it.`, 'error');
      return;
    }
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Events & Programs</h1>
            <span className="badge badge-indigo">All Institution ({events.length})</span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Explore collegiate hackathons, technical workshops, guest lectures, and symposiums across all departments.
          </p>
        </div>

        <div className="no-print header-actions-row">
          <button onClick={handleExportCSV} className="btn btn-secondary">
            <Download size={16} /> Export Events (CSV)
          </button>
          {canCreateEvents && (
            <button
              onClick={() => {
                setEditingEvent(null);
                setIsModalOpen(true);
              }}
              className="btn btn-primary"
            >
              <Plus size={16} /> Create Event
            </button>
          )}
        </div>
      </div>

      {/* Category Pills & Filters */}
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', flex: '1 1 280px', paddingBottom: '2px', scrollbarWidth: 'none' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
                style={{ whiteSpace: 'nowrap' }}
              >
                {cat === 'ALL' ? 'All Categories' : cat}
              </button>
            ))}
          </div>

          {/* Department, Status Dropdown & Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: '1 1 360px', flexWrap: 'wrap' }}>
            <select
              className="form-select"
              style={{ minWidth: '150px', flex: '1 1 130px' }}
              value={selectedBranchFilter}
              onChange={e => setSelectedBranchFilter(e.target.value)}
              title="Filter by Department"
            >
              <option value="ALL">All Departments</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>

            <select
              className="form-select"
              style={{ width: '130px', flex: '1 1 110px' }}
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="Upcoming">Upcoming</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Postponed">Postponed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <div style={{ position: 'relative', flex: '2 1 160px' }}>
              <input
                type="text"
                placeholder="Search event, venue, dept..."
                className="form-input"
                style={{ paddingLeft: '2.2rem' }}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Event Cards Grid */}
      {filteredEvents.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <CalendarRange size={42} style={{ margin: '0 auto 0.85rem auto', opacity: 0.4 }} />
          <h4 style={{ fontSize: '1.15rem', fontWeight: 600 }}>No department events found</h4>
          <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
            No scheduled programs match your selected filter categories.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          {/* Upcoming Events (Top) */}
          {upcomingEvents.length > 0 && (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.25rem',
                  paddingBottom: '0.65rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <CalendarRange size={20} color="var(--accent-indigo)" />
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Upcoming Events</h2>
                  <span className="badge badge-indigo">{upcomingEvents.length}</span>
                </div>
                <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                  Scheduled programs & upcoming competitions
                </span>
              </div>

              <div className="cards-grid-auto">
                {upcomingEvents.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onEdit={handleEditEvent}
                    onDelete={deleteEvent}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed Events (Bottom) */}
          {completedEvents.length > 0 && (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.25rem',
                  paddingBottom: '0.65rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <CheckCircle size={20} color="#10b981" />
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Completed Events</h2>
                  <span className="badge badge-cyan">{completedEvents.length}</span>
                </div>
                <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                  Past institutional programs & archives
                </span>
              </div>

              <div className="cards-grid-auto">
                {completedEvents.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onEdit={handleEditEvent}
                    onDelete={deleteEvent}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Postponed / Cancelled Events (if any) */}
          {otherEvents.length > 0 && (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.25rem',
                  paddingBottom: '0.65rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <AlertCircle size={20} color="#f59e0b" />
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Postponed & Cancelled</h2>
                  <span className="badge badge-amber">{otherEvents.length}</span>
                </div>
              </div>

              <div className="cards-grid-auto">
                {otherEvents.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onEdit={handleEditEvent}
                    onDelete={deleteEvent}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Event Modal */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEvent(null);
        }}
        initialEvent={editingEvent}
      />
    </div>
  );
};
