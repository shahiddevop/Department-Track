import { 
  Branch, 
  User, 
  Room, 
  TimetableSlot, 
  DailyTopicLog, 
  DepartmentEvent, 
  RoomBooking, 
  Notification 
} from '../types';
import { 
  INITIAL_BRANCHES, 
  INITIAL_USERS, 
  INITIAL_ROOMS, 
  INITIAL_TIMETABLE, 
  INITIAL_TOPIC_LOGS, 
  INITIAL_EVENTS, 
  INITIAL_BOOKINGS, 
  INITIAL_NOTIFICATIONS 
} from './mockData';

const STORAGE_KEYS = {
  BRANCHES: 'acadpulse_branches_v3',
  CURRENT_USER: 'acadpulse_user_v3',
  SELECTED_BRANCH: 'acadpulse_selected_branch_v3',
  ROOMS: 'acadpulse_rooms_v2',
  TIMETABLE: 'acadpulse_timetable_v2',
  TOPIC_LOGS: 'acadpulse_topic_logs_v2',
  EVENTS: 'acadpulse_events_v2',
  BOOKINGS: 'acadpulse_bookings_v2',
  NOTIFICATIONS: 'acadpulse_notifications_v2',
  THEME: 'acadpulse_theme_v2'
};

export const storageService = {
  // Branches
  getBranches: (): Branch[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BRANCHES) || localStorage.getItem('acadpulse_branches_v2');
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(INITIAL_BRANCHES));
        return INITIAL_BRANCHES;
      }
      const parsed: Branch[] = JSON.parse(data);
      let updated = false;

      parsed.forEach(b => {
        // English department
        if (b.id === 'branch-cse') {
          b.code = 'ENG';
          b.name = 'English';
          b.description = 'Premier department specializing in English Language, Literature, Linguistics, and Business Communication.';
          b.totalFaculty = 12;
          if (b.hodName && (b.hodName.includes('Rajesh') || b.hodName.includes('Sharma'))) {
            b.hodName = 'Raisa Tahseen';
          }
          updated = true;
        }

        // Replace Artificial Intelligence -> Department of Computer Science
        if (b.id === 'branch-aids' || b.id === 'branch-cs' || b.code === 'AI & DS' || (b.name && b.name.includes('Artificial Intelligence'))) {
          b.id = 'branch-cs';
          b.code = 'CS';
          b.name = 'Department of Computer Science';
          b.description = 'Premier department of Computer Science offering cutting-edge education in Software Engineering, Algorithms, Operating Systems, Cloud Computing, and AI.';
          b.hodName = 'Dr. Priya Sundaram';
          b.hodEmail = 'priya.sundaram@college.edu';
          b.color = '#8b5cf6';
          b.totalFaculty = 22;
          b.totalStudents = 420;
          b.establishedYear = 2001;
          updated = true;
        }

        // Replace Electronics & Communication -> Dept of Electronics and Physics
        if (b.id === 'branch-ece' || b.id === 'branch-ep' || b.code === 'ECE' || (b.name && b.name.includes('Electronics & Communication'))) {
          b.id = 'branch-ep';
          b.code = 'EP';
          b.name = 'Dept of Electronics and Physics';
          b.description = 'Interdisciplinary program integrating Solid State Devices, Quantum Physics, Optics, Circuit Design, and Applied Electronics.';
          b.hodName = 'Dr. K. V. Ramanathan';
          b.hodEmail = 'kv.raman@college.edu';
          b.color = '#ec4899';
          b.totalFaculty = 20;
          b.totalStudents = 360;
          b.establishedYear = 2002;
          updated = true;
        }

        // Replace Information Technology -> Dept Microbiology & Biotechnology
        if (b.id === 'branch-it' || b.id === 'branch-mb' || b.code === 'IT' || (b.name && b.name.includes('Information Technology'))) {
          b.id = 'branch-mb';
          b.code = 'MB & BT';
          b.name = 'Dept Microbiology & Biotechnology';
          b.description = 'Advanced research and education in Microbial Genomics, Applied Biotechnology, Immunology, and Bioprocess Engineering.';
          b.hodName = 'Dr. S. K. Mahapatra';
          b.hodEmail = 'sk.mahapatra@college.edu';
          b.color = '#06b6d4';
          b.totalFaculty = 16;
          b.totalStudents = 300;
          b.establishedYear = 2008;
          updated = true;
        }
      });

      // Deduplicate by ID
      const uniqueBranches: Branch[] = [];
      const seenIds = new Set<string>();
      for (const b of parsed) {
        if (!seenIds.has(b.id)) {
          seenIds.add(b.id);
          uniqueBranches.push(b);
        } else {
          updated = true;
        }
      }

      // Add Department of Mathematics if missing
      if (!uniqueBranches.some(b => b.id === 'branch-math' || b.name === 'Department of Mathematics' || b.code === 'MATH')) {
        const mathBranch = INITIAL_BRANCHES.find(b => b.id === 'branch-math');
        if (mathBranch) {
          uniqueBranches.push(mathBranch);
          updated = true;
        }
      }

      // Add Department of Statistics if missing
      if (!uniqueBranches.some(b => b.id === 'branch-stat' || b.name === 'Department of Statistics' || b.code === 'STAT')) {
        const statBranch = INITIAL_BRANCHES.find(b => b.id === 'branch-stat');
        if (statBranch) {
          uniqueBranches.push(statBranch);
          updated = true;
        }
      }

      if (updated || !localStorage.getItem(STORAGE_KEYS.BRANCHES)) {
        localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(uniqueBranches));
        localStorage.setItem('acadpulse_branches_v2', JSON.stringify(uniqueBranches));
      }
      return uniqueBranches;
    } catch {
      return INITIAL_BRANCHES;
    }
  },
  setBranches: (branches: Branch[]): void => {
    localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(branches));
    localStorage.setItem('acadpulse_branches_v2', JSON.stringify(branches));
  },

  // Current User
  getCurrentUser: (): User => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || localStorage.getItem('acadpulse_user_v2');
      if (!data) return INITIAL_USERS[0];
      const parsed: User = JSON.parse(data);
      let updated = false;

      if (parsed.name && (parsed.name.includes('Rajesh') || parsed.name.includes('Sharma')) && parsed.branchId === 'branch-cse') {
        parsed.name = 'Raisa Tahseen';
        parsed.email = 'raisa.tahseen@college.edu';
        parsed.branchName = 'English';
        updated = true;
      }
      if (parsed.branchId === 'branch-cse' && (parsed.branchName === 'Computer Science & Engineering' || !parsed.branchName)) {
        parsed.branchName = 'English';
        updated = true;
      }
      if (parsed.id === 'user-hod-aids' || parsed.branchId === 'branch-aids' || (parsed.branchName && parsed.branchName.includes('Artificial Intelligence'))) {
        parsed.id = 'user-hod-cs';
        parsed.branchId = 'branch-cs';
        parsed.branchName = 'Department of Computer Science';
        updated = true;
      }
      if (parsed.id === 'user-hod-ece' || parsed.branchId === 'branch-ece' || (parsed.branchName && parsed.branchName.includes('Electronics & Communication'))) {
        parsed.id = 'user-hod-ep';
        parsed.branchId = 'branch-ep';
        parsed.branchName = 'Dept of Electronics and Physics';
        updated = true;
      }
      if (parsed.id === 'user-hod-it' || parsed.branchId === 'branch-it' || (parsed.branchName && parsed.branchName.includes('Information Technology'))) {
        parsed.id = 'user-hod-mb';
        parsed.branchId = 'branch-mb';
        parsed.branchName = 'Dept Microbiology & Biotechnology';
        updated = true;
      }
      if (parsed.role === 'student' || parsed.id === 'user-5') {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[0]));
        return INITIAL_USERS[0];
      }
      if (updated) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      return INITIAL_USERS[0];
    }
  },
  setCurrentUser: (user: User): void => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  },

  // Selected Branch ID
  getSelectedBranchId: (): string => {
    try {
      let id = localStorage.getItem(STORAGE_KEYS.SELECTED_BRANCH) || localStorage.getItem('acadpulse_selected_branch_v2');
      if (!id) return 'branch-cse';
      if (id === 'branch-aids') id = 'branch-cs';
      if (id === 'branch-ece') id = 'branch-ep';
      if (id === 'branch-it') id = 'branch-mb';
      localStorage.setItem(STORAGE_KEYS.SELECTED_BRANCH, id);
      return id;
    } catch {
      return 'branch-cse';
    }
  },
  setSelectedBranchId: (branchId: string): void => {
    localStorage.setItem(STORAGE_KEYS.SELECTED_BRANCH, branchId);
  },

  // Rooms
  getRooms: (): Room[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ROOMS);
      return data ? JSON.parse(data) : INITIAL_ROOMS;
    } catch {
      return INITIAL_ROOMS;
    }
  },
  setRooms: (rooms: Room[]): void => {
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
  },

  // Timetable
  getTimetable: (): TimetableSlot[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TIMETABLE);
      return data ? JSON.parse(data) : INITIAL_TIMETABLE;
    } catch {
      return INITIAL_TIMETABLE;
    }
  },
  setTimetable: (slots: TimetableSlot[]): void => {
    localStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(slots));
  },

  // Topic Logs
  getTopicLogs: (): DailyTopicLog[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TOPIC_LOGS);
      return data ? JSON.parse(data) : INITIAL_TOPIC_LOGS;
    } catch {
      return INITIAL_TOPIC_LOGS;
    }
  },
  setTopicLogs: (logs: DailyTopicLog[]): void => {
    localStorage.setItem(STORAGE_KEYS.TOPIC_LOGS, JSON.stringify(logs));
  },

  // Events
  getEvents: (): DepartmentEvent[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EVENTS);
      return data ? JSON.parse(data) : INITIAL_EVENTS;
    } catch {
      return INITIAL_EVENTS;
    }
  },
  setEvents: (events: DepartmentEvent[]): void => {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  },

  // Bookings
  getBookings: (): RoomBooking[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
      return data ? JSON.parse(data) : INITIAL_BOOKINGS;
    } catch {
      return INITIAL_BOOKINGS;
    }
  },
  setBookings: (bookings: RoomBooking[]): void => {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  },

  // Notifications
  getNotifications: (): Notification[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  },
  setNotifications: (notifications: Notification[]): void => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  },

  // Theme
  getTheme: (): 'dark' | 'light' => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.THEME);
      return data === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  },
  setTheme: (theme: 'dark' | 'light'): void => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  },

  // Full Department Backup Export (JSON)
  exportFullBackupJSON: () => {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      branches: storageService.getBranches(),
      rooms: storageService.getRooms(),
      timetable: storageService.getTimetable(),
      topicLogs: storageService.getTopicLogs(),
      events: storageService.getEvents(),
      bookings: storageService.getBookings(),
      notifications: storageService.getNotifications()
    };
    return JSON.stringify(backup, null, 2);
  },

  // Full Department Restore from JSON
  restoreFullBackupJSON: (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.branches) storageService.setBranches(parsed.branches);
      if (parsed.rooms) storageService.setRooms(parsed.rooms);
      if (parsed.timetable) storageService.setTimetable(parsed.timetable);
      if (parsed.topicLogs) storageService.setTopicLogs(parsed.topicLogs);
      if (parsed.events) storageService.setEvents(parsed.events);
      if (parsed.bookings) storageService.setBookings(parsed.bookings);
      if (parsed.notifications) storageService.setNotifications(parsed.notifications);
      return true;
    } catch (err) {
      console.error('Failed to parse backup JSON', err);
      return false;
    }
  },

  // Reset to Default Mock Data
  resetToDefaultData: (): void => {
    localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(INITIAL_BRANCHES));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[0]));
    localStorage.setItem(STORAGE_KEYS.SELECTED_BRANCH, 'branch-cse');
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(INITIAL_ROOMS));
    localStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(INITIAL_TIMETABLE));
    localStorage.setItem(STORAGE_KEYS.TOPIC_LOGS, JSON.stringify(INITIAL_TOPIC_LOGS));
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(INITIAL_EVENTS));
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(INITIAL_BOOKINGS));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
  }
};
