import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '../common/Modal';
import { useDepartment } from '../../context/DepartmentContext';
import { useAuth } from '../../context/AuthContext';
import { DailyTopicLog, DeliveryMode, TopicStatus, TopicClassType } from '../../types';
import { BookOpenCheck, Calendar, Clock, Users, FileText } from 'lucide-react';

interface TopicLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLog?: DailyTopicLog | null;
  defaultSubjectCode?: string;
}

const getDayNameFromDateStr = (dateStr: string): string => {
  if (!dateStr) return 'Monday';
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return 'Monday';
  const d = new Date(year, month - 1, day);
  const name = d.toLocaleDateString('en-US', { weekday: 'long' });
  return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].includes(name) ? name : 'Monday';
};

const getTodayDateStr = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const TopicLogModal: React.FC<TopicLogModalProps> = ({
  isOpen,
  onClose,
  initialLog,
  defaultSubjectCode
}) => {
  const { 
    selectedBranchId, 
    timetable, 
    subjectsProgress,
    addTopicLog, 
    updateTopicLog 
  } = useDepartment();

  const { currentUser } = useAuth();

  // Extract unique subjects memoized from subjectsProgress and timetable
  const availableSubjects = useMemo(() => {
    const map = new Map<string, { subjectCode: string; subjectName: string; facultyName: string; semester: number; section: string }>();

    subjectsProgress.forEach(sub => {
      map.set(sub.subjectCode, {
        subjectCode: sub.subjectCode,
        subjectName: sub.subjectName,
        facultyName: sub.facultyName || currentUser.name,
        semester: sub.semester,
        section: 'A'
      });
    });

    timetable.filter(t => t.branchId === selectedBranchId).forEach(t => {
      if (!map.has(t.subjectCode)) {
        map.set(t.subjectCode, {
          subjectCode: t.subjectCode,
          subjectName: t.subjectName,
          facultyName: t.facultyName || currentUser.name,
          semester: t.semester,
          section: t.section || 'A'
        });
      } else {
        const existing = map.get(t.subjectCode)!;
        if (t.section) existing.section = t.section;
        if (t.facultyName && !existing.facultyName) existing.facultyName = t.facultyName;
      }
    });

    return Array.from(map.values());
  }, [subjectsProgress, timetable, selectedBranchId, currentUser.name]);

  const [semester, setSemester] = useState<number>(5);
  const [section, setSection] = useState<string>('A');
  const [subjectCode, setSubjectCode] = useState<string>('');
  const [subjectName, setSubjectName] = useState<string>('');
  const [facultyName, setFacultyName] = useState<string>(currentUser.name);
  const [date, setDate] = useState<string>(getTodayDateStr());
  const [dayOfWeek, setDayOfWeek] = useState<string>(getDayNameFromDateStr(getTodayDateStr()));
  const [unitNumber, setUnitNumber] = useState<number>(1);
  const [topicTitle, setTopicTitle] = useState<string>('');
  const [topicsCoveredSummary, setTopicsCoveredSummary] = useState<string>('');
  const [classType, setClassType] = useState<TopicClassType>('Theory');
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('Chalk & Board');
  const [studentsPresent, setStudentsPresent] = useState<number>(54);
  const [status, setStatus] = useState<TopicStatus>('Completed');
  const [remarks, setRemarks] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;

    if (initialLog) {
      setSemester(initialLog.semester);
      setSection(initialLog.section || 'A');
      setSubjectCode(initialLog.subjectCode);
      setSubjectName(initialLog.subjectName);
      setFacultyName(initialLog.facultyName || currentUser.name);
      const logDate = initialLog.presentDate || initialLog.date || initialLog.actualDate || initialLog.plannedDate || getTodayDateStr();
      setDate(logDate);
      setDayOfWeek(initialLog.day || getDayNameFromDateStr(logDate));
      setUnitNumber(initialLog.unitNumber || 1);
      setTopicTitle(initialLog.topicTitle || '');
      setTopicsCoveredSummary(initialLog.topicsCoveredSummary || '');
      setClassType(initialLog.classType || 'Theory');
      const normalizedAids: DeliveryMode = 
        initialLog.deliveryMode === 'Projector & Slides' ? 'Projector & PPT' :
        (initialLog.deliveryMode || 'Chalk & Board');
      setDeliveryMode(normalizedAids);
      setStudentsPresent(initialLog.studentsPresent ?? initialLog.attendancePercentage ?? 54);
      const normalizedStatus: TopicStatus = 
        (initialLog.status === 'Scheduled' || initialLog.status === 'Delayed') ? 'In-Progress' :
        (initialLog.status || 'Completed');
      setStatus(normalizedStatus);
      setRemarks(initialLog.remarks || '');
    } else {
      const defaultSub = (defaultSubjectCode ? availableSubjects.find(s => s.subjectCode === defaultSubjectCode) : null) || availableSubjects[0];
      const todayStr = getTodayDateStr();
      setSemester(defaultSub?.semester || 5);
      setSection(defaultSub?.section || 'A');
      setSubjectCode(defaultSub?.subjectCode || defaultSubjectCode || 'CS501');
      setSubjectName(defaultSub?.subjectName || 'Database Management Systems');
      setFacultyName(defaultSub?.facultyName || currentUser.name);
      setDate(todayStr);
      setDayOfWeek(getDayNameFromDateStr(todayStr));
      setUnitNumber(1);
      setTopicTitle('');
      setTopicsCoveredSummary('');
      setClassType('Theory');
      setDeliveryMode('Chalk & Board');
      setStudentsPresent(54);
      setStatus('Completed');
      setRemarks('');
    }
  }, [isOpen, initialLog, defaultSubjectCode]);

  const handleSubjectChange = (code: string) => {
    setSubjectCode(code);
    const sub = availableSubjects.find(s => s.subjectCode === code);
    if (sub) {
      setSubjectName(sub.subjectName);
      setSemester(sub.semester);
      if (sub.section) {
        setSection(sub.section);
      }
      if (sub.facultyName) {
        setFacultyName(sub.facultyName);
      }
    }
  };

  const handleDateChange = (newDateStr: string) => {
    setDate(newDateStr);
    setDayOfWeek(getDayNameFromDateStr(newDateStr));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalSubjectName = subjectName.trim();
    if (!topicTitle.trim() || !finalSubjectName) return;

    const finalSubjectCode = subjectCode.trim() || finalSubjectName.slice(0, 6).toUpperCase().replace(/[^A-Z0-9]/g, '') || 'SUB01';

    const payload = {
      branchId: selectedBranchId,
      semester: Number(semester),
      section: section || 'A',
      subjectCode: finalSubjectCode,
      subjectName: finalSubjectName,
      facultyName: facultyName.trim(),
      date,
      day: dayOfWeek,
      unitNumber: Number(unitNumber),
      topicTitle: topicTitle.trim(),
      topicsCoveredSummary: topicsCoveredSummary?.trim() || topicTitle.trim(),
      classType,
      deliveryMode,
      presentDate: date,
      plannedDate: date,
      actualDate: date,
      hoursSpent: Number(initialLog?.hoursSpent ?? 1),
      studentsPresent: Number(studentsPresent),
      attendancePercentage: Number(studentsPresent),
      status,
      remarks: remarks.trim()
    };

    if (initialLog) {
      updateTopicLog(initialLog.id, payload);
    } else {
      addTopicLog(payload);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialLog ? 'Edit Daily Teaching Log' : 'Record Daily Topic / Lesson Plan Log'}
      subtitle="Track syllabus coverage, instructional delivery mode, and student attendance"
      icon={<BookOpenCheck size={20} />}
      maxWidth="680px"
    >
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          {/* Branch Name & Instructor */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Branch Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. BBA / BCA / Computer Science"
                className="form-input"
                value={subjectName}
                onChange={e => setSubjectName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Faculty Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Raisa Tahseen"
                className="form-input"
                value={facultyName}
                onChange={e => setFacultyName(e.target.value)}
              />
            </div>
          </div>

          {/* Semester, Section, Unit & Day of Week */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1.3fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Semester *</label>
              <select
                className="form-select"
                value={semester}
                onChange={e => setSemester(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
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
                {['A', 'B', 'C', 'D'].map(sec => (
                  <option key={sec} value={sec}>Section {sec}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Unit Number</label>
              <select
                className="form-select"
                value={unitNumber}
                onChange={e => setUnitNumber(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(u => (
                  <option key={u} value={u}>Unit {u}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Day of Week *</label>
              <select
                className="form-select"
                value={dayOfWeek}
                onChange={e => setDayOfWeek(e.target.value)}
              >
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Topic Title */}
          <div className="form-group">
            <label className="form-label">Topic Title *</label>
            <input
              type="text"
              required
              placeholder="Enter topic title"
              className="form-input"
              value={topicTitle}
              onChange={e => setTopicTitle(e.target.value)}
            />
          </div>

          {/* Class Type, Teaching Aids & Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Class Type</label>
              <select
                className="form-select"
                value={classType}
                onChange={e => setClassType(e.target.value as TopicClassType)}
              >
                <option value="Theory">Theory</option>
                <option value="Practical">Practical</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Teaching Aids</label>
              <select
                className="form-select"
                value={deliveryMode}
                onChange={e => setDeliveryMode(e.target.value as DeliveryMode)}
              >
                <option value="Chalk & Board">Chalk & Board</option>
                <option value="Projector & PPT">Projector & PPT</option>
                <option value="Charts / Models">Charts / Models</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={status}
                onChange={e => setStatus(e.target.value as TopicStatus)}
              >
                <option value="Completed">Completed</option>
                <option value="In-Progress">In-Progress</option>
              </select>
            </div>
          </div>

          {/* Present Date & Students Present */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Present Date</label>
              <input
                type="date"
                required
                className="form-input"
                value={date}
                onChange={e => handleDateChange(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">No. of Students Present</label>
              <input
                type="number"
                min="0"
                max="300"
                placeholder="e.g. 54"
                className="form-input"
                value={studentsPresent}
                onChange={e => setStudentsPresent(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Assignment for Students */}
          <div className="form-group">
            <label className="form-label">Assignment for Students</label>
            <input
              type="text"
              placeholder="Enter assignment details"
              className="form-input"
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {initialLog ? 'Update Teaching Log' : 'Save Teaching Log'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
