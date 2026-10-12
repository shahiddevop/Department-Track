import { TimetableSlot, DailyTopicLog, DepartmentEvent, Room } from '../types';

export const exportService = {
  // Helper to trigger file download in browser
  downloadFile: (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // Export Timetable to CSV
  exportTimetableToCSV: (slots: TimetableSlot[], branchName: string, semester?: number | string) => {
    const headers = ['Day', 'Time Slot', 'Section', 'Subject Code', 'Subject Name', 'Faculty', 'Room', 'Class Type', 'Credits'];
    const rows = slots.map(slot => [
      `"${slot.day}"`,
      `"${slot.startTime} - ${slot.endTime}"`,
      `"${slot.section || 'A'}"`,
      `"${slot.subjectCode}"`,
      `"${slot.subjectName.replace(/"/g, '""')}"`,
      `"${slot.facultyName}"`,
      `"${slot.roomName}"`,
      `"${slot.type}"`,
      slot.credits || 3
    ]);

    const semLabel = semester && semester !== 'ALL' ? ` (Semester ${semester})` : ' (All Semesters)';

    const csvContent = [
      `Department Schedule - ${branchName}${semLabel}`,
      `Generated on: ${new Date().toLocaleDateString()}`,
      '',
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const fileName = `Timetable_${branchName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
    exportService.downloadFile(csvContent, fileName, 'text/csv;charset=utf-8;');
  },

  // Export Daily Teaching Logs to CSV
  exportTopicLogsToCSV: (logs: DailyTopicLog[], branchName: string, semester?: number | string) => {
    const headers = [
      'Date', 
      'Semester', 
      'Subject Code', 
      'Subject Name', 
      'Faculty', 
      'Unit No.', 
      'Topic Title', 
      'Summary Covered', 
      'Delivery Mode', 
      'Hours', 
      'Attendance %', 
      'Status', 
      'Remarks'
    ];

    const rows = logs.map(log => [
      `"${log.date}"`,
      `"Sem ${log.semester} (${log.section})"`,
      `"${log.subjectCode}"`,
      `"${log.subjectName.replace(/"/g, '""')}"`,
      `"${log.facultyName}"`,
      `"Unit ${log.unitNumber}"`,
      `"${log.topicTitle.replace(/"/g, '""')}"`,
      `"${(log.topicsCoveredSummary || '').replace(/"/g, '""')}"`,
      `"${log.deliveryMode}"`,
      log.hoursSpent,
      `${log.attendancePercentage}%`,
      `"${log.status}"`,
      `"${(log.remarks || '').replace(/"/g, '""')}"`
    ]);

    const semLabel = semester && semester !== 'ALL' ? ` (Semester ${semester})` : ' (All Semesters)';

    const csvContent = [
      `Daily Teaching & Lesson Plan Log - ${branchName}${semLabel}`,
      `Report Generated: ${new Date().toLocaleString()}`,
      '',
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const fileName = `Daily_Teaching_Logs_${branchName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
    exportService.downloadFile(csvContent, fileName, 'text/csv;charset=utf-8;');
  },

  // Export Events to CSV
  exportEventsToCSV: (events: DepartmentEvent[], branchName: string) => {
    const headers = [
      'Event Title',
      'Category',
      'Organized By',
      'Program Date',
      'Time',
      'Venue',
      'Faculty Coordinator',
      'Student Lead',
      'Created By',
      'Status',
      'Registered Count',
      'Max Capacity',
      'Budget (INR)'
    ];

    const rows = events.map(ev => [
      `"${ev.title.replace(/"/g, '""')}"`,
      `"${ev.category}"`,
      `"${ev.organizingBody || 'Dept'}"`,
      `"${ev.programDate || ev.startDate}"`,
      `"${ev.startTime} - ${ev.endTime}"`,
      `"${ev.venue.replace(/"/g, '""')}"`,
      `"${ev.facultyCoordinator}"`,
      `"${ev.studentCoordinator}"`,
      `"${ev.creatorName || ev.facultyCoordinator}"`,
      `"${ev.status}"`,
      ev.registeredCount,
      ev.maxSeats,
      ev.budget
    ]);

    const csvContent = [
      `Department Events & Programs Directory - ${branchName}`,
      `Generated on: ${new Date().toLocaleDateString()}`,
      '',
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const fileName = `Department_Events_${branchName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
    exportService.downloadFile(csvContent, fileName, 'text/csv;charset=utf-8;');
  },

  // Export Rooms & Lab Inventory to CSV
  exportRoomsToCSV: (rooms: Room[]) => {
    const headers = ['Room / Lab No.', 'Room Name', 'Type', 'Floor / Block', 'Capacity', 'Current Status', 'Key Facilities'];
    const rows = rooms.map(r => [
      `"${r.number}"`,
      `"${r.name.replace(/"/g, '""')}"`,
      `"${r.type}"`,
      `"${r.floor}"`,
      r.capacity,
      `"${r.currentStatus}"`,
      `"${r.facilities.join(', ')}"`
    ]);

    const csvContent = [
      `Department Rooms & Lab Inventory Register`,
      `Generated on: ${new Date().toLocaleDateString()}`,
      '',
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const fileName = `Rooms_Labs_Inventory_${new Date().toISOString().slice(0, 10)}.csv`;
    exportService.downloadFile(csvContent, fileName, 'text/csv;charset=utf-8;');
  },

  // Trigger System Print for current view or report page
  printCurrentView: () => {
    window.print();
  }
};
