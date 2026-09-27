import React, { useState } from 'react';
import { 
  CalendarRange, 
  Plus, 
  Download, 
  Search, 
  Sparkles, 
  Award, 
  CheckCircle,
  Filter
} from 'lucide-react';
import { useDepartment } from '../../context/DepartmentContext';
import { useAuth } from '../../context/AuthContext';
import { exportService } from '../../services/exportService';
import { DepartmentEvent, EventCategory, EventStatus } from '../../types';
import { EventCard } from './EventCard';
import { EventModal } from './EventModal';

export const EventList: React.FC = () => {
  const { events, selectedBranch, selectedBranchId, deleteEvent } = useDepartment();
  const { canCreateEvents } = useAuth();

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

  const filteredEvents = events.filter(ev => {
    if (ev.branchId !== selectedBranchId) return false;
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
    if (selectedStatus !== 'ALL' && ev.status !== selectedStatus) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = ev.title.toLowerCase().includes(q);
      const matchDesc = ev.description.toLowerCase().includes(q);
      const matchVenue = ev.venue.toLowerCase().includes(q);
      const matchCoord = ev.facultyCoordinator.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchVenue && !matchCoord) return false;
    }

    return true;
  });

  const handleExportCSV = () => {
    exportService.exportEventsToCSV(filteredEvents, selectedBranch.name);
  };

  const handleEditEvent = (event: DepartmentEvent) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Department Events & Programs</h1>
            <span className="badge badge-indigo">{selectedBranch.code}</span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Organize collegiate hackathons, technical workshops, guest lecture series, academic assessments, and symposiums.
          </p>
        </div>

        <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
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
          <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', flex: 1, paddingBottom: '2px' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
              >
                {cat === 'ALL' ? 'All Categories' : cat}
              </button>
            ))}
          </div>

          {/* Status Dropdown & Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: '320px' }}>
            <select
              className="form-select"
              style={{ width: '150px' }}
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Live">Live Now</option>
              <option value="Completed">Completed</option>
              <option value="Postponed">Postponed</option>
            </select>

            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                placeholder="Search event, venue..."
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {filteredEvents.map(event => (
            <EventCard
              key={event.id}
              event={event}
              onEdit={handleEditEvent}
              onDelete={deleteEvent}
            />
          ))}
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
