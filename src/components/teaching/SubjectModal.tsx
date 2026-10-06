import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { SubjectProgress } from '../../types';
import { BookOpen, User, Calendar, Clock, Layers } from 'lucide-react';

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: SubjectProgress | null;
  onSave: (oldCode: string, updated: {
    subjectCode: string;
    subjectName: string;
    facultyName: string;
    semester: number;
    totalUnits?: number;
    totalPlannedHours?: number;
  }) => void;
}

export const SubjectModal: React.FC<SubjectModalProps> = ({
  isOpen,
  onClose,
  subject,
  onSave
}) => {
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [facultyName, setFacultyName] = useState('');
  const [semester, setSemester] = useState<number>(5);
  const [totalUnits, setTotalUnits] = useState<number>(5);
  const [totalPlannedHours, setTotalPlannedHours] = useState<number>(45);

  useEffect(() => {
    if (subject) {
      setSubjectCode(subject.subjectCode);
      setSubjectName(subject.subjectName);
      setFacultyName(subject.facultyName);
      setSemester(subject.semester || 5);
      setTotalUnits(subject.totalUnits || 5);
      setTotalPlannedHours(subject.totalPlannedHours || 45);
    }
  }, [subject, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !subjectCode.trim() || !subjectName.trim()) return;

    onSave(subject.subjectCode, {
      subjectCode: subjectCode.trim(),
      subjectName: subjectName.trim(),
      facultyName: facultyName.trim(),
      semester: Number(semester),
      totalUnits: Number(totalUnits),
      totalPlannedHours: Number(totalPlannedHours)
    });

    onClose();
  };

  if (!isOpen || !subject) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Subject (${subject.subjectCode})`}
      subtitle="Modify subject details, assigned instructor, semester, and syllabus requirements"
      icon={<BookOpen size={20} />}
      maxWidth="600px"
    >
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          {/* Subject Code & Name */}
          <div className="form-grid-1-2">
            <div className="form-group">
              <label className="form-label">Subject Code *</label>
              <input
                type="text"
                required
                className="form-input"
                value={subjectCode}
                onChange={e => setSubjectCode(e.target.value)}
                placeholder="e.g. CS501"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Subject Name *</label>
              <input
                type="text"
                required
                className="form-input"
                value={subjectName}
                onChange={e => setSubjectName(e.target.value)}
                placeholder="e.g. Database Management Systems"
              />
            </div>
          </div>

          {/* Instructor & Semester */}
          <div className="form-grid-2-1">
            <div className="form-group">
              <label className="form-label">Assigned Instructor / Faculty *</label>
              <input
                type="text"
                required
                className="form-input"
                value={facultyName}
                onChange={e => setFacultyName(e.target.value)}
                placeholder="e.g. Prof. Ananya Roy"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Semester *</label>
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
          </div>

          {/* Units & Total Planned Hours */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Total Syllabus Units</label>
              <input
                type="number"
                min="1"
                max="20"
                required
                className="form-input"
                value={totalUnits}
                onChange={e => setTotalUnits(Number(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Total Planned Hours</label>
              <input
                type="number"
                min="1"
                max="200"
                required
                className="form-input"
                value={totalPlannedHours}
                onChange={e => setTotalPlannedHours(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Save Subject Changes
          </button>
        </div>
      </form>
    </Modal>
  );
};
