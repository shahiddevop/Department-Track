import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useDepartment } from '../../context/DepartmentContext';
import { useAuth } from '../../context/AuthContext';
import { DepartmentEvent, EventCategory, EventStatus, OrganizingBody } from '../../types';
import { CalendarRange, MapPin, Users, DollarSign, Award, Tag } from 'lucide-react';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEvent?: DepartmentEvent | null;
}

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  initialEvent
}) => {
  const { selectedBranchId, addEvent, updateEvent, rooms } = useDepartment();
  const { currentUser } = useAuth();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventCategory>('Workshop');
  const [organizingBody, setOrganizingBody] = useState<OrganizingBody>('Dept');
  const [description, setDescription] = useState('');
  const [programDate, setProgramDate] = useState(new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState('09:30 AM');
  const [endTime, setEndTime] = useState('04:30 PM');
  const [venue, setVenue] = useState('Sir C. V. Raman Seminar Hall (SH-401)');
  const [facultyCoordinator, setFacultyCoordinator] = useState(currentUser.name);
  const [studentCoordinator, setStudentCoordinator] = useState('');
  const [targetAudience, setTargetAudience] = useState('All Registered Department Students');
  const [budget, setBudget] = useState<number>(25000);
  const [status, setStatus] = useState<EventStatus>('Upcoming');
  const [maxSeats, setMaxSeats] = useState<number>(100);
  const [highlightsInput, setHighlightsInput] = useState('');

  useEffect(() => {
    if (initialEvent) {
      setTitle(initialEvent.title);
      const cat = initialEvent.category;
      const normalizedCat: EventCategory = 
        cat === 'Hands-on Workshop' ? 'Workshop' :
        cat === 'National Seminar' ? 'Seminar' :
        cat === 'Technical Fest' ? 'Competitions' :
        cat === 'Hackathon' ? 'Competitions' :
        cat === 'Industry Visit' ? 'Field Trip' :
        cat;
      setCategory(normalizedCat);
      setOrganizingBody(initialEvent.organizingBody || 'Dept');
      setDescription(initialEvent.description);
      const initialDate = initialEvent.programDate || initialEvent.startDate || new Date().toISOString().slice(0, 10);
      setProgramDate(initialDate);
      setStartTime(initialEvent.startTime);
      setEndTime(initialEvent.endTime);
      setVenue(initialEvent.venue);
      setFacultyCoordinator(initialEvent.facultyCoordinator);
      setStudentCoordinator(initialEvent.studentCoordinator);
      setTargetAudience(initialEvent.targetAudience);
      setBudget(initialEvent.budget);
      setStatus(initialEvent.status);
      setMaxSeats(initialEvent.maxSeats);
      setHighlightsInput((initialEvent.keyHighlights || []).join(', '));
    } else {
      setTitle('');
      setCategory('Workshop');
      setOrganizingBody('Dept');
      setDescription('');
      const todayStr = new Date().toISOString().slice(0, 10);
      setProgramDate(todayStr);
      setStartTime('09:30 AM');
      setEndTime('04:30 PM');
      setVenue('Sir C. V. Raman Seminar Hall (SH-401)');
      setFacultyCoordinator(currentUser.name);
      setStudentCoordinator('');
      setTargetAudience('All Registered Department Students');
      setBudget(25000);
      setStatus('Upcoming');
      setMaxSeats(100);
      setHighlightsInput('Hands-on Sandbox, Certificate of Completion, High-Tea Provided');
    }
  }, [initialEvent, isOpen, currentUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !venue.trim()) return;

    const highlights = highlightsInput
      .split(',')
      .map(h => h.trim())
      .filter(Boolean);

    const eventPayload = {
      branchId: selectedBranchId,
      title,
      category,
      organizingBody,
      description,
      programDate,
      startDate: programDate,
      endDate: programDate,
      startTime,
      endTime,
      venue,
      facultyCoordinator,
      studentCoordinator: studentCoordinator || 'Student Tech Council',
      targetAudience,
      budget: Number(budget),
      status,
      maxSeats: Number(maxSeats),
      keyHighlights: highlights
    };

    if (initialEvent) {
      updateEvent(initialEvent.id, eventPayload);
    } else {
      addEvent(eventPayload);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialEvent ? 'Edit Department Event / Program' : 'Create & Schedule Department Event'}
      subtitle="Organize hackathons, workshops, guest seminars, exams, or fests"
      icon={<CalendarRange size={20} />}
      maxWidth="700px"
    >
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          {/* Title & Category */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Event Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. HackNova 2026: 36-Hour National Hackathon"
                className="form-input"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={category}
                onChange={e => setCategory(e.target.value as EventCategory)}
              >
                <option value="Competitions">Competitions</option>
                <option value="Guest Lecture">Guest Lecture</option>
                <option value="Awareness Session">Awareness Session</option>
                <option value="Seminar">Seminar</option>
                <option value="Workshop">Workshop</option>
                <option value="Field Trip">Field Trip</option>
              </select>
            </div>
          </div>

          {/* Program Date, Organizing Body & Times */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.35fr 1fr 1fr', gap: '0.75rem', alignItems: 'end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ minHeight: '2.2rem', display: 'flex', alignItems: 'flex-end' }}>Program Date</label>
              <input
                type="date"
                required
                className="form-input"
                value={programDate}
                onChange={e => setProgramDate(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ minHeight: '2.2rem', display: 'flex', alignItems: 'flex-end' }}>Organized By</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Dept, Cell, Committee, Club"
                value={organizingBody}
                onChange={e => setOrganizingBody(e.target.value)}
                list="organizing-body-suggestions"
              />
              <datalist id="organizing-body-suggestions">
                <option value="Dept" />
                <option value="Cell" />
                <option value="Committee" />
                <option value="Club" />
              </datalist>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ minHeight: '2.2rem', display: 'flex', alignItems: 'flex-end' }}>Start Time</label>
              <input
                type="text"
                required
                placeholder="09:30 AM"
                className="form-input"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ minHeight: '2.2rem', display: 'flex', alignItems: 'flex-end' }}>End Time</label>
              <input
                type="text"
                required
                placeholder="04:30 PM"
                className="form-input"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
              />
            </div>
          </div>

          {/* Venue & Target Audience */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Venue / Hall Location *</label>
              <input
                type="text"
                required
                placeholder="e.g. Sir C. V. Raman Seminar Hall (SH-401)"
                className="form-input"
                value={venue}
                onChange={e => setVenue(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Target Audience</label>
              <input
                type="text"
                placeholder="e.g. Sem 5 & 7 Students, Faculty Members"
                className="form-input"
                value={targetAudience}
                onChange={e => setTargetAudience(e.target.value)}
              />
            </div>
          </div>

          {/* Coordinators */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Faculty Coordinator *</label>
              <input
                type="text"
                required
                className="form-input"
                value={facultyCoordinator}
                onChange={e => setFacultyCoordinator(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Student Lead / Coordinator</label>
              <input
                type="text"
                placeholder="e.g. Rahul Kapoor"
                className="form-input"
                value={studentCoordinator}
                onChange={e => setStudentCoordinator(e.target.value)}
              />
            </div>
          </div>

          {/* Budget, Max Seats, Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Budget Allocated ($/₹)</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={budget}
                onChange={e => setBudget(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Seat Capacity</label>
              <input
                type="number"
                min="10"
                className="form-input"
                value={maxSeats}
                onChange={e => setMaxSeats(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Event Status</label>
              <select
                className="form-select"
                value={status}
                onChange={e => setStatus(e.target.value as EventStatus)}
              >
                <option value="Upcoming">Upcoming</option>
                <option value="Live">Live / Ongoing</option>
                <option value="Completed">Completed</option>
                <option value="Postponed">Postponed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Key Highlights */}
          <div className="form-group">
            <label className="form-label">Key Highlights (Comma Separated)</label>
            <input
              type="text"
              placeholder="e.g. Free Cloud Credits, Cash Prizes, Networking High-Tea"
              className="form-input"
              value={highlightsInput}
              onChange={e => setHighlightsInput(e.target.value)}
            />
          </div>

          {/* Description moved to bottom */}
          <div className="form-group">
            <label className="form-label">Event Description & Objectives *</label>
            <textarea
              required
              rows={3}
              className="form-textarea"
              placeholder="Outline event agenda, guest speakers, key takeaways, eligibility, and rules..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {initialEvent ? 'Save Event Changes' : 'Schedule & Publish Event'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
