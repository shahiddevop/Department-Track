export type UserRole = 'admin' | 'faculty' | 'student';

export type AccountStatus = 'PENDING_VERIFICATION' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  designation: string;
  branchId: string;
  branchName: string;
  avatar: string;
  phone?: string;
  qualification?: string;
  officeLocation?: string;
  bio?: string;
  isSuperAdmin?: boolean;
  status?: AccountStatus;
  registeredAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  uid?: string;
  isProvisioned?: boolean;
}

export interface Branch {
  id: string;
  code: string;
  name: string;
  hodName: string;
  hodEmail: string;
  establishedYear: number;
  totalStudents: number;
  totalFaculty: number;
  color: string;
  description: string;
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export type ClassType = 'Lecture' | 'Lab' | 'Tutorial' | 'Seminar' | 'Project';

export interface TimetableSlot {
  id: string;
  branchId: string;
  semester: number;
  section: string;
  day: DayOfWeek;
  period?: number; // 1, 2, 3, 4, 5, 6
  startTime: string;
  endTime: string;
  subjectCode: string;
  subjectName: string;
  facultyId: string;
  facultyName: string;
  roomId: string;
  roomName: string;
  type: ClassType;
  color: string;
  credits?: number;
}

export type DeliveryMode = 
  | 'Chalk & Board' 
  | 'Projector & PPT' 
  | 'Charts / Models'
  | 'Projector & Slides' 
  | 'Hands-on Lab Session' 
  | 'Interactive Discussion' 
  | 'Online / Hybrid';

export type TopicStatus = 'Completed' | 'In-Progress' | 'Scheduled' | 'Delayed';

export type TopicClassType = 'Theory' | 'Practical';

export interface DailyTopicLog {
  id: string;
  branchId: string;
  semester: number;
  section: string;
  subjectCode: string;
  subjectName: string;
  facultyName: string;
  date: string;
  day?: string;
  unitNumber: number;
  topicTitle: string;
  topicsCoveredSummary?: string;
  classType?: TopicClassType;
  deliveryMode: DeliveryMode;
  presentDate?: string;
  plannedDate?: string;
  actualDate?: string;
  hoursSpent?: number;
  studentsPresent?: number;
  attendancePercentage: number;
  status: TopicStatus;
  remarks: string;
}

export interface SubjectProgress {
  subjectCode: string;
  subjectName: string;
  facultyName: string;
  branchId: string;
  semester: number;
  totalUnits: number;
  totalPlannedHours: number;
  completedHours: number;
  completedUnits: number;
  progressPercentage: number;
}

export type EventCategory = 
  | 'Competitions'
  | 'Guest Lecture'
  | 'Awareness Session'
  | 'Seminar'
  | 'Workshop'
  | 'Field Trip'
  | 'Technical Fest' 
  | 'Hands-on Workshop' 
  | 'Hackathon' 
  | 'National Seminar' 
  | 'Faculty Development' 
  | 'Exam & Assessment' 
  | 'Industry Visit';

export type OrganizingBody = 'Dept' | 'Cell' | 'Committee' | 'Club' | (string & {});

export type EventStatus = 'Upcoming' | 'Live' | 'In Progress' | 'Completed' | 'Postponed' | 'Cancelled';

export interface DepartmentEvent {
  id: string;
  branchId: string;
  title: string;
  category: EventCategory;
  organizingBody?: OrganizingBody;
  description: string;
  startDate: string;
  endDate: string;
  programDate?: string;
  startTime: string;
  endTime: string;
  venue: string;
  roomId?: string;
  facultyCoordinator: string;
  studentCoordinator: string;
  targetAudience: string;
  budget: number;
  status: EventStatus;
  registeredCount: number;
  maxSeats: number;
  keyHighlights: string[];
  createdBy?: string;
  creatorName?: string;
}

export type RoomType = 
  | 'Lecture Hall' 
  | 'Smart Classroom' 
  | 'Computer Lab' 
  | 'Hardware / IoT Lab' 
  | 'Seminar Hall' 
  | 'Auditorium'
  | 'Life Science';

export type RoomStatus = 'Available' | 'Occupied' | 'Under Maintenance';

export interface Room {
  id: string;
  number: string;
  name: string;
  type: RoomType;
  floor: string;
  capacity: number;
  facilities: string[];
  currentStatus: RoomStatus;
  currentOccupant?: string;
  currentSubject?: string;
  currentSlotTime?: string;
  branchId?: string;
  branchName?: string;
}

export interface RoomBooking {
  id: string;
  roomId: string;
  roomNumber: string;
  branchId: string;
  bookedBy: string;
  purpose: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  timestamp: string;
}

export type NotificationPriority = 'Urgent' | 'High' | 'Normal' | 'Low';
export type NotificationCategory = 'Academic' | 'Schedule Change' | 'Event Alert' | 'Lab Booking' | 'Exam Notice' | 'Broadcast';

export interface Notification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  timestamp: string;
  targetBranch: string; // branchId or 'ALL'
  targetRole: string; // 'ALL' or 'faculty' or 'student'
  isRead: boolean;
  isUrgentBanner?: boolean;
  author: string;
}

export type TabType = 
  | 'dashboard' 
  | 'timetable' 
  | 'teaching-plan' 
  | 'events' 
  | 'rooms' 
  | 'notifications' 
  | 'reports' 
  | 'settings'
  | 'profile';
