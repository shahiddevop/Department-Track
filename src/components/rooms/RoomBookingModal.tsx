import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '../common/Modal';
import { useDepartment } from '../../context/DepartmentContext';
import { useAuth } from '../../context/AuthContext';
import { Room } from '../../types';
import { 
  DoorClosed, 
  Clock, 
  CheckCircle2, 
  Lock, 
  ShieldCheck, 
  MapPin 
} from 'lucide-react';
import { getFacultyAssignedRoom } from '../../utils/roomAssignment';

interface RoomBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRoom?: Room | null;
}

export const RoomBookingModal: React.FC<RoomBookingModalProps> = ({
  isOpen,
  onClose,
  selectedRoom
}) => {
  const { rooms, addRoomBooking, selectedBranchId, timetable } = useDepartment();
  const { currentUser } = useAuth();

  // Automatically determine faculty's assigned room and reasoning
  const roomAssignment = useMemo(() => {
    return getFacultyAssignedRoom({
      currentUser,
      rooms,
      timetable,
      selectedBranchId,
      selectedRoom
    });
  }, [currentUser, rooms, timetable, selectedBranchId, selectedRoom]);

  const assignedRoom = roomAssignment.room;

  const [roomId, setRoomId] = useState<string>(assignedRoom?.id || '');
  const [purpose, setPurpose] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState<string>('14:00');
  const [endTime, setEndTime] = useState<string>('16:00');
  const [bookedBy, setBookedBy] = useState<string>(currentUser.name);

  // Sync state whenever modal opens or active faculty/department changes
  useEffect(() => {
    if (isOpen && assignedRoom) {
      setRoomId(assignedRoom.id);
      setBookedBy(currentUser.name);
    }
  }, [isOpen, assignedRoom, currentUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purpose.trim() || !assignedRoom) return;

    const targetBranchId = (currentUser.branchId && currentUser.branchId !== 'ALL')
      ? currentUser.branchId
      : (assignedRoom.branchId || selectedBranchId);

    addRoomBooking({
      roomId: assignedRoom.id,
      roomNumber: assignedRoom.number,
      branchId: targetBranchId,
      bookedBy,
      purpose,
      date,
      startTime,
      endTime
    });

    setPurpose('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reserve Classroom, Lab, or Seminar Hall"
      subtitle="Book departmental infrastructure for special lectures, project reviews, or club activities"
      icon={<DoorClosed size={20} />}
      maxWidth="620px"
    >
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          {/* Automatically Fixed Pre-Selected Room/Laboratory Display */}
          <div className="form-group">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem', flexWrap: 'wrap', gap: '0.4rem' }}>
              <label className="form-label" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Lock size={14} style={{ color: 'var(--accent-indigo)' }} />
                <span>Assigned Room / Laboratory *</span>
              </label>
              <span 
                className="badge badge-indigo" 
                style={{ 
                  fontSize: '0.72rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.35rem',
                  padding: '0.2rem 0.6rem'
                }}
              >
                <ShieldCheck size={12} /> Auto-Fixed Allocation
              </span>
            </div>

            {/* Read-Only Pre-selected Room Presentation Box */}
            <div 
              style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.04) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.35)',
                borderRadius: 'var(--radius-md)',
                padding: '1.1rem 1.25rem',
                position: 'relative',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.12)'
              }}
            >
              {/* Top row: Room Number & Type */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span 
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      background: 'rgba(99, 102, 241, 0.18)',
                      color: 'var(--accent-indigo)',
                      padding: '0.25rem 0.7rem',
                      borderRadius: 'var(--radius-sm)',
                      letterSpacing: '0.04em'
                    }}
                  >
                    {assignedRoom.number}
                  </span>
                  <span className="badge badge-indigo" style={{ fontSize: '0.72rem' }}>
                    {assignedRoom.type}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                  <CheckCircle2 size={14} /> Fixed Pre-Selected
                </div>
              </div>

              {/* Room Name */}
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                {assignedRoom.name}
              </div>

              {/* Floor */}
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={13} style={{ color: 'var(--accent-indigo)' }} /> {assignedRoom.floor}
              </div>
            </div>

            {/* Hidden Input for Form Submission */}
            <input type="hidden" name="roomId" value={assignedRoom.id} />
          </div>

          {/* Booking Purpose */}
          <div className="form-group">
            <label className="form-label">Booking Purpose / Event Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. AI Hackathon Project Mentoring & Evaluation"
              className="form-input"
              value={purpose}
              onChange={e => setPurpose(e.target.value)}
            />
          </div>

          {/* Reserved For / Applicant */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Applicant / Faculty In-Charge *</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {currentUser.branchName}
              </span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                required
                className="form-input"
                value={bookedBy}
                onChange={e => setBookedBy(e.target.value)}
                style={{ paddingRight: '5.5rem' }}
              />
              <span
                className="badge badge-emerald"
                style={{
                  position: 'absolute',
                  right: '0.6rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '0.68rem',
                  pointerEvents: 'none'
                }}
              >
                Faculty
              </span>
            </div>
          </div>

          {/* Date and Times */}
          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                required
                className="form-input"
                value={date}
                onChange={e => setDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Start Time</label>
              <input
                type="time"
                required
                className="form-input"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Time</label>
              <input
                type="time"
                required
                className="form-input"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            <CheckCircle2 size={16} /> Confirm Room Reservation
          </button>
        </div>
      </form>
    </Modal>
  );
};
