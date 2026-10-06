import React from 'react';
import { SubjectProgress } from '../../types';
import { BookOpen, Clock, Edit3, Trash2 } from 'lucide-react';

interface SyllabusProgressProps {
  subjects: SubjectProgress[];
  onSelectSubject?: (subjectCode: string) => void;
  onEditSubject?: (subject: SubjectProgress) => void;
  onDeleteSubject?: (subjectCode: string, subjectName: string) => void;
}

export const SyllabusProgress: React.FC<SyllabusProgressProps> = ({
  subjects,
  onSelectSubject,
  onEditSubject,
  onDeleteSubject
}) => {
  if (subjects.length === 0) return null;

  return (
    <div className="cards-grid-auto" style={{ marginBottom: '1.5rem' }}>
      {subjects.map(sub => {
        const isHigh = sub.progressPercentage >= 70;
        const isMed = sub.progressPercentage >= 40 && sub.progressPercentage < 70;
        const progressColor = isHigh ? 'var(--accent-emerald)' : isMed ? 'var(--accent-indigo)' : 'var(--accent-amber)';

        return (
          <div
            key={sub.subjectCode}
            className="glass-panel"
            onClick={() => onSelectSubject && onSelectSubject(sub.subjectCode)}
            style={{
              padding: '1.25rem',
              cursor: onSelectSubject ? 'pointer' : 'default',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span className="badge badge-indigo" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                    {sub.subjectCode}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Sem {sub.semester}
                  </span>
                </div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '0.35rem' }}>
                  {sub.subjectName}
                </h4>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                  Instructor: {sub.facultyName}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.35rem', fontWeight: 800, color: progressColor }}>
                  {sub.progressPercentage}%
                </span>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Coverage</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div 
              style={{
                width: '100%',
                height: '8px',
                background: 'var(--bg-input)',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden',
                marginTop: '0.65rem'
              }}
            >
              <div 
                style={{
                  width: `${sub.progressPercentage}%`,
                  height: '100%',
                  background: progressColor,
                  borderRadius: 'var(--radius-full)',
                  transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              />
            </div>

            {/* Units, Hours Metric and Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <BookOpen size={13} style={{ color: 'var(--accent-indigo)' }} />
                  Units: <strong>{sub.completedUnits} / {sub.totalUnits}</strong>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Clock size={13} style={{ color: 'var(--accent-cyan)' }} />
                  Hours: <strong>{sub.completedHours} / {sub.totalPlannedHours} hrs</strong>
                </span>
              </div>

              {(onEditSubject || onDeleteSubject) && (
                <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }} onClick={e => e.stopPropagation()}>
                  {onEditSubject && (
                    <button
                      onClick={() => onEditSubject(sub)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.2rem 0.45rem', fontSize: '0.7rem' }}
                      title="Edit Subject Details"
                    >
                      <Edit3 size={12} /> Edit
                    </button>
                  )}
                  {onDeleteSubject && (
                    <button
                      onClick={() => onDeleteSubject(sub.subjectCode, sub.subjectName)}
                      className="btn btn-danger btn-sm"
                      style={{ padding: '0.2rem 0.45rem', fontSize: '0.7rem' }}
                      title="Delete Subject"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
