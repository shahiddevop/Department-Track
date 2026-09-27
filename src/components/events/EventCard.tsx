import React from 'react';
import { DepartmentEvent, EventStatus } from '../../types';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  User,
  DollarSign,
  Sparkles,
  Edit3,
  Trash2,
  Tag
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface EventCardProps {
  event: DepartmentEvent;
  onEdit: (event: DepartmentEvent) => void;
  onDelete: (id: string) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onEdit, onDelete }) => {
  const { canCreateEvents } = useAuth();

  const isFull = event.registeredCount >= event.maxSeats;
  const fillPercentage = Math.min(100, Math.round((event.registeredCount / event.maxSeats) * 100));

  const getStatusBadge = (status: EventStatus) => {
    switch (status) {
      case 'Live':
        return <span className="badge badge-emerald" style={{ animation: 'pulseGlow 2s infinite' }}>● Live Now</span>;
      case 'Upcoming':
        return <span className="badge badge-indigo">Upcoming</span>;
      case 'Completed':
        return <span className="badge badge-cyan">Completed</span>;
      case 'Postponed':
        return <span className="badge badge-amber">Postponed</span>;
      case 'Cancelled':
        return <span className="badge badge-rose">Cancelled</span>;
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
            {getStatusBadge(event.status)}
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
            <User size={15} style={{ color: 'var(--text-muted)' }} />
            <span>Faculty Lead: <strong>{event.facultyCoordinator}</strong></span>
          </div>
        </div>
      </div>

      {/* Footer: Registration Bar & Actions */}
      <div>
        {/* Progress Bar */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.3rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Registration Capacity:</span>
            <span style={{ fontWeight: 700, color: isFull ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
              {event.registeredCount} / {event.maxSeats} seats ({fillPercentage}%)
            </span>
          </div>
          <div
            style={{
              width: '100%',
              height: '6px',
              background: 'var(--bg-input)',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: `${fillPercentage}%`,
                height: '100%',
                background: isFull ? 'var(--accent-rose)' : 'var(--grad-primary)',
                borderRadius: 'var(--radius-full)',
                transition: 'width 0.4s ease'
              }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        {canCreateEvents && (
          <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
            <button
              onClick={() => onEdit(event)}
              className="btn btn-secondary btn-sm"
              title="Edit Event"
            >
              <Edit3 size={14} />
            </button>
            <button
              onClick={() => onDelete(event.id)}
              className="btn btn-danger btn-sm"
              title="Delete Event"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
