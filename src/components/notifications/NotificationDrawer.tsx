import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  CheckCheck, 
  Trash2, 
  AlertTriangle, 
  Sparkles, 
  Plus, 
  Filter,
  Megaphone
} from 'lucide-react';
import { useDepartment } from '../../context/DepartmentContext';
import { useAuth } from '../../context/AuthContext';
import { AnnouncementModal } from './AnnouncementModal';
import { NotificationCategory } from '../../types';
import { isDemoNotification } from '../../utils/eventStatus';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { 
    notifications, 
    unreadNotificationCount, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    deleteNotification,
    selectedBranchId 
  } = useDepartment();

  const { canPostAnnouncements } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter(notif => {
    // Strictly exclude any leftover demo notifications
    if (isDemoNotification(notif)) return false;

    // Branch filter match
    const branchMatch = notif.targetBranch === 'ALL' || notif.targetBranch === selectedBranchId;
    if (!branchMatch) return false;

    // Category filter match
    if (selectedFilter !== 'ALL' && notif.category !== selectedFilter) return false;
    return true;
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return <span className="badge badge-rose">Urgent</span>;
      case 'High':
        return <span className="badge badge-amber">High Priority</span>;
      case 'Low':
        return <span className="badge badge-cyan">Info</span>;
      default:
        return <span className="badge badge-indigo">Notice</span>;
    }
  };

  return (
    <>
      <div 
        className="modal-overlay no-print"
        onClick={onClose}
        style={{ justifyContent: 'flex-end', padding: 0 }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '480px',
            height: '100vh',
            background: 'var(--bg-modal)',
            borderLeft: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--shadow-lg)',
            animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div 
            style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-input)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div 
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: 'var(--accent-indigo)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Bell size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Notifications & Alerts</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {unreadNotificationCount} unread announcements
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {unreadNotificationCount > 0 && (
                <button
                  onClick={markAllNotificationsAsRead}
                  className="btn btn-secondary btn-sm"
                  title="Mark all as read"
                >
                  <CheckCheck size={14} /> Read All
                </button>
              )}
              <button
                onClick={onClose}
                className="btn btn-secondary btn-icon"
                style={{ width: '32px', height: '32px' }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Action & Filter Bar */}
          <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '2px' }}>
              {['ALL', 'Academic', 'Schedule Change', 'Event Alert', 'Lab Booking'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedFilter(cat)}
                  style={{
                    padding: '0.3rem 0.65rem',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: selectedFilter === cat ? 'var(--accent-primary)' : 'var(--bg-input)',
                    color: selectedFilter === cat ? '#fff' : 'var(--text-secondary)',
                    whiteSpace: 'nowrap',
                    transition: 'all var(--tr-fast)'
                  }}
                >
                  {cat === 'ALL' ? 'All Alerts' : cat}
                </button>
              ))}
            </div>

            {canPostAnnouncements && (
              <button
                onClick={() => setIsComposeOpen(true)}
                className="btn btn-primary btn-sm"
                style={{ flexShrink: 0 }}
              >
                <Plus size={14} /> Post
              </button>
            )}
          </div>

          {/* Notification List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredNotifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                <Megaphone size={36} style={{ margin: '0 auto 0.75rem auto', opacity: 0.4 }} />
                <div style={{ fontWeight: 600 }}>No announcements found</div>
                <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>You are completely caught up!</div>
              </div>
            ) : (
              filteredNotifications.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => !notif.isRead && markNotificationAsRead(notif.id)}
                  style={{
                    padding: '1rem',
                    background: notif.isRead ? 'var(--bg-card)' : 'rgba(99, 102, 241, 0.08)',
                    border: `1px solid ${notif.isRead ? 'var(--border-subtle)' : 'var(--border-glow)'}`,
                    borderRadius: 'var(--radius-md)',
                    cursor: notif.isRead ? 'default' : 'pointer',
                    position: 'relative',
                    transition: 'all var(--tr-base)'
                  }}
                >
                  {!notif.isRead && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: 'var(--accent-primary)',
                        boxShadow: '0 0 8px var(--accent-primary)'
                      }}
                    />
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    {getPriorityBadge(notif.priority)}
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(notif.timestamp).toLocaleDateString()}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>• {notif.category}</span>
                  </div>

                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    {notif.title}
                  </h4>

                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '0.6rem' }}>
                    {notif.message}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      By: {notif.author}
                    </span>

                    {canPostAnnouncements && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notif.id);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--accent-rose)',
                          cursor: 'pointer',
                          display: 'flex',
                          padding: '0.2rem',
                          opacity: 0.8
                        }}
                        title="Delete Notice"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <AnnouncementModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
      />
    </>
  );
};
