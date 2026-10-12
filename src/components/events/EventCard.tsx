import React from 'react';
import { DepartmentEvent, EventStatus } from '../../types';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  Edit3,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDepartment } from '../../context/DepartmentContext';
import { calculateEventStatus } from '../../utils/eventStatus';

interface EventCardProps {
  event: DepartmentEvent;
  onEdit: (event: DepartmentEvent) => void;
  onDelete: (id: string) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onEdit, onDelete }) => {
  const { isEventCreator } = useDepartment();
  const effectiveStatus = calculateEventStatus(event);

  // Creator authorization check: conditionally render edit and delete only for creator
  const isCreator = isEventCreator(event);

  const getStatusBadge = (status: EventStatus) => {
    switch (status) {
      case 'In Progress':
      case 'Live':
        return (
          <span 
            className="badge badge-emerald" 
            style={{ 
              animation: 'pulseGlow 2s infinite',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            ● In Progress
          </span>
        );
      case 'Upcoming':
        return <span className="badge badge-indigo">Upcoming</span>;
      case 'Completed':
        return <span className="badge badge-cyan">Completed</span>;
      case 'Postponed':
        return <span className="badge badge-amber">Postponed</span>;
      case 'Cancelled':
        return <span className="badge badge-rose">Cancelled</span>;
      default:
        return <span className="badge badge-indigo">{status}</span>;
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'Competitions':
      case 'Hackathon':
      case 'Technical Fest':
        return 'badge-rose';
      case 'Workshop':
      case 'Hands-on Workshop':
        return 'badge-indigo';
      case 'Guest Lecture':
        return 'badge-cyan';
      case 'Awareness Session':
      case 'Exam & Assessment':
        return 'badge-amber';
      case 'Seminar':
      case 'National Seminar':
        return 'badge-indigo';
      case 'Field Trip':
      case 'Industry Visit':
        return 'badge-emerald';
      default:
        return 'badge-emerald';
    }
  };

  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative'
      }}
    >
      <div>
        {/* Top Badges */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span className={`badge ${getCategoryBadge(event.category)}`}>
              {event.category}
            </span>
            {event.organizingBody && (
              <span className="badge badge-amber" style={{ fontSize: '0.725rem' }}>
                {event.organizingBody}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {getStatusBadge(effectiveStatus)}
            {event.budget > 0 && (
              <span className="badge badge-indigo" style={{ fontSize: '0.7rem' }}>
                ₹{event.budget.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, lineHeight: 1.3, marginBottom: '0.5rem' }}>
          {event.title}
        </h3>

        {/* Description */}
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {event.description}
        </p>

        {/* Highlight Tags */}
        {event.keyHighlights && event.keyHighlights.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
            {event.keyHighlights.map((hl, i) => (
              <span
                key={i}
                style={{
                  fontSize: '0.725rem',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-secondary)'
                }}
              >
                ✦ {hl}
              </span>
            ))}
          </div>
        )}

        {/* Info Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={15} style={{ color: 'var(--accent-indigo)' }} />
            <span>
              {event.programDate || (event.startDate === event.endDate ? event.startDate : `${event.startDate} to ${event.endDate}`)}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={15} style={{ color: 'var(--accent-cyan)' }} />
            <span>{event.startTime} - {event.endTime}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={15} style={{ color: 'var(--accent-emerald)' }} />
            <span style={{ fontWeight: 600 }}>{event.venue}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <span>Faculty Lead: <strong>{event.facultyCoordinator}</strong></span>
          </div>

          {Boolean(event.studentCoordinator && event.studentCoordinator.trim()) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={15} style={{ color: '#8b5cf6', flexShrink: 0 }} />
              <span>Student Lead / Coordinator: <strong>{event.studentCoordinator.trim()}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Footer: Creator Attribution & Guarded Action Buttons */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '0.85rem',
          marginTop: '0.5rem',
          gap: '0.5rem',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {isCreator ? (
            <span 
              className="badge badge-emerald" 
              style={{ 
                fontSize: '0.72rem', 
                padding: '0.2rem 0.5rem', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.3rem',
                fontWeight: 600
              }}
              title="You created this event and have management permissions"
            >
              <CheckCircle2 size={12} /> Created by You
            </span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }} title={`Created by: ${event.creatorName || event.facultyCoordinator}`}>
              <User size={12} style={{ opacity: 0.7 }} />
              <span>Created by: {event.creatorName || event.facultyCoordinator}</span>
            </span>
          )}
        </div>

        {/* Action Buttons: Conditionally rendered ONLY for the event creator */}
        {isCreator && (
          <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <button
              onClick={() => onEdit(event)}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.65rem', fontSize: '0.775rem' }}
              title="Edit Event (Creator Only)"
            >
              <Edit3 size={13} /> Edit
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete "${event.title}"?`)) {
                  onDelete(event.id);
                }
              }}
              className="btn btn-danger btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.65rem', fontSize: '0.775rem' }}
              title="Delete Event (Creator Only)"
            >
              <Trash2 size={13} /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
