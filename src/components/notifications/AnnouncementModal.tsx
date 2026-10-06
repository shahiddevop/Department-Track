import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useDepartment } from '../../context/DepartmentContext';
import { useAuth } from '../../context/AuthContext';
import { NotificationCategory, NotificationPriority } from '../../types';
import { BellPlus, Megaphone, Send } from 'lucide-react';

interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AnnouncementModal: React.FC<AnnouncementModalProps> = ({ isOpen, onClose }) => {
  const { addNotification, selectedBranchId, branches } = useDepartment();
  const { currentUser } = useAuth();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<NotificationCategory>('Academic');
  const [priority, setPriority] = useState<NotificationPriority>('Normal');
  const [targetBranch, setTargetBranch] = useState<string>('ALL');
  const [targetRole, setTargetRole] = useState<string>('ALL');
  const [isUrgentBanner, setIsUrgentBanner] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    addNotification({
      title,
      message,
      category,
      priority,
      targetBranch,
      targetRole,
      isUrgentBanner: priority === 'Urgent' || isUrgentBanner,
      author: `${currentUser.name} (${currentUser.designation})`
    });

    // Reset and close
    setTitle('');
    setMessage('');
    setCategory('Academic');
    setPriority('Normal');
    setIsUrgentBanner(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Broadcast Department Announcement"
      subtitle="Publish an official departmental memo, schedule revision, or event notification"
      icon={<Megaphone size={20} />}
      maxWidth="600px"
    >
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Announcement Title *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g., Mid-Term Syllabus Audit & Submission Deadline"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Message Details *</label>
            <textarea
              required
              className="form-textarea"
              placeholder="Enter full notice instructions, affected semesters, and action items..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              style={{ minHeight: '100px' }}
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select 
                className="form-select"
                value={category}
                onChange={e => setCategory(e.target.value as NotificationCategory)}
              >
                <option value="Academic">Academic Notice</option>
                <option value="Schedule Change">Schedule / Timetable Change</option>
                <option value="Event Alert">Event / Workshop Alert</option>
                <option value="Lab Booking">Lab & Equipment Notice</option>
                <option value="Exam Notice">Exam & Assessment</option>
                <option value="Broadcast">General Broadcast</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority Level</label>
              <select 
                className="form-select"
                value={priority}
                onChange={e => {
                  const val = e.target.value as NotificationPriority;
                  setPriority(val);
                  if (val === 'Urgent') setIsUrgentBanner(true);
                }}
              >
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent (Flash Banner)</option>
                <option value="Low">Low / Informational</option>
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Target Department / Branch</label>
              <select 
                className="form-select"
                value={targetBranch}
                onChange={e => setTargetBranch(e.target.value)}
              >
                <option value="ALL">All Departments (Campus-wide)</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Target Audience Role</label>
              <select 
                className="form-select"
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
              >
                <option value="ALL">Everyone (Faculty + Students)</option>
                <option value="faculty">Faculty Members Only</option>
                <option value="student">Students Only</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              id="urgentBanner"
              checked={isUrgentBanner}
              onChange={e => setIsUrgentBanner(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: 'var(--accent-primary)' }}
            />
            <label htmlFor="urgentBanner" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              Display as Sticky Top Urgent Ticker Banner
            </label>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            <Send size={16} /> Broadcast Announcement
          </button>
        </div>
      </form>
    </Modal>
  );
};
