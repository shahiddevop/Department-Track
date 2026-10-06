import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useDepartment } from '../../context/DepartmentContext';
import { useAuth } from '../../context/AuthContext';
import { TimetableSlot, DayOfWeek, ClassType } from '../../types';
import { isAccountSpecificUser } from '../../utils/facultyMatching';
import { TIMETABLE_PERIODS, CLASS_PERIODS, getSlotPeriod } from '../../utils/timetablePeriods';
import { CalendarPlus, Clock, BookOpen, MapPin, User, Tag, Save, Lock } from 'lucide-react';

interface TimetableSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSlot?: TimetableSlot | null;
  defaultSemester?: number;
  defaultDay?: DayOfWeek;
  defaultPeriod?: number;
  defaultStartTime?: string;
  defaultEndTime?: string;
}

const COLOR_PALETTE = [
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#6366f1', // Indigo
  '#f43f5e'  // Rose
];

export const TimetableSlotModal: React.FC<TimetableSlotModalProps> = ({
  isOpen,
  onClose,
  initialSlot,
  defaultSemester = 5,
  defaultDay = 'Monday',
  defaultPeriod = 1,
  defaultStartTime,
  defaultEndTime
}) => {
  const { 
    selectedBranchId, 
    addTimetableSlot, 
    updateTimetableSlot 
  } = useDepartment();

  const { currentUser } = useAuth();
  const isAccountSpecific = isAccountSpecificUser(currentUser);

  const [semester, setSemester] = useState<number>(defaultSemester);
  const [section, setSection] = useState<string>('A');
  const [day, setDay] = useState<DayOfWeek>(defaultDay);
  const [period, setPeriod] = useState<number>(defaultPeriod || 1);
  const [startTime, setStartTime] = useState<string>(defaultStartTime || '08:25');
  const [endTime, setEndTime] = useState<string>(defaultEndTime || '09:15');
  const [subjectCode, setSubjectCode] = useState<string>('');
  const [subjectName, setSubjectName] = useState<string>('');
  const [facultyName, setFacultyName] = useState<string>(isAccountSpecific ? currentUser.name : '');
  const [roomName, setRoomName] = useState<string>('');
  const [type, setType] = useState<ClassType>('Lecture');
  const [color, setColor] = useState<string>(COLOR_PALETTE[0]);

  useEffect(() => {
    if (initialSlot) {
      setSemester(initialSlot.semester);
      setSection(initialSlot.section);
      setDay(initialSlot.day);
      setPeriod(initialSlot.period || getSlotPeriod(initialSlot));
      setStartTime(initialSlot.startTime);
      setEndTime(initialSlot.endTime);
      setSubjectCode(initialSlot.subjectCode);
      setSubjectName(initialSlot.subjectName);
      setFacultyName(isAccountSpecific ? currentUser.name : initialSlot.facultyName);
      setRoomName(initialSlot.roomName || '');
      setType(initialSlot.type);
      setColor(initialSlot.color || COLOR_PALETTE[0]);
    } else {
      const pNum = defaultPeriod || 1;
      const foundP = CLASS_PERIODS.find(p => p.periodNumber === pNum);
      setSemester(defaultSemester);
      setDay(defaultDay);
      setSection('A');
      setPeriod(pNum);
      setStartTime(defaultStartTime || foundP?.defaultStartTime || '08:25');
      setEndTime(defaultEndTime || foundP?.defaultEndTime || '09:15');
      setSubjectCode('');
      setSubjectName('');
      setFacultyName(isAccountSpecific ? currentUser.name : '');
      setRoomName('');
      setType('Lecture');
      setColor(COLOR_PALETTE[0]);
    }
  }, [initialSlot, isOpen, defaultSemester, defaultDay, defaultPeriod, defaultStartTime, defaultEndTime, isAccountSpecific, currentUser.name]);

  const handlePeriodChange = (pNum: number) => {
    setPeriod(pNum);
    if (pNum > 0) {
      const found = CLASS_PERIODS.find(p => p.periodNumber === pNum);
      if (found) {
        setStartTime(found.defaultStartTime);
        setEndTime(found.defaultEndTime);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalFacultyName = isAccountSpecific ? currentUser.name : facultyName.trim();
    if (!subjectCode.trim() || !subjectName.trim() || !finalFacultyName || !roomName.trim()) {
      return;
    }

    const targetFacultyId = isAccountSpecific
      ? (currentUser.id || initialSlot?.facultyId || 'user-personal')
      : (initialSlot?.facultyId || ('faculty-' + Math.random().toString(36).substr(2, 5)));

    const slotPayload = {
      branchId: selectedBranchId,
      semester: Number(semester),
      section,
      day,
      period: period > 0 ? period : undefined,
      startTime,
      endTime,
      subjectCode: subjectCode.toUpperCase(),
      subjectName,
      facultyId: targetFacultyId,
      facultyName: finalFacultyName,
      roomId: initialSlot?.roomId || ('room-' + roomName.trim().toLowerCase().replace(/[^a-z0-9]/g, '')),
      roomName: roomName.trim(),
      type,
      color
    };

    if (initialSlot) {
      const res = updateTimetableSlot(initialSlot.id, slotPayload);
      if (!res.hasConflict) {
        onClose();
      }
    } else {
      const res = addTimetableSlot(slotPayload);
      if (!res.hasConflict) {
        onClose();
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialSlot ? 'Edit Timetable Schedule Slot' : 'Add New Timetable Slot'}
      subtitle="Allocate subject lecture/lab, instructor, classroom, and timing"
      icon={<CalendarPlus size={20} />}
      maxWidth="640px"
    >
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          {/* Semester, Section, Day */}
          <div className="form-grid-1-1-15">
            <div className="form-group">
              <label className="form-label">Semester</label>
              <select
                className="form-select"
                value={semester}
                onChange={e => setSemester(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6].map(s => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Section</label>
              <select
                className="form-select"
                value={section}
                onChange={e => setSection(e.target.value)}
              >
                {['A', 'B', 'C'].map(sec => (
                  <option key={sec} value={sec}>Section {sec}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Day of Week</label>
              <select
                className="form-select"
                value={day}
                onChange={e => setDay(e.target.value as DayOfWeek)}
              >
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Period Selector */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Period *</span>
              {period > 0 && (
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-indigo)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                  Timing: {CLASS_PERIODS.find(p => p.periodNumber === period)?.timing || '08:25 - 09:15'}
                </span>
              )}
            </label>
            <select
              className="form-select"
              value={period}
              onChange={e => handlePeriodChange(Number(e.target.value))}
            >
              {CLASS_PERIODS.map(p => (
                <option key={p.id} value={p.periodNumber}>
                  {p.name} ({p.timing})
                </option>
              ))}
            </select>
          </div>

          {/* Subject Code & Name */}
          <div className="form-grid-1-2">
            <div className="form-group">
              <label className="form-label">Subject Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. CS501"
                className="form-input"
                value={subjectCode}
                onChange={e => setSubjectCode(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Branch Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. BCA / Computer Science"
                className="form-input"
                value={subjectName}
                onChange={e => setSubjectName(e.target.value)}
              />
            </div>
          </div>

          {/* Faculty & Room */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                {isAccountSpecific ? <Lock size={12} style={{ color: 'var(--accent-indigo)' }} /> : null} Faculty / Instructor Name *
              </label>
              {isAccountSpecific ? (
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    disabled
                    className="form-input"
                    value={currentUser.name}
                    style={{ background: 'var(--bg-card)', opacity: 0.95, cursor: 'not-allowed', color: 'var(--text-primary)', fontWeight: 600, paddingRight: '6.5rem' }}
                  />
                  <span
                    className="badge badge-emerald"
                    style={{
                      position: 'absolute',
                      right: '0.5rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '0.65rem'
                    }}
                  >
                    Your Account
                  </span>
                </div>
              ) : (
                <input
                  type="text"
                  required
                  placeholder="e.g. Prof. Ananya Roy"
                  className="form-input"
                  value={facultyName}
                  onChange={e => setFacultyName(e.target.value)}
                />
              )}
              {isAccountSpecific && (
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'block' }}>
                  This timetable slot is strictly assigned to your profile ({currentUser.name})
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Room / Lab Allocation *</label>
              <input
                type="text"
                required
                placeholder="Enter Room No."
                className="form-input"
                value={roomName}
                onChange={e => setRoomName(e.target.value)}
              />
            </div>
          </div>

          {/* Color Tag */}
          <div className="form-group">
            <label className="form-label">Card Accent Color</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem', flexWrap: 'wrap' }}>
              {COLOR_PALETTE.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: c,
                    border: color === c ? '3px solid #ffffff' : '2px solid transparent',
                    cursor: 'pointer',
                    boxShadow: color === c ? `0 0 10px ${c}` : 'none',
                    transition: 'transform var(--tr-fast)'
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" id="save-slot-button">
            <Save size={16} />
            {initialSlot ? 'Save Changes' : 'Save Slot'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
