import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useDepartment } from '../../context/DepartmentContext';
import { useAuth } from '../../context/AuthContext';
import { Room } from '../../types';
import { DoorClosed, Calendar, Clock, FileText, CheckCircle2 } from 'lucide-react';

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
  const { rooms, addRoomBooking, selectedBranchId } = useDepartment();
  const { currentUser } = useAuth();

  const [roomId, setRoomId] = useState<string>(selectedRoom?.id || rooms[0]?.id || '');
  const [purpose, setPurpose] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState<string>('14:00');
  const [endTime, setEndTime] = useState<string>('16:00');
  const [bookedBy, setBookedBy] = useState<string>(currentUser.name);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purpose.trim() || !roomId) return;

    const targetRoom = rooms.find(r => r.id === roomId);
    if (!targetRoom) return;

    addRoomBooking({
      roomId,
      roomNumber: targetRoom.number,
      branchId: selectedBranchId,
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
      maxWidth="600px"
    >
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          {/* Room Selection */}
          <div className="form-group">
            <label className="form-label">Select Room / Laboratory *</label>
            <select
              required
              className="form-select"
              value={roomId}
              onChange={e => setRoomId(e.target.value)}
            >
              {rooms.map(r => (
                <option key={r.id} value={r.id}>
                  {r.number} - {r.name} ({r.type} | Cap: {r.capacity})
                </option>
              ))}
            </select>
          </div>

          {/* Purpose */}
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
            <label className="form-label">Applicant / Faculty In-Charge *</label>
            <input
              type="text"
              required
              className="form-input"
              value={bookedBy}
              onChange={e => setBookedBy(e.target.value)}
            />
          </div>

          {/* Date and Times */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '1rem' }}>
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
