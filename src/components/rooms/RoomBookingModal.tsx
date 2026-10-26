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

  // Determine fallback designated room if no specific room was clicked
  const defaultRoomAssignment = useMemo(() => {
    return getFacultyAssignedRoom({
      currentUser,
      rooms,
      timetable,
      selectedBranchId,
      selectedRoom: null
    });
  }, [currentUser, rooms, timetable, selectedBranchId]);

  // Active room state: dynamically initialized to clicked card's selectedRoom
  const [activeRoomId, setActiveRoomId] = useState<string>(
    selectedRoom?.id || defaultRoomAssignment.room?.id || rooms[0]?.id || ''
  );
  const [purpose, setPurpose] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState<string>('14:00');
  const [endTime, setEndTime] = useState<string>('16:00');
  const [bookedBy, setBookedBy] = useState<string>(currentUser.name);

  // Sync state whenever modal opens or clicked card changes
  useEffect(() => {
    if (isOpen) {
      if (selectedRoom) {
        setActiveRoomId(selectedRoom.id);
      } else if (defaultRoomAssignment.room) {
        setActiveRoomId(defaultRoomAssignment.room.id);
      }
      setBookedBy(currentUser.name);
    }
  }, [isOpen, selectedRoom, defaultRoomAssignment.room, currentUser.name]);

  // Dynamically resolve the active lab being booked
  const activeRoom = useMemo(() => {
    return rooms.find(r => r.id === activeRoomId) || selectedRoom || defaultRoomAssignment.room || rooms[0];
  }, [rooms, activeRoomId, selectedRoom, defaultRoomAssignment.room]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purpose.trim() || !activeRoom) return;

    const targetBranchId = (currentUser.branchId && currentUser.branchId !== 'ALL')
      ? currentUser.branchId
      : (activeRoom.branchId || selectedBranchId);

    const success = addRoomBooking({
      roomId: activeRoom.id,
      roomNumber: activeRoom.number,
      branchId: targetBranchId,
      bookedBy,
      purpose,
      date,
      startTime,
      endTime
    });

    if (success) {
      setPurpose('');
      onClose();
    }
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
          {/* Dynamically Selected Laboratory / Facility Display */}
          <div className="form-group">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem', flexWrap: 'wrap', gap: '0.4rem' }}>
              <label className="form-label" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <DoorClosed size={15} style={{ color: 'var(--accent-indigo)' }} />
                <span>Selected Laboratory / Facility *</span>
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
                <CheckCircle2 size={12} /> {selectedRoom ? 'Selected Lab' : 'Allocated Facility'}
              </span>
            </div>

            {/* Room Selector Dropdown */}
            <div style={{ marginBottom: '0.75rem' }}>
              <select
                className="form-select"
                value={activeRoom?.id || ''}
                onChange={e => setActiveRoomId(e.target.value)}
                style={{ fontWeight: 600 }}
              >
                {rooms.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.number} — {r.name} ({r.type}) • {r.floor}
                  </option>
                ))}
              </select>
            </div>

            {/* Dynamic Specific Lab Data Card */}
            {activeRoom && (
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
                      {activeRoom.number}
                    </span>
                    <span className="badge badge-indigo" style={{ fontSize: '0.72rem' }}>
                      {activeRoom.type}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                    <CheckCircle2 size={14} /> {activeRoom.currentStatus}
                  </div>
                </div>

                {/* Room Name */}
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  {activeRoom.name}
                </div>

                {/* Floor & Capacity */}
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MapPin size={13} style={{ color: 'var(--accent-indigo)' }} /> {activeRoom.floor}
                  </div>
                  {activeRoom.capacity && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      • Capacity: <strong>{activeRoom.capacity} seats</strong>
                    </div>
                  )}
                </div>

                {/* Facilities Badges */}
                {activeRoom.facilities && activeRoom.facilities.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.5rem' }}>
                    {activeRoom.facilities.map((fac, idx) => (
                      <span key={idx} className="badge badge-cyan" style={{ fontSize: '0.68rem', padding: '0.12rem 0.45rem' }}>
                        {fac}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Hidden Input for Form Submission */}
            <input type="hidden" name="roomId" value={activeRoom?.id || ''} />
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
